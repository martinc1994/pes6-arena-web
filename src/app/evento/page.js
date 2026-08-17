'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function EventoPage() {
  const sectionRefs = useRef([]);

  useEffect(() => {
    const fadeEls = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    fadeEls.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main>
      <nav className="navbar scrolled" id="navbar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span className="logo-vf">VF</span>
            <span className="logo-cup">PES6</span>
          </Link>
          <ul className="nav-links">
            <li><Link href="/participantes">Participantes</Link></li>
            <li><Link href="/clasificar">Clasificar</Link></li>
          </ul>
          <Link href="/" className="nav-back-btn">← VOLVER</Link>
        </div>
      </nav>

      {/* 1. Hero del Evento */}
      <section className="evento-hero">
        <div className="evento-hero-bg">
          <img src="/recursos/microestadioexterior.jpeg" alt="Microestadio Garín exterior" />
          <div className="evento-hero-overlay"></div>
        </div>
        <div className="evento-hero-content">
          <div className="section-label">
            <span className="label-line"></span>
            <span className="label-text">EL EVENTO</span>
            <span className="label-line"></span>
          </div>
          <h1 className="section-title centered">La Gran Final<br /><em>te espera</em></h1>
          <p className="hero-sub">21 de Noviembre de 2026 · Microestadio de Garín, Buenos Aires</p>
        </div>
      </section>

      {/* 2. Sección "Experiencia Completa" */}
      <section className="section-experiencia">
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">EXPERIENCIA COMPLETA</span>
          <span className="label-line"></span>
        </div>
        <h2 className="section-title centered">No solo PES6,<br /><em>mucho más</em></h2>
        <p className="section-sub centered">El PESARENA es un evento completo. Además de la competencia, vas a encontrar:</p>

        <div className="experiencia-grid">
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">🛒</div>
            <h3>Stands Comerciales</h3>
            <p>Emprendedores, marcas y productos para que recorras mientras disfrutás del evento.</p>
          </div>
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">🎵</div>
            <h3>Shows de Música</h3>
            <p>Bandas y artistas en vivo para darle ritmo y energía a toda la jornada.</p>
          </div>
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">🎉</div>
            <h3>Entretenimiento</h3>
            <p>Actividades, desafíos, sorteos y mucha diversión para todos los asistentes.</p>
          </div>
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">📺</div>
            <h3>Pantallas Gigantes</h3>
            <p>Viví cada partido como si estuvieras en la cancha con transmisión en pantalla grande.</p>
          </div>
        </div>
      </section>

      {/* 3. Info principal del evento */}
      <section className="section-evento-info" id="info">
        <div className="evento-container">
          <div className="evento-visual fade-in">
            <div className="stadium-img-wrapper">
              <img src="/recursos/microestadiointerior.jpeg" alt="Microestadio Garín Interior" className="stadium-img" />
              <div className="stadium-badge">
                <span className="badge-date">21 NOV</span>
              </div>
            </div>
          </div>
          <div className="evento-info fade-in">
            <h2 className="section-title">Más que un torneo,<br /><em>una experiencia</em></h2>
            <p className="evento-desc">
              Después de meses de torneos clasificatorios, los 16 mejores se enfrentan en un microestadio real. Tribunas, pantallas gigantes, transmisión en vivo. El PES6 como nunca lo viste. Pero eso no es todo...
            </p>
            <p className="evento-desc" style={{fontWeight: 700, color: 'var(--gold)', fontSize: '1.1rem'}}>
              Sentite como en la cancha.
            </p>
            <ul className="evento-features">
              <li className="fade-in">
                <span className="feat-icon">🏆</span>
                <div><strong>Formato eliminatorio directo</strong><br />16 participantes. Sin segunda oportunidad.</div>
              </li>
              <li className="fade-in">
                <span className="feat-icon">📍</span>
                <div><strong>Microestadio de Garín</strong><br />Ciudad de Garín, Buenos Aires, Argentina</div>
              </li>
              <li className="fade-in">
                <span className="feat-icon">🎮</span>
                <div><strong>PES6 Oficial</strong><br />El clásico que sigue vivo gracias a la comunidad</div>
              </li>
              <li className="fade-in">
                <span className="feat-icon">🎙️</span>
                <div><strong>Animado y relatado por</strong><br />ValenFulvo y amigos</div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Galería del estadio */}
      <section className="section-galeria">
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">EL ESCENARIO</span>
          <span className="label-line"></span>
        </div>
        <h2 className="section-title centered">Microestadio<br /><em>de Garín</em></h2>
        <div className="galeria-grid">
          <div className="galeria-item fade-in">
            <img src="/recursos/microestadioexterior.jpeg" alt="Exterior del Microestadio" />
            <div className="galeria-caption">Vista Exterior</div>
          </div>
          <div className="galeria-item fade-in">
            <img src="/recursos/microestadiointerior.jpeg" alt="Interior del Microestadio" />
            <div className="galeria-caption">Vista Interior</div>
          </div>
          <div className="galeria-item fade-in">
            <img src="/recursos/garinestadio2.jpg" alt="Estadio de Garín" />
            <div className="galeria-caption">Complejo Deportivo</div>
          </div>
        </div>
      </section>

      <footer className="footer" style={{background:'var(--black2)', padding:'3rem 2rem', textAlign:'center', borderTop:'1px solid rgba(255,255,255,0.05)'}}>
        <div className="footer-logo" style={{justifyContent:'center', marginBottom:'1rem', display:'flex', alignItems:'baseline', gap:'2px'}}>
          <span className="logo-vf" style={{color:'var(--gold)', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.8rem'}}>VF</span>
          <span className="logo-cup" style={{color:'var(--red)', fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', marginLeft:'5px'}}>PES6</span>
        </div>
        <p style={{color:'var(--grey)', fontSize:'0.9rem', marginBottom:'1.5rem'}}>El PES6 más grande de Argentina</p>
        <div style={{display:'flex', gap:'1rem', justifyContent:'center', marginBottom:'1.5rem', flexWrap:'wrap'}}>
          <Link href="/" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Inicio</Link>
          <Link href="/evento" style={{color:'var(--gold)', textDecoration:'none', fontSize:'0.85rem'}}>Evento</Link>
          <Link href="/participantes" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Participantes</Link>
          <Link href="/clasificar" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Clasificar</Link>
        </div>
        <div style={{marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem'}}>
          <a href="https://wa.me/543816232650?text=Hola%20Mart%C3%ADn!%20Vi%20tu%20trabajo%20en%20la%20p%C3%A1gina%20de%20ValenFulvo%20y%20me%20gustar%C3%ADa%20consultar%20por%20tus%20servicios%20de%20desarrollo." target="_blank" rel="noopener noreferrer" style={{color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
            Desarrollado por <span style={{color: 'var(--gold)', fontWeight: 'bold'}}>Martín Castillo</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
