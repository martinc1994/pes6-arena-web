'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { checkAdminPassword, addClasificado, removeClasificado, updateClasificado } from './actions';
import ThemeToggle from '@/components/ThemeToggle';
import { getClasificadosConVotos } from '@/lib/participantes';

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
  const [clasificados, setClasificados] = useState(() => getClasificadosConVotos());
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

  // Cuenta regresiva para el evento (22 de Noviembre 2026, 12:00 hs Argentina UTC-3)
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const EVENT_TARGET = new Date('2026-11-22T12:00:00-03:00').getTime();

    const updateCountdown = () => {
      const now = Date.now();
      const diff = EVENT_TARGET - now;
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true });
        return;
      }
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isLive: false
      });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2800);
  };

  const fetchDatos = async () => {
    try {
      if (!supabase) return;
      const { data: clas } = await supabase.from('clasificados').select('*').order('id', { ascending: true });
      if (clas && clas.length > 0) {
        const sorted = [...clas].sort((a, b) => {
          const infA = a.tipo === 'influencer' ? 1 : 0;
          const infB = b.tipo === 'influencer' ? 1 : 0;
          if (infA !== infB) return infB - infA;
          return a.id - b.id;
        });
        setClasificados(sorted);
      }
    } catch (e) {
      console.warn("No se pudo conectar a Supabase, usando datos locales:", e);
    }
  };

  useEffect(() => {
    fetchDatos();
    try {
      const isLogged = localStorage.getItem('pes6_admin_logged') === 'true' || sessionStorage.getItem('pes6_admin_logged') === 'true';
      if (isLogged) {
        setAdminLoggedIn(true);
        const savedPass = localStorage.getItem('pes6_admin_pass') || sessionStorage.getItem('pes6_admin_pass') || '';
        if (savedPass) setAdminPass(savedPass);
      }
    } catch (e) {}
  }, []);

  const handleAdminLogin = async () => {
    const valid = await checkAdminPassword(adminPass);
    if (valid) {
      setAdminLoggedIn(true);
      try {
        localStorage.setItem('pes6_admin_logged', 'true');
        localStorage.setItem('pes6_admin_pass', adminPass);
        sessionStorage.setItem('pes6_admin_logged', 'true');
        sessionStorage.setItem('pes6_admin_pass', adminPass);
      } catch (e) {}
    } else {
      setAdminError('Contraseña incorrecta');
      setTimeout(() => setAdminError(''), 2000);
    }
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    setAdminPass('');
    try {
      localStorage.removeItem('pes6_admin_logged');
      localStorage.removeItem('pes6_admin_pass');
      sessionStorage.removeItem('pes6_admin_logged');
      sessionStorage.removeItem('pes6_admin_pass');
    } catch (e) {}
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
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <ThemeToggle />
      </div>
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

        {/* Acceso Directo al Canal de Kick del Streamer */}
        <div className="kick-stream-bar">
          <a
            href="https://kick.com/valenfulvo"
            target="_blank"
            rel="noopener noreferrer"
            className="kick-stream-pill"
          >
            <span className="kick-live-pulse"></span>
            <span className="kick-pill-logo">KICK</span>
            <span className="kick-pill-sep">·</span>
            <span className="kick-pill-name">VALENFULVO</span>
            <span className="kick-pill-badge">CANAL EN VIVO</span>
            <span className="kick-pill-arrow">→</span>
          </a>
        </div>

        {/* Contenedor del Evento y Cuenta Regresiva */}
        <div className="hero-event-container">
          <div className="hero-event-box" style={{ marginBottom: 0 }}>
            <div className="event-date-block">
              <span className="event-day">22</span>
              <div className="event-detail">
                <span className="event-month">NOVIEMBRE</span>
                <span className="event-year">2026 · 12:00 HS</span>
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

          {/* Caja de Cuenta Regresiva Adaptativa */}
          <div className="hero-countdown-box">
            <div className="countdown-header">
              <span className="kick-live-pulse" style={{ background: 'var(--gold)', boxShadow: '0 0 8px var(--gold)' }}></span>
              <span className="countdown-live-badge">
                {countdown?.isLive ? '¡EL EVENTO YA ESTÁ EN VIVO!' : 'CUENTA REGRESIVA PARA EL EVENTO · INICIA 12:00 HS'}
              </span>
            </div>
            <div className="countdown-tiles">
              <div className="countdown-tile">
                <span className="countdown-digit">{countdown ? String(countdown.days).padStart(2, '0') : '00'}</span>
                <span className="countdown-unit">Días</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-tile">
                <span className="countdown-digit">{countdown ? String(countdown.hours).padStart(2, '0') : '00'}</span>
                <span className="countdown-unit">Horas</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-tile">
                <span className="countdown-digit">{countdown ? String(countdown.minutes).padStart(2, '0') : '00'}</span>
                <span className="countdown-unit">Min</span>
              </div>
              <span className="countdown-colon">:</span>
              <div className="countdown-tile">
                <span className="countdown-digit">{countdown ? String(countdown.seconds).padStart(2, '0') : '00'}</span>
                <span className="countdown-unit">Seg</span>
              </div>
            </div>

            {/* Botón de Google Maps */}
            <div style={{ textAlign: 'center', marginTop: '0.85rem' }}>
              <a
                href="https://maps.app.goo.gl/xgT5NWWxgguvCuZa7"
                target="_blank"
                rel="noopener noreferrer"
                className="countdown-maps-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>UBI EN MAPS →</span>
              </a>
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

          <Link href="/llaves" className="portada-btn" style={{ borderColor: 'rgba(255, 215, 0, 0.4)' }}>
            <div className="portada-btn-icon">⚡</div>
            <div className="portada-btn-text">
              <span className="portada-btn-title" style={{ color: 'var(--gold)' }}>LLAVES DEL TORNEO</span>
              <span className="portada-btn-desc">Mirá el cuadro y los cruces de Octavos</span>
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
              title="Acceso Admin"
              aria-label="Acceso Admin"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.35)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.background = 'rgba(255,215,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            >
              ⚙️
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Panel Administrador</h2>
              {adminLoggedIn && (
                <span style={{ fontSize: '0.65rem', background: '#00c853', color: '#000', fontWeight: 900, padding: '2px 6px', borderRadius: '4px' }}>
                  CONECTADO
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {adminLoggedIn && (
                <button
                  type="button"
                  onClick={handleAdminLogout}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'var(--grey-light)', fontSize: '0.7rem', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cerrar Sesión
                </button>
              )}
              <button className="admin-close" onClick={() => setShowAdmin(false)}>✕</button>
            </div>
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
              {/* Acceso al Sorteo de Llaves y Carga de Resultados */}
              <div style={{ background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.12), rgba(0, 200, 83, 0.12))', border: '1px solid var(--gold)', padding: '14px', borderRadius: '8px', marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    ⚽ Cuadro y Resultados del Evento
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--grey-light)', marginTop: '2px' }}>
                    Cargá los goles de los partidos en vivo a medida que transcurra el torneo.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Link
                    href="/llaves?admin=true&action=resultados"
                    style={{
                      background: 'linear-gradient(135deg, #00c853, #009624)',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onClick={() => {
                      sessionStorage.setItem('pes6_admin_logged', 'true');
                      sessionStorage.setItem('pes6_admin_pass', adminPass);
                      try {
                        localStorage.setItem('pes6_admin_logged', 'true');
                        localStorage.setItem('pes6_admin_pass', adminPass);
                      } catch (e) {}
                    }}
                  >
                    ⚽ Cargar Resultados de Llaves →
                  </Link>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Gestión de Participantes ({clasificados.length}/{TOTAL_SLOTS})
              </div>

              {/* Aviso para reemplazos seguros en llaves */}
              <div style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.3)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--gold)', marginBottom: '14px', lineHeight: 1.5 }}>
                ℹ️ <strong>Cupos completos y llaves sorteadas:</strong> Para realizar un reemplazo de jugador, pulsá <strong>✏️ EDITAR / REEMPLAZAR</strong> en la lista de abajo. Así se actualiza su nombre, equipo y foto manteniendo automáticamente su lugar en el cuadro del torneo.
              </div>

              <div id="admin-edit-form-anchor" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {editMode ? `Editar / Reemplazar Participante (${cNick || 'Seleccionado'})` : 'Formulario de Participante'}
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
                }}>{uploading ? 'GUARDANDO...' : (editMode ? 'GUARDAR REEMPLAZO / CAMBIOS' : (clasificados.length >= TOTAL_SLOTS ? 'MÁXIMO ALCANZADO (SELECCIONAR ABAJO)' : 'AGREGAR PARTICIPANTE'))}</button>

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
                      <button
                        style={{
                          background: 'rgba(255,215,0,0.15)',
                          border: '1px solid var(--gold)',
                          color: 'var(--gold)',
                          padding: '6px 12px',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        onClick={() => {
                          startEdit(c);
                          const el = document.getElementById('admin-edit-form-anchor');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        ✏️ EDITAR / REEMPLAZAR
                      </button>
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
