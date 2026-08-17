'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function ClasificarPage() {
  const instagramUrl = 'https://www.instagram.com/pes6arena';

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
            <li><Link href="/participantes">Participantes</Link></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <ThemeToggle />
            <Link href="/" className="nav-back-btn">← VOLVER</Link>
          </div>
        </div>
      </nav>

      <section className="clasificar-hero" style={{ paddingTop: '7rem' }}>
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">QUIERO CLASIFICAR</span>
          <span className="label-line"></span>
        </div>
        <h1 className="section-title centered">¿Listo para<br /><em>competir?</em></h1>
        <p className="section-sub centered">Elegí tu perfil y contactanos por Instagram para asegurar tu lugar en el PESARENA.</p>
      </section>

      <section className="clasificar-options">
        <div className="clasificar-grid">
          {/* Opción Jugador */}
          <div className="clasificar-card clasificar-jugador">
            <div className="clasificar-card-header">
              <div className="clasificar-card-icon">🎮</div>
              <h2>SOY JUGADOR</h2>
              <div className="clasificar-card-line"></div>
            </div>

            <div className="clasificar-card-body">
              <div className="clasificar-quote">
                <span className="clasificar-quote-mark">"</span>
                <p>Soy muy bueno jugando PES6 y quiero anotarme al siguiente torneo.</p>
                <span className="clasificar-quote-mark">"</span>
              </div>

              <div className="clasificar-tips">
                <div className="tip"><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>✓</span> Más de 10 torneos clasificatorios al año</div>
                <div className="tip"><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>✓</span> Enviá un mensaje o video a Instagram contando tu historia, nivel y ganas de competir</div>
                <div className="tip"><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>✓</span> Coordiná si vas en pareja o individual antes de inscribirte</div>
                <div className="tip"><span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>✓</span> Si este año ya cerraron los cupos, ¡el próximo año tenés una nueva oportunidad!</div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                <a
                  href="https://www.instagram.com/valenfulvo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-instagram full-w clasificar-cta"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  INSTAGRAM @VALENFULVO
                </a>
                <a
                  href="https://www.instagram.com/pes6arena"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-instagram full-w clasificar-cta"
                  style={{ background: 'rgba(255,215,0,0.15)', borderColor: 'var(--gold)', color: 'var(--gold)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  INSTAGRAM @PES6ARENA
                </a>
              </div>
              <p className="clasificar-hint">Mandanos un DM contando tu historia, nivel y ganas de competir</p>
            </div>
          </div>

          {/* Opción Influencer */}
          <div className="clasificar-card clasificar-influencer">
            <div className="clasificar-card-header">
              <div className="clasificar-card-icon">🎙️</div>
              <h2>SOY INFLUENCER</h2>
              <div className="clasificar-card-line"></div>
            </div>

            <div className="clasificar-card-body">
              <div className="clasificar-quote clasificar-quote-influencer">
                <span className="clasificar-quote-mark">"</span>
                <p>Soy creador de contenido o influencer y me gustaría participar del PESARENA.</p>
                <span className="clasificar-quote-mark">"</span>
              </div>

              <div className="clasificar-tips">
                <div className="tip"><span style={{ color: '#dc2743', fontWeight: 'bold' }}>✓</span> Invitaciones especiales y limitadas por edición</div>
                <div className="tip"><span style={{ color: '#dc2743', fontWeight: 'bold' }}>✓</span> Mandanos un mensaje contando quién sos, qué contenido hacés y por qué querés ser parte</div>
                <div className="tip"><span style={{ color: '#dc2743', fontWeight: 'bold' }}>✓</span> Si tu perfil encaja con el espíritu del evento, tendrás tu invitación</div>
                <div className="tip"><span style={{ color: '#dc2743', fontWeight: 'bold' }}>✓</span> ¡No es una inscripción abierta, es una invitación especial!</div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexDirection: 'column' }}>
                <a
                  href="https://www.instagram.com/valenfulvo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-instagram full-w clasificar-cta clasificar-cta-influencer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  DM @VALENFULVO
                </a>
                <a
                  href="https://www.instagram.com/pes6arena"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-instagram full-w clasificar-cta clasificar-cta-influencer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  DM @PES6ARENA
                </a>
              </div>
              <p className="clasificar-hint">Mandanos un DM contando tu perfil y por qué querés estar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info adicional */}
      <section className="clasificar-info-section">
        <div className="clasificar-info-box">
          <div className="clasificar-info-icon">💡</div>
          <div>
            <h3>¿Tenés dudas?</h3>
            <p>No importa si sos jugador casual, competitivo o creador de contenido. Escribinos por Instagram y te contamos todo lo que necesitás saber para ser parte del PESARENA.</p>
          </div>
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
          <Link href="/participantes" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Participantes</Link>
          <Link href="/clasificar" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem' }}>Clasificar</Link>
        </div>
        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
          <a href="https://wa.me/543816232650?text=Hola%20Mart%C3%ADn!%20Vi%20tu%20trabajo%20en%20la%20p%C3%A1gina%20de%20ValenFulvo%20y%20me%20gustar%C3%ADa%20consultar%20por%20tus%20servicios%20de%20desarrollo." target="_blank" rel="noopener noreferrer" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            Desarrollado por <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>Martín Castillo</span>
          </a>
        </div>
      </footer>
    </main>
  );
}
