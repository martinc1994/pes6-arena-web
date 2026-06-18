'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { checkAdminPassword, addClasificado, removeClasificado, createTorneo, updateTorneo, removeTorneo, voteClasificado } from './actions';

export default function Home() {
  const canvasRef = useRef(null);
  const [toastMsg, setToastMsg] = useState(null);
  
  // Datos
  const [clasificados, setClasificados] = useState([]);
  const [torneos, setTorneos] = useState([]);
  
  // Formulario Inscripción
  const [modalidad, setModalidad] = useState('individual');
  const [showFormSuccess, setShowFormSuccess] = useState(false);

  // Admin Panel
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminTab, setAdminTab] = useState('clasificados');
  
  // Admin Form - Clasificados
  const [cNick, setCNick] = useState('');
  const [cImg, setCImg] = useState('');
  const [cDesc, setCDesc] = useState('');
  
  // Admin Form - Torneos
  const [tNombre, setTNombre] = useState('');
  const [tFecha, setTFecha] = useState('');
  const [tModalidad, setTModalidad] = useState('individual');
  
  // Bracket Modal
  const [showBracket, setShowBracket] = useState(false);
  const [currentTorneo, setCurrentTorneo] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 2800);
  };

  const fetchDatos = async () => {
    const { data: clas } = await supabase.from('clasificados').select('*').order('id', { ascending: true });
    if (clas) setClasificados(clas);
    
    const { data: torn } = await supabase.from('torneos').select('*').order('id', { ascending: false });
    if (torn) setTorneos(torn);
  };

  useEffect(() => {
    // eslint-disable-next-line
    fetchDatos();
  }, []);

  // Votación
  const handleVote = async (id, type) => {
    try {
      await voteClasificado(id, type);
      showToast(type === 'like' ? '👍 Voto positivo registrado!' : '👎 Voto negativo registrado!', 'success');
      fetchDatos();
    } catch (e) {
      showToast(e.message, 'warning');
    }
  };

  // Canvas y scroll
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
    for (let i = 0; i < 28; i++) {
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
        
        if (p.color.startsWith('#')) {
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
        } else {
          ctx.fillStyle = p.color.replace(')', `,${p.alpha})`).replace('rgb', 'rgba').replace('#', '');
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      animationId = requestAnimationFrame(loop);
    }
    loop();

    const handleScroll = () => {
      document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);

    const fadeEls = document.querySelectorAll('.step-card, .formato-box, .evento-features li, .champion-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    fadeEls.forEach(el => { el.classList.add('fade-in'); observer.observe(el); });

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
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

  const generarBracket = () => {
    return [
      { nombre: 'Octavos de final', partidos: Array(8).fill(null).map((_, i) => ({ id: i, local: '', visitante: '', golesLocal: '', golesVisitante: '', ganador: '' })) },
      { nombre: 'Cuartos de final', partidos: Array(4).fill(null).map((_, i) => ({ id: i, local: '', visitante: '', golesLocal: '', golesVisitante: '', ganador: '' })) },
      { nombre: 'Semifinales', partidos: Array(2).fill(null).map((_, i) => ({ id: i, local: '', visitante: '', golesLocal: '', golesVisitante: '', ganador: '' })) },
      { nombre: 'Final', partidos: [{ id: 0, local: '', visitante: '', golesLocal: '', golesVisitante: '', ganador: '' }] },
    ];
  };

  return (
    <main>
      <nav className="navbar" id="navbar">
        <div className="nav-inner">
          <div className="nav-logo">
            <span className="logo-vf">VF</span>
            <span className="logo-cup">PES6</span>
          </div>
          <ul className="nav-links">
            <li><a href="#evento">Evento Final</a></li>
            <li><a href="#torneos">Microtorneos</a></li>
            <li><a href="#clasificados">Clasificados</a></li>
            <li><a href="#inscripcion">Inscribirse</a></li>
          </ul>
          <a href="#inscripcion" className="nav-cta">QUIERO JUGAR</a>
        </div>
      </nav>

      <section className="hero" id="inicio">
        <canvas className="pitch-canvas" id="pitchCanvas" ref={canvasRef}></canvas>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="dot red"></span>
            <span>20 años despues, el pes6 mas vivo que nunca</span>
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

          <p className="hero-sub">El evento más grande de PES6.<br />16 campeones, un solo trono.</p>

          <div className="hero-btns">
            <a href="#inscripcion" className="btn-primary">QUIERO CLASIFICAR</a>
            <a href="#clasificados" className="btn-ghost">VER CLASIFICADOS</a>
          </div>

          <div className="hero-stats">
            <div className="stat"><span className="stat-n">16</span><span className="stat-l">Equipos Clasificados</span></div>
            <div className="stat-sep"></div>
            <div className="stat"><span className="stat-n">~3</span><span className="stat-l">Semanas entre torneos</span></div>
            <div className="stat-sep"></div>
            <div className="stat"><span className="stat-n">1</span><span className="stat-l">Gran Final</span></div>
          </div>
        </div>

        <div className="hero-scroll-hint">
          <span>SCROLL</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      <section className="section-evento" id="evento">
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">EL EVENTO</span>
          <span className="label-line"></span>
        </div>
        <div className="evento-container">
          <div className="evento-visual">
            <div className="stadium-img-wrapper">
              <img src="/recursos/microestadiointerior.jpeg" alt="Microestadio Garín" className="stadium-img" />
              <div className="stadium-badge">
                <span className="badge-date">21 NOV</span>
              </div>
            </div>
          </div>
          <div className="evento-info">
            <h2 className="section-title">La Gran Final<br /><em>te espera</em></h2>
            <p className="evento-desc">
              Después de meses de batalla en los microtorneos clasificatorios, los 16 mejores se enfrentan en un microestadio real. Tribunas, pantallas gigantes, transmisión en vivo. El PES6 como nunca lo viste.
            </p>
            <ul className="evento-features">
              <li>
                <span className="feat-icon">🏆</span>
                <div><strong>Formato eliminatorio directo</strong><br />16 clasificados. Sin segunda oportunidad.</div>
              </li>
              <li>
                <span className="feat-icon">📍</span>
                <div><strong>Microestadio de Garín</strong><br />Ciudad de Garín, Buenos Aires, Argentina</div>
              </li>
              <li>
                <span className="feat-icon">🎮</span>
                <div><strong>PES6 Oficial</strong><br />El clásico de culto que sigue vivo gracias a la comunidad</div>
              </li>
              <li>
                <span className="feat-icon">🎙️</span>
                <div><strong>Presentado por ValenFulvo</strong><br />El creador que hizo historia en el fútbol virtual argentino</div>
              </li>
            </ul>
            <a href="#inscripcion" className="btn-primary">QUIERO ESTAR AHÍ</a>
          </div>
        </div>
      </section>

      <section className="section-torneos" id="torneos">
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">MICROTORNEOS</span>
          <span className="label-line"></span>
        </div>

        <h2 className="section-title centered">Así se llega<br /><em>a la final</em></h2>
        <p className="section-sub centered">Cada ~2 semanas se realiza un microtorneo clasificatorio. 16 equipos. Eliminación directa. Solo el campeón avanza al evento del microestadio.</p>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">📝</div>
            <h3>Inscribite</h3>
            <p>Completá el formulario con tu nick, modalidad (individual o pareja) y el torneo al que querés entrar. Las plazas son limitadas — 16 por torneo.</p>
          </div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon">⚽</div>
            <h3>Competí</h3>
            <p>El día del torneo, 16 equipos se enfrentan en rondas eliminatorias a partido único. No hay repechaje, no hay vuelta. O ganás o te vas.</p>
          </div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon">🥇</div>
            <h3>Clasificá</h3>
            <p>El campeón de cada microtorneo gana su lugar en la Gran Final del 21 de Noviembre en el Microestadio de Garín.</p>
          </div>
          <div className="step-card">
            <div className="step-num">04</div>
            <div className="step-icon">👑</div>
            <h3>Hacete leyenda</h3>
            <p>En la Gran Final, los 16 campeones luchan por el título máximo. Tribunas llenas, transmisión en vivo, historia para siempre.</p>
          </div>
        </div>
      </section>

      <section className="section-clasificados" id="clasificados">
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">CLASIFICADOS</span>
          <span className="label-line"></span>
        </div>
        <h2 className="section-title centered">Los que ya<br /><em>están adentro</em></h2>
        <p className="section-sub centered">Estos campeones de microtorneos ya tienen su lugar en el Microestadio. Votá a tu favorito para la Gran Final.</p>

        <div className="voting-notice">
          <span>⚡</span>
          <span>Votación activa — 2 votos por dispositivo cada 24 horas</span>
        </div>

        <div className="clasificados-grid">
          {clasificados.map(c => (
            <div key={c.id} className="champion-card fade-in visible">
              <div className="champion-badge">CLASIFICADO</div>
              {c.foto ? (
                <img className="champion-photo" src={c.foto} alt={c.nick} onError={(e)=>{e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
              ) : null}
              <div className="champion-photo-placeholder" style={{display: c.foto ? 'none' : 'flex'}}>🎮</div>
              
              <div className="champion-info">
                <div className="champion-nick">{c.nick}</div>
                <div className="champion-desc">{c.desc_text}</div>
                <div className="vote-btns">
                  <button className="vote-btn like" onClick={() => handleVote(c.id, 'like')}>
                    👍 <span>{c.likes || 0}</span>
                  </button>
                  <button className="vote-btn dislike" onClick={() => handleVote(c.id, 'dislike')}>
                    👎 <span>{c.dislikes || 0}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {16 - clasificados.length > 0 && (
          <p className="clasificados-pending" style={{marginTop:'2rem', textAlign:'center', color:'var(--grey)'}}>
            {16 - clasificados.length} lugares aún sin clasificado — los próximos torneos lo definirán.
          </p>
        )}
      </section>

      <section className="section-inscripcion" id="inscripcion">
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">INSCRIPCIÓN</span>
          <span className="label-line"></span>
        </div>
        <div className="inscripcion-container">
          <div className="inscripcion-info">
            <h2 className="section-title">¿Listo para<br /><em>competir?</em></h2>
            <p>Contactate por nuestras vías oficiales para inscribirte en el próximo torneo disponible. Las plazas son limitadas.</p>
            <div className="inscripcion-tips">
              <div className="tip"><span style={{color:'var(--gold)', fontWeight:'bold'}}>✓</span> Revisá tu disponibilidad para la fecha del torneo</div>
              <div className="tip"><span style={{color:'var(--gold)', fontWeight:'bold'}}>✓</span> Si es pareja, coordiná con tu compañero antes de inscribirte</div>
              <div className="tip"><span style={{color:'var(--gold)', fontWeight:'bold'}}>✓</span> Seguí a ValenFulvo para no perderte las novedades</div>
            </div>
          </div>

          <div className="inscripcion-form-wrap">
            <div className="form-card" style={{textAlign: 'center', gap: '1.5rem', background: 'var(--black2)', padding: '2rem', borderRadius: 'var(--radius-lg)'}}>
              <p style={{color: 'var(--white)', fontSize: '1.05rem', marginBottom: 0}}>
                Inscribite directo por WhatsApp enviando un mensaje con tus datos:
              </p>
              <a href="https://wa.me/5491170384230" target="_blank" className="btn-whatsapp full-w" style={{display:'inline-flex', padding:'1rem', background:'#25D366', color:'white', borderRadius:'8px', textDecoration:'none', justifyContent:'center', alignItems:'center', gap:'10px', fontWeight:'bold', width:'100%'}}>
                Inscribirme por WhatsApp
              </a>

              <div style={{margin: '1.5rem 0', height: '1px', background: 'rgba(255,255,255,0.07)'}}></div>
              
              <p style={{color: 'var(--white)', fontSize: '1.05rem', marginBottom: 0}}>
                ¿Querés destacar? Seguinos en Instagram y envianos un <strong>video</strong> contando por qué tenés que participar. ¡Tendrás consideración especial!
              </p>
              <a href="https://www.instagram.com/pes6arena?igsh=MTVtN3A0d2dzemJudg==" target="_blank" className="btn-instagram full-w" style={{display:'inline-flex', padding:'1rem', background:'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color:'white', borderRadius:'8px', textDecoration:'none', justifyContent:'center', alignItems:'center', gap:'10px', fontWeight:'bold', width:'100%'}}>
                Instagram PES Arena
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer" style={{background:'var(--black2)', padding:'3rem 2rem', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="footer-logo" style={{justifyContent:'center', marginBottom:'1rem'}}>
          <span className="logo-vf" style={{color:'var(--gold)', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.8rem'}}>VF</span>
          <span className="logo-cup" style={{color:'var(--red)', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', marginLeft:'5px'}}>PES6</span>
        </div>
        <p style={{color:'var(--grey)', fontSize:'0.9rem', marginBottom:'1.5rem'}}>El PES6 más grande de Argentina</p>
        <div style={{display:'flex', gap:'1rem', justifyContent:'center', marginBottom:'1.5rem', flexWrap:'wrap'}}>
          <a href="#inicio" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Inicio</a>
          <a href="#evento" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Evento</a>
          <a href="#torneos" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Torneos</a>
          <a href="#clasificados" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Clasificados</a>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position:'fixed', bottom:'5rem', left:'50%', transform:'translateX(-50%)',
          background: toastMsg.type === 'warning' ? '#9e0029' : '#0d2a18',
          border: `1px solid ${toastMsg.type === 'warning' ? '#E8003D' : '#28c850'}`,
          color:'#fff', padding:'0.75rem 1.5rem', borderRadius:'8px', zIndex:999, fontWeight:600
        }}>
          {toastMsg.msg}
        </div>
      )}

      {/* Admin FAB */}
      <div className="admin-fab" title="Panel Admin" onClick={() => setShowAdmin(true)}>⚙️</div>

      {/* Admin Overlay */}
      <div className={`admin-overlay ${showAdmin ? 'active' : ''}`} onClick={(e) => { if(e.target.className.includes('admin-overlay')) setShowAdmin(false) }}>
        <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
          <div className="admin-header">
            <h2>Panel Administrador</h2>
            <button className="admin-close" onClick={() => setShowAdmin(false)}>✕</button>
          </div>

          {!adminLoggedIn ? (
            <div className="admin-login">
              <p>Acceso restringido</p>
              <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="Contraseña" style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'0.75rem', borderRadius:'8px'}} />
              <button className="btn-primary" onClick={handleAdminLogin} style={{padding:'0.75rem', border:'none', background:'var(--gold)', fontWeight:'bold', borderRadius:'8px', cursor:'pointer'}}>INGRESAR</button>
              {adminError && <p style={{color:'var(--red)'}}>{adminError}</p>}
            </div>
          ) : (
            <div className="admin-content">
              <div className="admin-tabs" style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                <button className={`atab ${adminTab==='clasificados'?'active':''}`} onClick={()=>setAdminTab('clasificados')} style={{background:'none', border:'none', color:adminTab==='clasificados'?'var(--gold)':'var(--grey)', padding:'10px', cursor:'pointer', borderBottom:adminTab==='clasificados'?'2px solid var(--gold)':'none', fontWeight:'bold'}}>Clasificados</button>
                <button className={`atab ${adminTab==='torneos'?'active':''}`} onClick={()=>setAdminTab('torneos')} style={{background:'none', border:'none', color:adminTab==='torneos'?'var(--gold)':'var(--grey)', padding:'10px', cursor:'pointer', borderBottom:adminTab==='torneos'?'2px solid var(--gold)':'none', fontWeight:'bold'}}>Microtorneos</button>
              </div>

              {adminTab === 'clasificados' && (
                <div>
                  <div style={{background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'8px', marginBottom:'20px', display:'flex', flexDirection:'column', gap:'10px'}}>
                    <input type="text" placeholder="Nick / Nombre" value={cNick} onChange={e=>setCNick(e.target.value)} style={{padding:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white'}} />
                    <input type="text" placeholder="URL de foto (opcional)" value={cImg} onChange={e=>setCImg(e.target.value)} style={{padding:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white'}} />
                    <input type="text" placeholder="Descripción (ej: Campeón Torneo #3)" value={cDesc} onChange={e=>setCDesc(e.target.value)} style={{padding:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white'}} />
                    <button className="btn-primary" style={{padding:'8px', background:'var(--gold)', border:'none', fontWeight:'bold', borderRadius:'5px'}} onClick={async () => {
                      try {
                        await addClasificado(adminPass, cNick, cImg, cDesc);
                        setCNick(''); setCImg(''); setCDesc('');
                        fetchDatos();
                        showToast('Clasificado agregado');
                      } catch (e) { showToast('Error al agregar', 'warning'); }
                    }}>AGREGAR CLASIFICADO</button>
                  </div>
                  
                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {clasificados.map(c => (
                      <div key={c.id} style={{display:'flex', justifyContent:'space-between', background:'rgba(255,255,255,0.05)', padding:'10px', borderRadius:'8px'}}>
                        <div>
                          <div style={{fontWeight:'bold'}}>{c.nick}</div>
                          <div style={{fontSize:'0.8rem', color:'var(--grey)'}}>{c.desc_text}</div>
                        </div>
                        <button style={{background:'rgba(232,0,61,0.2)', border:'1px solid var(--red)', color:'var(--red)', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}} onClick={async () => {
                          if(confirm('¿Eliminar?')) {
                            await removeClasificado(adminPass, c.id);
                            fetchDatos();
                          }
                        }}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {adminTab === 'torneos' && (
                <div>
                  <div style={{background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'8px', marginBottom:'20px', display:'flex', flexDirection:'column', gap:'10px'}}>
                    <input type="text" placeholder="Nombre (ej: Microtorneo #4)" value={tNombre} onChange={e=>setTNombre(e.target.value)} style={{padding:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white'}} />
                    <input type="text" placeholder="Fecha" value={tFecha} onChange={e=>setTFecha(e.target.value)} style={{padding:'8px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'white'}} />
                    <select value={tModalidad} onChange={e=>setTModalidad(e.target.value)} style={{padding:'8px', background:'var(--dark)', border:'1px solid rgba(255,255,255,0.1)', color:'white'}}>
                      <option value="individual">Individual</option>
                      <option value="pareja">Parejas</option>
                    </select>
                    <button className="btn-primary" style={{padding:'8px', background:'var(--gold)', border:'none', fontWeight:'bold', borderRadius:'5px'}} onClick={async () => {
                      try {
                        await createTorneo(adminPass, tNombre, tFecha, tModalidad, generarBracket());
                        setTNombre(''); setTFecha('');
                        fetchDatos();
                        showToast('Torneo creado');
                      } catch (e) { showToast('Error', 'warning'); }
                    }}>CREAR TORNEO</button>
                  </div>

                  <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                    {torneos.map(t => (
                      <div key={t.id} style={{background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                          <div>
                            <h4 style={{margin:0}}>{t.nombre}</h4>
                            <div style={{fontSize:'0.8rem', color:'var(--grey)'}}>{t.fecha} · {t.modalidad}</div>
                          </div>
                          <div style={{display:'flex', gap:'5px'}}>
                            <button style={{background:'transparent', border:'1px solid var(--gold)', color:'var(--gold)', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}} onClick={() => { setCurrentTorneo(t); setShowBracket(true); }}>BRACKET</button>
                            <button style={{background:'rgba(232,0,61,0.2)', border:'1px solid var(--red)', color:'var(--red)', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}} onClick={async () => {
                              if(confirm('¿Eliminar torneo?')) {
                                await removeTorneo(adminPass, t.id);
                                fetchDatos();
                              }
                            }}>✕</button>
                          </div>
                        </div>
                        {t.campeon && <div style={{color:'var(--gold)', fontSize:'0.85rem', fontWeight:'bold', marginTop:'10px'}}>🏆 Campeón: {t.campeon}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bracket Modal */}
      {showBracket && currentTorneo && (
        <div className="bracket-overlay active" onClick={(e) => { if(e.target.className.includes('bracket-overlay')) setShowBracket(false) }}>
          <div className="bracket-modal" onClick={e=>e.stopPropagation()} style={{background:'var(--black2)', padding:'2rem', borderRadius:'8px', border:'1px solid var(--gold)', maxWidth:'90vw', overflowX:'auto'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1.5rem'}}>
              <h2 style={{color:'var(--gold)', margin:0}}>{currentTorneo.nombre}</h2>
              <button style={{background:'none', border:'none', color:'white', cursor:'pointer', fontSize:'1.2rem'}} onClick={()=>setShowBracket(false)}>✕</button>
            </div>
            <div style={{display:'flex', gap:'2rem'}}>
              {currentTorneo.partidos.map((ronda, rIdx) => (
                <div key={rIdx} style={{minWidth:'200px'}}>
                  <h4 style={{color:'var(--grey)', textAlign:'center', marginBottom:'1rem'}}>{ronda.nombre}</h4>
                  <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                    {ronda.partidos.map((p, pIdx) => (
                      <div key={pIdx} style={{background:'rgba(255,255,255,0.05)', padding:'10px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)'}}>
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                          <input type="text" placeholder="Local" value={p.local} onChange={async (e) => {
                            const nt = {...currentTorneo}; nt.partidos[rIdx].partidos[pIdx].local = e.target.value; setCurrentTorneo(nt);
                            await updateTorneo(adminPass, currentTorneo.id, { partidos: nt.partidos }); fetchDatos();
                          }} style={{background:'var(--dark)', color:'white', border:'1px solid #333', padding:'4px'}} />
                          <input type="text" placeholder="Visitante" value={p.visitante} onChange={async (e) => {
                            const nt = {...currentTorneo}; nt.partidos[rIdx].partidos[pIdx].visitante = e.target.value; setCurrentTorneo(nt);
                            await updateTorneo(adminPass, currentTorneo.id, { partidos: nt.partidos }); fetchDatos();
                          }} style={{background:'var(--dark)', color:'white', border:'1px solid #333', padding:'4px'}} />
                          <div style={{display:'flex', gap:'10px', marginTop:'5px'}}>
                            <input type="number" value={p.golesLocal} placeholder="0" style={{width:'50px', background:'var(--dark)', color:'white', border:'1px solid #333'}} onChange={async (e) => {
                              const nt = {...currentTorneo}; nt.partidos[rIdx].partidos[pIdx].golesLocal = e.target.value; setCurrentTorneo(nt);
                              await updateTorneo(adminPass, currentTorneo.id, { partidos: nt.partidos }); fetchDatos();
                            }} />
                            <span style={{color:'var(--grey)'}}>-</span>
                            <input type="number" value={p.golesVisitante} placeholder="0" style={{width:'50px', background:'var(--dark)', color:'white', border:'1px solid #333'}} onChange={async (e) => {
                              const nt = {...currentTorneo}; nt.partidos[rIdx].partidos[pIdx].golesVisitante = e.target.value; setCurrentTorneo(nt);
                              await updateTorneo(adminPass, currentTorneo.id, { partidos: nt.partidos }); fetchDatos();
                            }} />
                          </div>
                          {(p.local && p.visitante) && (
                            <div style={{display:'flex', gap:'5px', marginTop:'5px'}}>
                              <button style={{fontSize:'0.7rem', padding:'2px', background: p.ganador===p.local?'rgba(255,215,0,0.3)':'transparent', border:'1px solid var(--gold)', color:'white', cursor:'pointer'}} onClick={async () => {
                                const nt = {...currentTorneo}; nt.partidos[rIdx].partidos[pIdx].ganador = p.local; setCurrentTorneo(nt);
                                await updateTorneo(adminPass, currentTorneo.id, { partidos: nt.partidos }); fetchDatos();
                              }}>{p.local}</button>
                              <button style={{fontSize:'0.7rem', padding:'2px', background: p.ganador===p.visitante?'rgba(255,215,0,0.3)':'transparent', border:'1px solid var(--gold)', color:'white', cursor:'pointer'}} onClick={async () => {
                                const nt = {...currentTorneo}; nt.partidos[rIdx].partidos[pIdx].ganador = p.visitante; setCurrentTorneo(nt);
                                await updateTorneo(adminPass, currentTorneo.id, { partidos: nt.partidos }); fetchDatos();
                              }}>{p.visitante}</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Campeon selector if final has winner */}
              {currentTorneo.partidos[3]?.partidos[0]?.ganador && (
                <div style={{display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', marginLeft:'2rem'}}>
                  <span style={{fontSize:'3rem'}}>🏆</span>
                  <div style={{color:'var(--gold)', fontWeight:'bold', fontSize:'1.2rem', textAlign:'center'}}>{currentTorneo.partidos[3].partidos[0].ganador}</div>
                  <button style={{marginTop:'1rem', background:'var(--gold)', border:'none', fontWeight:'bold', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}} onClick={async () => {
                     await updateTorneo(adminPass, currentTorneo.id, { campeon: currentTorneo.partidos[3].partidos[0].ganador });
                     fetchDatos();
                     showToast('Campeón Guardado!');
                     setShowBracket(false);
                  }}>GUARDAR CAMPEÓN</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
