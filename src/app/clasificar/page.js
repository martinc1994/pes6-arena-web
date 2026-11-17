'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function ClasificarPage() {
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
            <li><Link href="/llaves">Llaves</Link></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <ThemeToggle />
            <Link href="/" className="nav-back-btn">← VOLVER</Link>
          </div>
        </div>
      </nav>

      <section className="clasificar-hero" style={{ paddingTop: '8rem', paddingBottom: '3rem' }}>
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">POSTULACIONES FINALIZADAS</span>
          <span className="label-line"></span>
        </div>
        <h1 className="section-title centered">CUPOS CUBIERTOS<br /><em>¡Inscripciones Cerradas!</em></h1>
        <p className="section-sub centered" style={{ maxWidth: '640px', margin: '0.75rem auto 0' }}>
          El cupo oficial de 16 participantes (campeones e invitados especiales) ya está 100% completo y listo para el torneo.
        </p>
      </section>

      <section style={{ maxWidth: '800px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        <div style={{
          background: 'rgba(255, 215, 0, 0.05)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '1.5px', color: 'var(--gold)', marginBottom: '0.75rem' }}>
            LOS 16 CLASIFICADOS YA ESTÁN DEFINIDOS
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--grey-light)', lineHeight: '1.6', maxWidth: '580px', margin: '0 auto 2rem' }}>
            No habrá nuevas postulaciones para esta edición. Podés conocer el perfil de cada jugador, votar por tu favorito y consultar el cuadro oficial de Octavos de Final.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/participantes" className="btn-google-maps-hero" style={{ padding: '0.75rem 1.75rem' }}>
              🎮 VER LOS 16 PARTICIPANTES
            </Link>
            <Link href="/llaves" className="countdown-maps-btn" style={{ padding: '0.75rem 1.75rem', marginTop: 0 }}>
              ⚡ VER LLAVES DEL TORNEO
            </Link>
            <Link href="/evento" className="countdown-maps-btn" style={{ padding: '0.75rem 1.75rem', marginTop: 0 }}>
              🏟️ INFO Y UBICACIÓN DEL EVENTO
            </Link>
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
          <Link href="/llaves" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Llaves</Link>
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
