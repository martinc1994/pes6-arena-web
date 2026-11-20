'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

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
            <li><Link href="/llaves">Llaves</Link></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <ThemeToggle />
            <Link href="/" className="nav-back-btn">← VOLVER</Link>
          </div>
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
            <span className="label-text">EL EVENTO ANUAL</span>
            <span className="label-line"></span>
          </div>
          <h1 className="section-title centered">La Pasión del PES<br /><em>como nunca antes</em></h1>
          <p className="hero-sub">📅 Domingo 22 de Noviembre · Inicia 12:00 HS · 📍 Microestadio de Garín</p>
          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="https://maps.app.goo.gl/xgT5NWWxgguvCuZa7"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-google-maps-hero"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>CÓMO LLEGAR (GOOGLE MAPS)</span>
            </a>
            <div style={{ background: 'rgba(255, 215, 0, 0.12)', border: '1px solid var(--gold)', padding: '0.65rem 1.5rem', borderRadius: '50px', fontWeight: 'bold', color: 'var(--gold)', letterSpacing: '0.5px' }}>
              🎟️ ENTRADA: 1 Alimento No Perecedero
            </div>
          </div>
        </div>
      </section>

      {/* 2. Cronograma / Todo el día */}
      <section className="section-experiencia" style={{ paddingBottom: '2rem' }}>
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">JORNADA COMPLETA</span>
          <span className="label-line"></span>
        </div>
        <h2 className="section-title centered">Un evento para<br /><em>vivir todo el día</em></h2>
        <p className="section-sub centered">Desde el mediodía, el Microestadio se convierte en el epicentro gamer y futbolero.</p>

        <div className="experiencia-grid" style={{ marginTop: '2.5rem' }}>
          <div className="experiencia-card fade-in" style={{ borderLeft: '4px solid var(--gold)' }}>
            <div className="experiencia-icon">🕛</div>
            <h3>12:00 HS — Apertura de Puertas</h3>
            <p>Recorré el evento, disfrutá de los stands, probá diferentes videojuegos, conocé cosplayers, sacate fotos y disfrutá de los shows en vivo.</p>
          </div>
          <div className="experiencia-card fade-in" style={{ borderLeft: '4px solid var(--red)' }}>
            <div className="experiencia-icon">⚽</div>
            <h3>15:00 HS — Torneo de PES 6</h3>
            <p>Los campeones de nuestros torneos callejeros + influencers se enfrentan en el escenario principal frente a la multitud.</p>
          </div>
        </div>
      </section>

      {/* 3. Experiencia Completa */}
      <section className="section-experiencia" style={{ paddingTop: '2rem' }}>
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">ACTIVIDADES Y SHOWS</span>
          <span className="label-line"></span>
        </div>
        <h2 className="section-title centered">No solo PES6,<br /><em>mucho más</em></h2>

        <div className="experiencia-grid">
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">🛒</div>
            <h3>Stands Comerciales</h3>
            <p>Emprendedores, marcas y productos gamer para recorrer durante toda la jornada.</p>
          </div>
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">🎭</div>
            <h3>Cosplayers y Gaming</h3>
            <p>Zona de videojuegos libre, presencia de cosplayers e interactividad con el público.</p>
          </div>
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">🎵</div>
            <h3>Shows y Música</h3>
            <p>Artistas y presentaciones en vivo para darle el mejor clima al estadio.</p>
          </div>
          <div className="experiencia-card fade-in">
            <div className="experiencia-icon">📺</div>
            <h3>Pantallas Gigantes</h3>
            <p>Viví cada jugada en alta definición con tribunas y transmisión estelar.</p>
          </div>
        </div>
      </section>

      {/* 4. Info principal del evento */}
      <section className="section-evento-info" id="info">
        <div className="evento-container">
          <div className="evento-visual fade-in">
            <div className="stadium-img-wrapper">
              <img src="/recursos/microestadiointerior.jpeg" alt="Microestadio Garín Interior" className="stadium-img" />
              <div className="stadium-badge">
                <span className="badge-date">22 NOV</span>
              </div>
            </div>
          </div>
          <div className="evento-info fade-in">
            <h2 className="section-title">El Microestadio,<br /><em>listo para la gloria</em></h2>
            <p className="evento-desc">
              Después de clasificatorios a lo largo de todo el año, los mejores jugadores se enfrentan en un microestadio real. Tribunas llenas, relatos en vivo, pantallas gigantes y toda la pasión del clásico futbolero.
            </p>
            <ul className="evento-features">
              <li className="fade-in">
                <span className="feat-icon">📍</span>
                <div>
                  <strong>Ubicación Exacta</strong><br />
                  Microestadio de Garín (Boulevard Presidente Perón 450, Garín)
                  <div>
                    <a
                      href="https://maps.app.goo.gl/xgT5NWWxgguvCuZa7"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-google-maps-link"
                    >
                      📍 Abrir en Google Maps →
                    </a>
                  </div>
                </div>
              </li>
              <li className="fade-in">
                <span className="feat-icon">🎟️</span>
                <div><strong>Entrada Solidaria</strong><br />1 Alimento No Perecedero por persona</div>
              </li>
              <li className="fade-in">
                <span className="feat-icon">🎮</span>
                <div><strong>PES6 Oficial</strong><br />El videojuego que marcó a una generación, en pantalla gigante</div>
              </li>
              <li className="fade-in">
                <span className="feat-icon">🎙️</span>
                <div><strong>Animación y Relatos</strong><br />ValenFulvo y equipo en vivo</div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Galería del estadio */}
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
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a
            href="https://maps.app.goo.gl/xgT5NWWxgguvCuZa7"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-google-maps-hero"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>VER CÓMO LLEGAR EN GOOGLE MAPS →</span>
          </a>
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
          <Link href="/llaves" style={{color:'var(--grey)', textDecoration:'none', fontSize:'0.85rem'}}>Llaves</Link>
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
