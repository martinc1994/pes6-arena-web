'use server'

import { supabaseServer as supabase } from '@/lib/supabaseServer'
import { headers } from 'next/headers'

const verifyPassword = (password) => {
  if (password !== process.env.ADMIN_PASSWORD) return false;
  return true;
};

export async function checkAdminPassword(password) {
  return verifyPassword(password);
}

export async function addClasificado(password, nick, foto, desc_text, equipo = '', edad = '', localidad = '', historia = '', youtube_links = [], tipo = 'campeon') {
  if (!verifyPassword(password)) return { error: "Contraseña incorrecta" };
  const { data, error } = await supabase.from('clasificados').insert([{ 
    nick, foto, desc_text, equipo, edad, localidad, historia, youtube_links, tipo 
  }]).select();
  if (error) return { error: "Error al guardar en base de datos" };
  return { success: true, data };
}

export async function updateClasificado(password, id, updates) {
  if (!verifyPassword(password)) return { error: "Contraseña incorrecta" };
  const { data, error } = await supabase.from('clasificados').update(updates).eq('id', id).select();
  if (error) return { error: "Error al actualizar en base de datos" };
  return { success: true, data };
}

export async function removeClasificado(password, id) {
  if (!verifyPassword(password)) return { error: "Contraseña incorrecta" };
  const { error } = await supabase.from('clasificados').delete().eq('id', id);
  if (error) return { error: "Error al eliminar en base de datos" };
  return { success: true };
}

export async function voteClasificado(id, type) {
  try {
    if (!supabase) return { error: "Supabase no disponible" };
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const userIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentVotes } = await supabase
      .from('votes_log')
      .select('id')
      .eq('ip_address', userIp)
      .gte('created_at', oneDayAgo);
      
    if (recentVotes && recentVotes.length >= 2) {
      return { error: "Límite alcanzado: 2 votos por dispositivo cada 24hs." };
    }
    
    await supabase.from('votes_log').insert([{ ip_address: userIp }]);
    
    const { data: clas, error: findErr } = await supabase
      .from('clasificados')
      .select('id, likes, dislikes')
      .eq('id', id)
      .single();
      
    if (findErr || !clas) return { error: "Participante no encontrado" };
    
    // Si es CABRA (id 33), asegurar base de 88 likes y 4 dislikes
    let currentLikes = clas.likes || 0;
    let currentDislikes = clas.dislikes || 0;
    if (Number(id) === 33) {
      if (currentLikes < 88) currentLikes = 88;
      if (currentDislikes < 4) currentDislikes = 4;
    }

    const update = type === 'like'
      ? { likes: currentLikes + 1, dislikes: currentDislikes }
      : { likes: currentLikes, dislikes: currentDislikes + 1 };

    const { error: updErr } = await supabase
      .from('clasificados')
      .update(update)
      .eq('id', id);

    if (updErr) {
      console.error("Error al actualizar voto en Supabase:", updErr);
      return { error: "Error al registrar voto en base de datos" };
    }
    
    return { success: true, likes: update.likes, dislikes: update.dislikes };
  } catch (err) {
    console.error("Error en voteClasificado:", err);
    return { error: "Error de conexión al registrar voto" };
  }
}

export async function saveSorteoDefinitivo(password, bracketData) {
  if (!verifyPassword(password)) return { error: "Contraseña incorrecta" };
  try {
    if (!supabase) return { error: "Supabase no está configurado" };

    const payload = {
      id: 1,
      nombre: 'PES6 ARENA 2026 - Gran Final',
      fecha: '2026-11-22',
      partidos: bracketData
    };

    const { data, error } = await supabase
      .from('torneos')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn("Error en upsert torneos, probando update/insert:", error);
      const { data: updateData, error: updateErr } = await supabase
        .from('torneos')
        .update({ partidos: bracketData })
        .eq('id', 1)
        .select();

      if (updateErr || !updateData || updateData.length === 0) {
        const { data: insertData, error: insertErr } = await supabase
          .from('torneos')
          .insert(payload)
          .select();
        if (insertErr) return { error: "Error en base de datos: " + insertErr.message };
        return { success: true, data: insertData };
      }
      return { success: true, data: updateData };
    }

    return { success: true, data };
  } catch (err) {
    return { error: err.message || "Error al guardar el sorteo definitivo" };
  }
}

export async function getSorteoDefinitivo() {
  try {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('torneos')
      .select('*')
      .order('id', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) return null;
    return data[0]?.partidos || null;
  } catch (err) {
    return null;
  }
}

export async function resetSorteoDefinitivo(password) {
  if (!verifyPassword(password)) return { error: "Contraseña incorrecta" };
  try {
    if (!supabase) return { success: true };
    await supabase.from('torneos').delete().neq('id', 0);
    return { success: true };
  } catch (err) {
    return { error: err.message };
  }
}
