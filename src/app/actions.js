'use server'

import { supabase } from '@/lib/supabase'
import { headers } from 'next/headers'

const verifyPassword = (password) => {
  if (password !== process.env.ADMIN_PASSWORD) throw new Error("Contraseña incorrecta");
};

export async function checkAdminPassword(password) {
  try {
    verifyPassword(password);
    return true;
  } catch (e) {
    return false;
  }
}

export async function addClasificado(password, nick, foto, desc_text) {
  verifyPassword(password);
  const { data, error } = await supabase.from('clasificados').insert([{ nick, foto, desc_text }]).select();
  if (error) throw error;
  return data;
}

export async function removeClasificado(password, id) {
  verifyPassword(password);
  const { error } = await supabase.from('clasificados').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function createTorneo(password, nombre, fecha, modalidad, partidos) {
  verifyPassword(password);
  const { data, error } = await supabase.from('torneos').insert([{ nombre, fecha, modalidad, partidos }]).select();
  if (error) throw error;
  return data;
}

export async function updateTorneo(password, id, updates) {
  verifyPassword(password);
  const { error } = await supabase.from('torneos').update(updates).eq('id', id);
  if (error) throw error;
  return true;
}

export async function removeTorneo(password, id) {
  verifyPassword(password);
  const { error } = await supabase.from('torneos').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function voteClasificado(id, type) {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const userIp = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
  
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recentVotes, error: countErr } = await supabase
    .from('votes_log')
    .select('id')
    .eq('ip_address', userIp)
    .gte('created_at', oneDayAgo);
    
  if (recentVotes && recentVotes.length >= 2) throw new Error("Límite de votos alcanzado (2 por dispositivo cada 24hs).");
  
  await supabase.from('votes_log').insert([{ ip_address: userIp }]);
  
  const { data: clas } = await supabase.from('clasificados').select('likes, dislikes').eq('id', id).single();
  if (!clas) throw new Error("Jugador no encontrado");
  
  const update = type === 'like' ? { likes: clas.likes + 1 } : { dislikes: clas.dislikes + 1 };
  const { error } = await supabase.from('clasificados').update(update).eq('id', id);
  if (error) throw error;
  
  return true;
}
