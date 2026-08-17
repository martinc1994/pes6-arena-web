'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAdminPassword, addClasificado, removeClasificado, updateClasificado, voteClasificado } from '../actions';
import Link from 'next/link';

const TOTAL_SLOTS = 16;

export default function ParticipantesPage() {
  const [toastMsg, setToastMsg] = useState(null);
  const [clasificados, setClasificados] = useState([]);

  // Admin Panel
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');

  // Admin Form - Clasificados
  const [cNick, setCNick] = useState('');
  const [cImgFile, setCImgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cDesc, setCDesc] = useState('');
  const [cEquipo, setCEquipo] = useState('');
  const [cEdad, setCEdad] = useState('');
  const [cLocalidad, setCLocalidad] = useState('');
  const [cHistoria, setCHistoria] = useState('');
  const [cYoutube1, setCYoutube1] = useState('');
  const [cYoutube2, setCYoutube2] = useState('');
  const [cYoutube3, setCYoutube3] = useState('');
  const [cTipo, setCTipo] = useState('campeon');
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Detail Modal
  const [selectedChampion, setSelectedChampion] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2800);
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        videoId = match[2];
      }
    } catch (e) {
      console.error("Error parsing youtube url", e);
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const getNickAndEquipo = (c) => {
    if (c.equipo) {
      return { name: c.nick, team: c.equipo };
    }
    if (c.nick && c.nick.includes(' - ')) {
      const parts = c.nick.split(' - ');
      return { name: parts[0], team: parts[1] };
    }
    return { name: c.nick || '', team: '' };
  };

  const getBadgeInfo = (c) => {
    if (c.tipo === 'influencer') {
      return { text: 'INFLUENCER', className: 'badge-influencer' };
    }
    return { text: c.desc_text || 'CLASIFICADO', className: 'badge-campeon' };
  };

  const startEdit = (c) => {
    setEditMode(true);
    setEditingId(c.id);
    setCNick(c.nick || '');
    setCDesc(c.desc_text || '');
    setCEquipo(c.equipo || '');
    setCEdad(c.edad || '');
    setCLocalidad(c.localidad || '');
    setCHistoria(c.historia || '');
    setCYoutube1(c.youtube_links?.[0] || '');
    setCYoutube2(c.youtube_links?.[1] || '');
    setCYoutube3(c.youtube_links?.[2] || '');
    setCTipo(c.tipo || 'campeon');
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingId(null);
    setCNick('');
    setCDesc('');
    setCEquipo('');
    setCEdad('');
    setCLocalidad('');
    setCHistoria('');
    setCYoutube1('');
    setCYoutube2('');
    setCYoutube3('');
    setCTipo('campeon');
    if (document.getElementById('fileInputFoto')) {
      document.getElementById('fileInputFoto').value = '';
    }
    setCImgFile(null);
  };

  const fetchDatos = async () => {
    if (!supabase) return;
    const { data: clas } = await supabase.from('clasificados').select('*').order('id', { ascending: true });
    if (clas) setClasificados(clas);
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  useEffect(() => {
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    fadeEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [clasificados]);

  const handleVote = async (id, type) => {
    try {
      const res = await voteClasificado(id, type);
      if (res && res.error) {
        showToast(res.error, 'warning');
        return;
      }
      showToast(type === 'like' ? '👍 Voto positivo registrado!' : '👎 Voto negativo registrado!', 'success');
      fetchDatos();
    } catch (e) {
      showToast('Ocurrió un error al votar.', 'warning');
    }
  };

  const handleAdminLogin = async () => {
    const valid = await checkAdminPassword(adminPass);
    if (valid) {
      setAdminLoggedIn(true);
    } else {
      setAdminError('Contraseña incorrecta');
      setTimeout(() => setAdminError(''), 2000);
    }
  };

  // Build 16-slot array
  const slots = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    if (i < clasificados.length) {
      slots.push(clasificados[i]);
    } else {
      slots.push(null); // vacant
    }
  }

  return (
    <main>
      <nav className="navbar scrolled" id="navbar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span className="logo-vf">VF</span>
            <span className="logo-cup">PES6</span>
          </Link>
          <ul className="nav-links">
            <li><Link href="/evento">Evento</Link></li>
            <li><Link href="/clasificar">Clasificar</Link></li>
          </ul>
          <Link href="/" className="nav-back-btn">← VOLVER</Link>
        </div>
      </nav>

      <section className="section-clasificados" id="clasificados" style={{paddingTop: '7rem'}}>
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">PARTICIPANTES</span>
          <span className="label-line"></span>
        </div>
        <h2 className="section-title centered">Conocé a los que<br /><em>van a competir</em></h2>
        <p className="section-sub centered">Campeones de microtorneos e influencers confirmados para la Gran Final. Votá a tu favorito.</p>

        <div className="voting-notice">
          <span>⚡</span>
          <span>Votación activa — 2 votos por dispositivo cada 24 horas</span>
        </div>

        <div className="clasificados-grid">
          {slots.map((c, idx) => {
            if (c) {
              const { name, team } = getNickAndEquipo(c);
              const badge = getBadgeInfo(c);
              return (
                <div key={c.id} className="champion-card fade-in visible" onClick={() => setSelectedChampion(c)} style={{ cursor: 'pointer' }}>
                  <div className={`champion-badge ${badge.className}`}>{badge.text}</div>
                  {c.foto ? (
                    <img className="champion-photo" src={c.foto} alt={name} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                  ) : null}
                  <div className="champion-photo-placeholder" style={{ display: c.foto ? 'none' : 'flex' }}>🎮</div>

                  <div className="champion-info">
                    <div className="champion-nick">{name}</div>
                    <div className="champion-desc" style={{ color: 'var(--gold)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1.5px', fontSize: '0.8rem', marginTop: '0.2rem' }}>{team || 'Sin Equipo'}</div>
                    <div className="vote-btns" style={{ marginTop: '0.75rem' }}>
                      <button className="vote-btn like" onClick={(e) => { e.stopPropagation(); handleVote(c.id, 'like'); }}>
                        👍 <span>{c.likes || 0}</span>
                      </button>
                      <button className="vote-btn dislike" onClick={(e) => { e.stopPropagation(); handleVote(c.id, 'dislike'); }}>
                        👎 <span>{c.dislikes || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={`vacant-${idx}`} className="champion-card champion-card-vacant fade-in visible">
                  <div className="champion-badge badge-vacant">VACANTE</div>
                  <div className="champion-photo-placeholder vacant-placeholder">
                    <span className="vacant-question">?</span>
                  </div>
                  <div className="champion-info">
                    <div className="champion-nick" style={{ color: 'var(--grey)' }}>Por definir</div>
                    <div className="champion-desc" style={{ color: 'rgba(255,255,255,0.15)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1.5px', fontSize: '0.8rem', marginTop: '0.2rem' }}>Lugar #{idx + 1}</div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      </section>

      <footer className="footer" style={{ background: 'var(--black2)', padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-logo" style={{ justifyContent: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span className="logo-vf" style={{ color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem' }}>VF</span>
          <span className="logo-cup" style={{ color: 'var(--red)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', marginLeft: '5px' }}>PES6</span>
        </div>
        <p style={{ color: 'var(--grey)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>El PES6 más grande de Argentina</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Inicio</Link>
          <Link href="/evento" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Evento</Link>
          <Link href="/participantes" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem' }}>Participantes</Link>
          <Link href="/clasificar" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Clasificar</Link>
        </div>
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <a href="https://wa.me/543816232650?text=Hola%20Mart%C3%ADn!%20Vi%20tu%20trabajo%20en%20la%20p%C3%A1gina%20de%20ValenFulvo%20y%20me%20gustar%C3%ADa%20consultar%20por%20tus%20servicios%20de%20desarrollo." target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Desarrollado por <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Martín Castillo</span>
          </a>
          <div style={{ marginTop: '1.5rem' }}>
            <button onClick={() => setShowAdmin(true)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.1)', fontSize: '0.7rem', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>MODULO ADMIN</button>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '5rem', left: '50%', transform: 'translateX(-50%)',
          background: toastMsg.type === 'warning' ? '#9e0029' : '#0d2a18',
          border: `1px solid ${toastMsg.type === 'warning' ? '#E8003D' : '#28c850'}`,
          color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', zIndex: 999, fontWeight: 600
        }}>
          {toastMsg.msg}
        </div>
      )}

      {/* Admin Overlay */}
      <div className={`admin-overlay ${showAdmin ? 'active' : ''}`} onClick={(e) => { if (e.target.className.includes('admin-overlay')) setShowAdmin(false) }}>
        <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
          <div className="admin-header">
            <h2>Panel Administrador</h2>
            <button className="admin-close" onClick={() => setShowAdmin(false)}>✕</button>
          </div>

          {!adminLoggedIn ? (
            <div className="admin-login">
              <p>Acceso restringido</p>
              <input type="password" value={adminPass} onChange={e => setAdminPass(e.target.value)} placeholder="Contraseña" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '8px' }} />
              <button className="btn-primary" onClick={handleAdminLogin} style={{ padding: '0.75rem', border: 'none', background: 'var(--gold)', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>INGRESAR</button>
              {adminError && <p style={{ color: 'var(--red)' }}>{adminError}</p>}
            </div>
          ) : (
            <div className="admin-content">
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                Gestión de Participantes ({clasificados.length}/{TOTAL_SLOTS})
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {editMode ? 'Editar Participante' : 'Agregar Nuevo Participante'}
                </div>

                <input type="text" placeholder="Nick / Nombre" value={cNick} onChange={e => setCNick(e.target.value)} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                <input type="text" placeholder="Equipo (ej: ARSENAL)" value={cEquipo} onChange={e => setCEquipo(e.target.value)} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />

                {/* TIPO selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--grey)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Tipo de Participante</label>
                  <select value={cTipo} onChange={e => setCTipo(e.target.value)} style={{ padding: '8px', background: 'var(--dark)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }}>
                    <option value="campeon">🏆 Campeón de Torneo</option>
                    <option value="influencer">🎙️ Influencer</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" placeholder="Edad (ej: 25 años)" value={cEdad} onChange={e => setCEdad(e.target.value)} style={{ padding: '8px', flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                  <input type="text" placeholder="Localidad (ej: Buenos Aires)" value={cLocalidad} onChange={e => setCLocalidad(e.target.value)} style={{ padding: '8px', flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                </div>

                <textarea placeholder="Historia / Descripción detallada" value={cHistoria} onChange={e => setCHistoria(e.target.value)} rows={3} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical', fontFamily: 'inherit', borderRadius: '6px' }} />

                <div style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--grey)', fontWeight: 'bold' }}>Videos de YouTube (Hasta 3 links)</span>
                  <input type="text" placeholder="Link de YouTube 1" value={cYoutube1} onChange={e => setCYoutube1(e.target.value)} style={{ padding: '6px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                  <input type="text" placeholder="Link de YouTube 2" value={cYoutube2} onChange={e => setCYoutube2(e.target.value)} style={{ padding: '6px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                  <input type="text" placeholder="Link de YouTube 3" value={cYoutube3} onChange={e => setCYoutube3(e.target.value)} style={{ padding: '6px', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontSize: '0.7rem', color: 'var(--grey)' }}>Foto del Participante {editMode && '(dejar en blanco para mantener la actual)'}</label>
                  <input type="file" id="fileInputFoto" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setCImgFile(e.target.files[0]) }} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
                </div>

                <input type="text" placeholder={cTipo === 'influencer' ? 'Detalle (ej: Streamer de PES6)' : 'Detalle / Badge (ej: Campeón Torneo #3)'} value={cDesc} onChange={e => setCDesc(e.target.value)} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />

                <button className="btn-primary" disabled={uploading || (!editMode && clasificados.length >= TOTAL_SLOTS)} style={{ padding: '10px', background: uploading ? 'var(--grey)' : 'var(--gold)', border: 'none', fontWeight: 'bold', borderRadius: '5px', marginTop: '5px', cursor: 'pointer' }} onClick={async () => {
                  if (!cNick) return showToast('El Nick es obligatorio', 'warning');
                  if (!editMode && clasificados.length >= TOTAL_SLOTS) return showToast('Máximo 16 participantes alcanzado', 'warning');
                  try {
                    setUploading(true);
                    let fotoUrl = editMode ? (clasificados.find(x => x.id === editingId)?.foto || '') : '';
                    if (cImgFile) {
                      const fileExt = cImgFile.name.split('.').pop();
                      const fileName = `${Date.now()}.${fileExt}`;
                      if (!supabase) throw new Error('Supabase no configurado');
                      const { data, error } = await supabase.storage.from('campeones').upload(fileName, cImgFile);
                      if (error) throw new Error('Error al subir imagen a Supabase');
                      const { data: { publicUrl } } = supabase.storage.from('campeones').getPublicUrl(fileName);
                      fotoUrl = publicUrl;
                    }

                    const youtube_links = [cYoutube1, cYoutube2, cYoutube3].filter(Boolean);

                    if (editMode) {
                      const res = await updateClasificado(adminPass, editingId, {
                        nick: cNick,
                        foto: fotoUrl,
                        desc_text: cDesc,
                        equipo: cEquipo,
                        edad: cEdad,
                        localidad: cLocalidad,
                        historia: cHistoria,
                        youtube_links,
                        tipo: cTipo
                      });
                      if (res && res.error) { showToast(res.error, 'warning'); setUploading(false); return; }
                      showToast('Participante actualizado');
                    } else {
                      const res = await addClasificado(adminPass, cNick, fotoUrl, cDesc, cEquipo, cEdad, cLocalidad, cHistoria, youtube_links, cTipo);
                      if (res && res.error) { showToast(res.error, 'warning'); setUploading(false); return; }
                      showToast('Participante agregado');
                    }

                    cancelEdit();
                    fetchDatos();
                  } catch (e) { showToast(e.message || 'Error al guardar', 'warning'); } finally { setUploading(false); }
                }}>{uploading ? 'GUARDANDO...' : (editMode ? 'GUARDAR CAMBIOS' : (clasificados.length >= TOTAL_SLOTS ? 'MÁXIMO ALCANZADO' : 'AGREGAR PARTICIPANTE'))}</button>

                {editMode && (
                  <button className="btn-ghost" style={{ padding: '8px', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }} onClick={cancelEdit}>CANCELAR EDICIÓN</button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {clasificados.map(c => {
                  const { name, team } = getNickAndEquipo(c);
                  const badge = getBadgeInfo(c);
                  return (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {name}
                          <span style={{
                            fontSize: '0.6rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: c.tipo === 'influencer' ? 'linear-gradient(45deg, #f09433, #dc2743)' : 'rgba(255,215,0,0.2)',
                            color: c.tipo === 'influencer' ? '#fff' : 'var(--gold)',
                            fontWeight: 900,
                            letterSpacing: '1px',
                            textTransform: 'uppercase'
                          }}>
                            {c.tipo === 'influencer' ? 'INFLUENCER' : 'CAMPEÓN'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{team || 'Sin Equipo'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }} onClick={() => startEdit(c)}>✏️</button>
                        <button style={{ background: 'rgba(232,0,61,0.2)', border: '1px solid var(--red)', color: 'var(--red)', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }} onClick={async () => {
                          if (confirm('¿Eliminar?')) {
                            await removeClasificado(adminPass, c.id);
                            fetchDatos();
                          }
                        }}>✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal (Detalle Participante) */}
      {selectedChampion && (() => {
        const { name, team } = getNickAndEquipo(selectedChampion);
        const badge = getBadgeInfo(selectedChampion);
        const embedUrls = (selectedChampion.youtube_links || [])
          .map(link => getYoutubeEmbedUrl(link))
          .filter(Boolean);

        return (
          <div className="details-overlay active" onClick={() => setSelectedChampion(null)}>
            <div className="details-modal" onClick={e => e.stopPropagation()}>
              <button className="details-close" onClick={() => setSelectedChampion(null)}>✕</button>

              <div className="details-body">
                <div className="details-left">
                  <div className="details-img-wrapper">
                    {selectedChampion.foto ? (
                      <img className="details-img" src={selectedChampion.foto} alt={name} />
                    ) : (
                      <div className="details-placeholder">🎮</div>
                    )}
                  </div>

                  <div className="details-stats">
                    <div className="details-stat-item">
                      <span className="details-stat-label">Tipo</span>
                      <span className="details-stat-value" style={{ color: selectedChampion.tipo === 'influencer' ? '#dc2743' : 'var(--gold)' }}>
                        {selectedChampion.tipo === 'influencer' ? '🎙️ Influencer' : '🏆 Campeón'}
                      </span>
                    </div>
                    <div className="details-stat-item">
                      <span className="details-stat-label">Edad</span>
                      <span className="details-stat-value">{selectedChampion.edad || 'No especificada'}</span>
                    </div>
                    <div className="details-stat-item">
                      <span className="details-stat-label">Residencia</span>
                      <span className="details-stat-value">{selectedChampion.localidad || 'No especificada'}</span>
                    </div>
                    <div className="details-stat-item">
                      <span className="details-stat-label">Votos Positivos</span>
                      <span className="details-stat-value" style={{ color: '#28c850' }}>👍 {selectedChampion.likes || 0}</span>
                    </div>
                    <div className="details-stat-item">
                      <span className="details-stat-label">Votos Negativos</span>
                      <span className="details-stat-value" style={{ color: 'var(--red)' }}>👎 {selectedChampion.dislikes || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="details-right">
                  <div className="details-title">
                    <h2>{name}</h2>
                    <div className="team">{team || 'Sin Equipo'}</div>
                    {selectedChampion.desc_text && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--grey-light)', fontStyle: 'italic' }}>{selectedChampion.desc_text}</div>
                    )}
                  </div>

                  <div className="details-history">
                    <h3>{selectedChampion.tipo === 'influencer' ? 'Sobre el Influencer' : 'Historia del Participante'}</h3>
                    <p>{selectedChampion.historia || 'Este participante aún no tiene una historia redactada.'}</p>
                  </div>

                  {embedUrls.length > 0 && (
                    <div className="details-videos">
                      <h3>Clips y Mejores Momentos</h3>
                      <div className="details-video-grid">
                        {embedUrls.map((url, idx) => (
                          <div key={idx} className="details-video-wrapper">
                            <iframe
                              src={url}
                              title={`Video ${idx + 1}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
