'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import TournamentBracket from '@/components/TournamentBracket';
import BolilleroModal from '@/components/BolilleroModal';
import { getClasificadosConVotos } from '@/lib/participantes';
import { checkAdminPassword, saveSorteoDefinitivo, getSorteoDefinitivo, resetSorteoDefinitivo } from '../actions';

export default function LlavesPage() {
  const [definitiveMatches, setDefinitiveMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Bolillero modal state
  const [bolilleroOpen, setBolilleroOpen] = useState(false);
  const [bolilleroTestMode, setBolilleroTestMode] = useState(true);

  // Participantes completos (16)
  const [playersList, setPlayersList] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Cargar participantes y sorteo definitivo guardado
  useEffect(() => {
    const list = getClasificadosConVotos();
    setPlayersList(list);

    // 1. Intentar cargar desde localStorage de inmediato
    try {
      const localSorteo = localStorage.getItem('pes6_definitive_bracket');
      if (localSorteo) {
        setDefinitiveMatches(JSON.parse(localSorteo));
      }
    } catch (e) {}

    // 2. Consultar base de datos / servidor
    const fetchSorteo = async () => {
      try {
        const saved = await getSorteoDefinitivo();
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setDefinitiveMatches(saved);
          try {
            localStorage.setItem('pes6_definitive_bracket', JSON.stringify(saved));
          } catch (e) {}
        }
      } catch (err) {
        console.warn('No se pudo obtener sorteo de base de datos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSorteo();

    // Comprobar si ya estaba logueado como admin en esta sesión o viene con ?admin=true
    if (typeof window !== 'undefined') {
      const isLogged = sessionStorage.getItem('pes6_admin_logged') === 'true';
      if (isLogged) setIsAdminLoggedIn(true);

      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' && !isLogged) {
        setShowAdminLoginModal(true);
      }
    }
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    startTransition(async () => {
      const valid = await checkAdminPassword(adminPassInput);
      if (valid) {
        setIsAdminLoggedIn(true);
        sessionStorage.setItem('pes6_admin_logged', 'true');
        sessionStorage.setItem('pes6_admin_pass', adminPassInput);
        setShowAdminLoginModal(false);
        setAdminPassInput('');
        showToast('Acceso de administrador concedido', 'success');
      } else {
        setAdminError('Contraseña incorrecta');
      }
    });
  };

  const openBolillero = (testMode) => {
    setBolilleroTestMode(testMode);
    setBolilleroOpen(true);
  };

  const handleConfirmDefinitive = async (matchesDrawn) => {
    const pass = sessionStorage.getItem('pes6_admin_pass') || '';
    const res = await saveSorteoDefinitivo(pass, matchesDrawn);

    if (res && res.error) {
      showToast(res.error, 'warning');
      throw new Error(res.error);
    }

    setDefinitiveMatches(matchesDrawn);
    try {
      localStorage.setItem('pes6_definitive_bracket', JSON.stringify(matchesDrawn));
    } catch (e) {}

    setBolilleroOpen(false);
    showToast('🏆 ¡Sorteo oficial publicado con éxito en toda la web!', 'success');
  };

  const handleResetDefinitive = async () => {
    if (!confirm('¿Estás seguro de reiniciar el sorteo definitivo? La web volverá a mostrar el cuadro como pendiente.')) {
      return;
    }
    const pass = sessionStorage.getItem('pes6_admin_pass') || '';
    await resetSorteoDefinitivo(pass);
    setDefinitiveMatches(null);
    try {
      localStorage.removeItem('pes6_definitive_bracket');
    } catch (e) {}
    showToast('Sorteo oficial reiniciado', 'success');
  };

  return (
    <main>
      {/* Navbar */}
      <nav className="navbar scrolled" id="navbar">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            <span className="logo-vf">VF</span>
            <span className="logo-cup">PES6</span>
          </Link>
          <ul className="nav-links">
            <li><Link href="/evento">Evento</Link></li>
            <li><Link href="/participantes">Participantes</Link></li>
            <li><Link href="/llaves" style={{ color: 'var(--gold)' }}>Llaves</Link></li>
            <li><Link href="/clasificar">Clasificar</Link></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <ThemeToggle />
            <Link href="/" className="nav-back-btn">← VOLVER</Link>
          </div>
        </div>
      </nav>

      {/* Hero de Llaves */}
      <section className="section-llaves-hero" style={{ paddingTop: '7rem', textAlign: 'center', paddingBottom: '2rem' }}>
        <div className="section-label">
          <span className="label-line"></span>
          <span className="label-text">OCTAVOS DE FINAL · MATA MATA</span>
          <span className="label-line"></span>
        </div>
        <h1 className="section-title centered">Cuadro de Llaves<br /><em>Rumbo a la Gloria</em></h1>
        <p className="section-sub centered">
          16 participantes clasificados. 8 cruces mano a mano. Un solo campeón en el Microestadio de Garín.
        </p>

        {/* Barra de Controles de Administrador */}
        {isAdminLoggedIn ? (
          <div className="admin-sorteo-toolbar fade-in visible">
            <div className="admin-toolbar-title">
              <span>⚙️ PANEL DE CONTROL DE SORTEO</span>
              <span className="admin-logged-tag">ADMIN AUTORIZADO</span>
            </div>
            <div className="admin-toolbar-actions">
              <button
                className="btn-toolbar-test"
                onClick={() => openBolillero(true)}
              >
                🎲 Sorteo de Prueba (Simulador)
              </button>
              <button
                className="btn-toolbar-official"
                onClick={() => openBolillero(false)}
              >
                🏆 Iniciar Sorteo Definitivo
              </button>
              {definitiveMatches && (
                <button
                  className="btn-toolbar-reset"
                  onClick={handleResetDefinitive}
                >
                  🔄 Resetear Sorteo
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="public-sorteo-notice">
            {definitiveMatches ? (
              <div className="sorteo-status-badge official">
                <span>🏆 Sorteo Oficial Confirmado para la Gran Final</span>
              </div>
            ) : (
              <div className="sorteo-status-badge pending">
                <span>⏳ Sorteo Oficial Pendiente — ¡Próximamente se sortearán los cruces en vivo!</span>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Cuadro de Torneo (Bracket) */}
      <section className="section-bracket-view" style={{ padding: '1rem 1rem 5rem' }}>
        <TournamentBracket
          matches={definitiveMatches || []}
          isDefinitive={Boolean(definitiveMatches)}
        />
      </section>

      {/* Footer */}
      <footer className="footer" style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="footer-logo" style={{ justifyContent: 'center', marginBottom: '1rem', display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span className="logo-vf" style={{ color: 'var(--gold)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem' }}>VF</span>
          <span className="logo-cup" style={{ color: 'var(--red)', fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.2rem', marginLeft: '5px' }}>PES6</span>
        </div>
        <p style={{ color: 'var(--grey)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>El PES6 más grande de Argentina</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Inicio</Link>
          <Link href="/evento" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Evento</Link>
          <Link href="/participantes" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Participantes</Link>
          <Link href="/llaves" style={{ color: 'var(--gold)', textDecoration: 'none', fontSize: '0.85rem' }}>Llaves</Link>
          <Link href="/clasificar" style={{ color: 'var(--grey)', textDecoration: 'none', fontSize: '0.85rem' }}>Clasificar</Link>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          {!isAdminLoggedIn && (
            <button
              onClick={() => setShowAdminLoginModal(true)}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--grey)',
                fontSize: '0.75rem',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔒 Acceso Admin Sorteo
            </button>
          )}
        </div>
      </footer>

      {/* Modal Bolillero con Animaciones y Sonido */}
      <BolilleroModal
        isOpen={bolilleroOpen}
        onClose={() => setBolilleroOpen(false)}
        allPlayers={playersList}
        isTestMode={bolilleroTestMode}
        onConfirmDefinitive={handleConfirmDefinitive}
      />

      {/* Modal de Login de Admin para Llaves */}
      {showAdminLoginModal && (
        <div className="admin-login-modal-overlay active" onClick={() => setShowAdminLoginModal(false)}>
          <div className="admin-login-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="login-modal-close" onClick={() => setShowAdminLoginModal(false)}>✕</button>
            <div className="login-modal-icon">🎲</div>
            <h3>Administración del Sorteo</h3>
            <p>Ingresá la contraseña de administrador para realizar el sorteo oficial o de prueba.</p>

            <form onSubmit={handleAdminLogin} style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="password"
                placeholder="Contraseña de Administrador"
                value={adminPassInput}
                onChange={(e) => setAdminPassInput(e.target.value)}
                autoFocus
                className="admin-pass-input"
              />
              {adminError && <div className="admin-error-text">{adminError}</div>}
              <button type="submit" disabled={isPending} className="btn-admin-submit">
                {isPending ? 'Verificando...' : 'INGRESAR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
          background: toastMsg.type === 'warning' ? '#9e0029' : '#0d2a18',
          border: `1px solid ${toastMsg.type === 'warning' ? '#E8003D' : '#28c850'}`,
          color: '#fff', padding: '0.85rem 1.75rem', borderRadius: '8px', zIndex: 9999, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          {toastMsg.msg}
        </div>
      )}
    </main>
  );
}
