'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { checkAdminPassword, addClasificado, removeClasificado, updateClasificado } from './actions';

const TOTAL_SLOTS = 16;

export default function Home() {
  const canvasRef = useRef(null);

  // Admin Panel State
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Admin Form - Clasificados
  const [clasificados, setClasificados] = useState([]);
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

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2800);
  };

  const fetchDatos = async () => {
    if (!supabase) return;
    const { data: clas } = await supabase.from('clasificados').select('*').order('id', { ascending: true });
    if (clas) setClasificados(clas);
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  const handleAdminLogin = async () => {
    const valid = await checkAdminPassword(adminPass);
    if (valid) {
      setAdminLoggedIn(true);
    } else {
      setAdminError('Contraseña incorrecta');
      setTimeout(() => setAdminError(''), 2000);
    }
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
    if (document.getElementById('fileInputFotoHome')) {
      document.getElementById('fileInputFotoHome').value = '';
    }
    setCImgFile(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const COLORS = ['#FFD700', '#E8003D', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.15,
      });
    }

    let animationId;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      animationId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <main className="portada">
      <canvas className="pitch-canvas" ref={canvasRef}></canvas>
      <div className="hero-overlay"></div>

      <div className="portada-content">
        <div className="hero-eyebrow">
          <span className="dot red"></span>
          <span>20 años después, el PES6 más vivo que nunca</span>
          <span className="dot red"></span>
        </div>

        <h1 className="hero-title">
          <span className="line-top">VALEN</span>
          <span className="line-fulvo">FULVO</span>
          <span className="line-cup">PES ARENA</span>
        </h1>

        <div className="hero-event-box">
          <div className="event-date-block">
            <span className="event-day">21</span>
            <div className="event-detail">
              <span className="event-month">NOVIEMBRE</span>
              <span className="event-year">2026</span>
            </div>
          </div>
          <div className="event-divider"></div>
          <div className="event-place-block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <span className="event-place">MICROESTADIO</span>
              <span className="event-city">Garín, Buenos Aires</span>
            </div>
          </div>
        </div>

        <p className="hero-sub">El evento más grande de PES6.<br />16 participantes, un solo trono.</p>

        <div className="portada-buttons">
          <Link href="/evento" className="portada-btn">
            <div className="portada-btn-icon">🏟️</div>
            <div className="portada-btn-text">
              <span className="portada-btn-title">INFO DEL EVENTO</span>
              <span className="portada-btn-desc">Conocé todo sobre el PESARENA</span>
            </div>
            <div className="portada-btn-arrow">→</div>
          </Link>

          <Link href="/participantes" className="portada-btn">
            <div className="portada-btn-icon">🎮</div>
            <div className="portada-btn-text">
              <span className="portada-btn-title">CONOCÉ A LOS PARTICIPANTES</span>
              <span className="portada-btn-desc">Votá y descubrí quiénes compiten</span>
            </div>
            <div className="portada-btn-arrow">→</div>
          </Link>

          <Link href="/clasificar" className="portada-btn">
            <div className="portada-btn-icon">🏆</div>
            <div className="portada-btn-text">
              <span className="portada-btn-title">QUIERO CLASIFICAR</span>
              <span className="portada-btn-desc">Anotate como jugador o influencer</span>
            </div>
            <div className="portada-btn-arrow">→</div>
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat"><span className="stat-n">16</span><span className="stat-l">Participantes</span></div>
          <div className="stat-sep"></div>
          <div className="stat"><span className="stat-n">1</span><span className="stat-l">Gran Final</span></div>
          <div className="stat-sep"></div>
          <div className="stat"><span className="stat-n">🔥</span><span className="stat-l">Experiencia Única</span></div>
        </div>

        <div className="portada-footer-inner" style={{ flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
          <a href="https://wa.me/543816232650?text=Hola%20Mart%C3%ADn!%20Vi%20tu%20trabajo%20en%20la%20p%C3%A1gina%20de%20ValenFulvo%20y%20me%20gustar%C3%ADa%20consultar%20por%20tus%20servicios%20de%20desarrollo." target="_blank" rel="noopener noreferrer" className="portada-credit">
            Desarrollado por <span>Martín Castillo</span>
          </a>

          <div>
            <button
              onClick={() => setShowAdmin(true)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.4)',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.target.style.color = 'var(--gold)'; e.target.style.borderColor = 'var(--gold)'; }}
              onMouseLeave={(e) => { e.target.style.color = 'rgba(255,255,255,0.4)'; e.target.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            >
              ⚙️ MÓDULO ADMIN
            </button>
          </div>
        </div>
      </div>

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
                  <input type="file" id="fileInputFotoHome" accept="image/*" onChange={e => { if (e.target.files && e.target.files[0]) setCImgFile(e.target.files[0]) }} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px' }} />
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
                {clasificados.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {c.nick}
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
                      <div style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>{c.equipo || 'Sin Equipo'}</div>
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
