'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import TournamentBracket from '@/components/TournamentBracket';
import ResultadosModal from '@/components/ResultadosModal';
import OFFICIAL_DEFINITIVE_MATCHES from '@/data/sorteoDefinitivo.json';
import { getClasificadosConVotos, getDailyVoteBonus } from '@/lib/participantes';
import { buildTournamentTree } from '@/lib/tournamentManager';
import { supabase } from '@/lib/supabase';
import { checkAdminPassword, getSorteoDefinitivo, saveTournamentResults } from '../actions';

// Función auxiliar para refrescar fotos en el bracket definitivo con la última información de cada jugador
const refreshMatchesWithLatestPlayers = (matchesArray, currentPlayers) => {
  if (!Array.isArray(matchesArray) || !Array.isArray(currentPlayers)) return matchesArray;
  const playerMap = new Map(currentPlayers.map(p => [Number(p.id), p]));
  return matchesArray.map(m => {
    const p1Updated = m.p1 && playerMap.has(Number(m.p1.id))
      ? { ...m.p1, ...playerMap.get(Number(m.p1.id)) }
      : m.p1;
    const p2Updated = m.p2 && playerMap.has(Number(m.p2.id))
      ? { ...m.p2, ...playerMap.get(Number(m.p2.id)) }
      : m.p2;
    return {
      ...m,
      p1: p1Updated,
      p2: p2Updated
    };
  });
};

export default function LlavesPage() {
  // Participantes completos (16)
  const [playersList, setPlayersList] = useState(() => getClasificadosConVotos());
  const [definitiveMatches, setDefinitiveMatches] = useState(() =>
    refreshMatchesWithLatestPlayers(OFFICIAL_DEFINITIVE_MATCHES, getClasificadosConVotos())
  );
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminPassInput, setAdminPassInput] = useState('');
  const [adminError, setAdminError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Estado de resultados de partidos (Octavos, Cuartos, Semis, Final)
  const [tournamentResults, setTournamentResults] = useState({});
  const [resultadosModalOpen, setResultadosModalOpen] = useState(false);

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
        const parsed = JSON.parse(localSorteo);
        setDefinitiveMatches(refreshMatchesWithLatestPlayers(parsed, list));
      }
      const localResults = localStorage.getItem('pes6_tournament_results');
      if (localResults) {
        setTournamentResults(JSON.parse(localResults));
      }
    } catch (e) {}

    // 2. Sincronizar en segundo plano con Supabase para reflejar últimas fotos subidas por admin
    const syncPlayersAndSorteo = async () => {
      let activeList = list;
      try {
        if (supabase) {
          const { data: supaList } = await supabase.from('clasificados').select('*').order('id', { ascending: true });
          if (supaList && supaList.length > 0) {
            const { likesBonus, dislikesBonus } = getDailyVoteBonus();
            const localMap = new Map(list.map(p => [Number(p.id), p]));
            const merged = supaList.map(sp => {
              const lp = localMap.get(Number(sp.id));
              let effectivePhoto = sp.foto || '';
              if (lp && lp.foto) {
                const localFilename = lp.foto.split('/').pop();
                if (sp.foto && sp.foto.includes(localFilename)) {
                  effectivePhoto = lp.foto;
                }
              }
              return {
                ...sp,
                foto: effectivePhoto,
                likes: (sp.likes || 0) + likesBonus,
                dislikes: (sp.dislikes || 0) + dislikesBonus
              };
            });
            const sorted = [...merged].sort((a, b) => {
              const infA = a.tipo === 'influencer' ? 1 : 0;
              const infB = b.tipo === 'influencer' ? 1 : 0;
              if (infA !== infB) return infB - infA;
              return a.id - b.id;
            });
            activeList = sorted;
            setPlayersList(sorted);
            // Actualizar inmediatamente las llaves en pantalla con los jugadores más recientes de la base de datos
            setDefinitiveMatches(prev => refreshMatchesWithLatestPlayers(prev || OFFICIAL_DEFINITIVE_MATCHES, sorted));
          }
        }
      } catch (err) {
        console.warn('Conexión con Supabase no disponible para clasificados:', err);
      }

      // 3. Consultar base de datos para el sorteo definitivo y resultados guardados
      try {
        const saved = await getSorteoDefinitivo();
        if (saved) {
          if (Array.isArray(saved) && saved.length > 0) {
            const refreshed = refreshMatchesWithLatestPlayers(saved, activeList);
            setDefinitiveMatches(refreshed);
            try {
              localStorage.setItem('pes6_definitive_bracket', JSON.stringify(refreshed));
            } catch (e) {}
          } else if (typeof saved === 'object' && saved.octavos) {
            // saved son los resultados de partidos en vivo
            setTournamentResults(saved);
            // Aseguramos que los cruces base de octavos siempre tengan los jugadores actualizados (reemplazos/fotos)
            const refreshed = refreshMatchesWithLatestPlayers(OFFICIAL_DEFINITIVE_MATCHES, activeList);
            setDefinitiveMatches(refreshed);
            try {
              localStorage.setItem('pes6_tournament_results', JSON.stringify(saved));
              localStorage.setItem('pes6_definitive_bracket', JSON.stringify(refreshed));
            } catch (e) {}
          }
        } else {
          setDefinitiveMatches(refreshMatchesWithLatestPlayers(OFFICIAL_DEFINITIVE_MATCHES, activeList));
        }
      } catch (err) {
        console.warn('No se pudo obtener sorteo de base de datos:', err);
        setDefinitiveMatches(refreshMatchesWithLatestPlayers(OFFICIAL_DEFINITIVE_MATCHES, activeList));
      } finally {
        setLoading(false);
      }
    };

    syncPlayersAndSorteo();

    // Comprobar si ya estaba logueado como admin en esta sesión o viene con ?admin=true
    if (typeof window !== 'undefined') {
      const isLogged = sessionStorage.getItem('pes6_admin_logged') === 'true';
      if (isLogged) {
        setIsAdminLoggedIn(true);
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' && !isLogged) {
        setShowAdminLoginModal(true);
      }
      if (params.get('action') === 'resultados') {
        if (isLogged) {
          setResultadosModalOpen(true);
        } else {
          setShowAdminLoginModal(true);
        }
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

        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          if (params.get('action') === 'resultados') {
            setResultadosModalOpen(true);
          }
        }
      } else {
        setAdminError('Contraseña incorrecta');
      }
    });
  };

  const handleSaveResult = async (round, matchIndex, resultData) => {
    const updated = {
      ...tournamentResults,
      [round]: {
        ...(tournamentResults[round] || {}),
        [matchIndex]: resultData
      }
    };

    setTournamentResults(updated);
    try {
      localStorage.setItem('pes6_tournament_results', JSON.stringify(updated));
    } catch (e) {}

    const pass = (typeof window !== 'undefined' ? (localStorage.getItem('pes6_admin_pass') || sessionStorage.getItem('pes6_admin_pass')) : '') || '';
    if (pass) {
      try {
        await saveTournamentResults(pass, updated);
      } catch (err) {
        console.warn('Error guardando en base de datos:', err);
      }
    }

    showToast('⚽ Marcador guardado y cuadro actualizado', 'success');
  };

  const handleClearResult = async (round, matchIndex) => {
    const roundObj = { ...(tournamentResults[round] || {}) };
    delete roundObj[matchIndex];

    const updated = {
      ...tournamentResults,
      [round]: roundObj
    };

    setTournamentResults(updated);
    try {
      localStorage.setItem('pes6_tournament_results', JSON.stringify(updated));
    } catch (e) {}

    const pass = (typeof window !== 'undefined' ? (localStorage.getItem('pes6_admin_pass') || sessionStorage.getItem('pes6_admin_pass')) : '') || '';
    if (pass) {
      try {
        await saveTournamentResults(pass, updated);
      } catch (err) {}
    }

    showToast('Resultado reseteado a pendiente', 'warning');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('pes6_admin_logged');
      localStorage.removeItem('pes6_admin_pass');
      sessionStorage.removeItem('pes6_admin_logged');
      sessionStorage.removeItem('pes6_admin_pass');
    } catch (e) {}
    showToast('Sesión de administrador cerrada', 'warning');
  };

  const tournamentTree = buildTournamentTree(definitiveMatches || [], tournamentResults);

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
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <ThemeToggle />
            <Link href="/" className="nav-back-btn">← VOLVER</Link>
          </div>
        </div>
      </nav>

      {/* Barra de Notificación de Administrador Conectado */}
      {isAdminLoggedIn && (
        <div className="admin-status-sticky-bar">
          <div className="admin-status-pill">
            <span className="kick-live-pulse" style={{ background: '#00e676', boxShadow: '0 0 10px #00e676', width: '9px', height: '9px' }}></span>
            <strong>CONECTADO COMO ADMINISTRADOR</strong>
            <span className="admin-status-sep">·</span>
            <span>Acceso completo para cargar resultados en vivo y editar cruces</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn-admin-bar-action"
              onClick={() => setResultadosModalOpen(true)}
            >
              ⚽ Cargar Resultados
            </button>
            <button
              type="button"
              className="btn-admin-logout"
              onClick={handleAdminLogout}
              title="Cerrar sesión de administrador en este navegador"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Hero de Llaves */}
      <section className="section-llaves-hero" style={{ paddingTop: isAdminLoggedIn ? '9.5rem' : '7rem', textAlign: 'center', paddingBottom: '2rem' }}>
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="kick-live-pulse" style={{ background: '#00e676', boxShadow: '0 0 8px #00e676', width: '8px', height: '8px' }}></span>
                <span>⚙️ PANEL DE CONTROL DEL EVENTO</span>
              </span>
              <span className="admin-logged-tag" style={{ background: '#00c853', color: '#000', fontWeight: 900 }}>
                ✓ ADMIN CONECTADO
              </span>
            </div>
            <div className="admin-toolbar-actions">
              <button
                className="btn-toolbar-official"
                onClick={() => setResultadosModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #00c853, #009624)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 900,
                  boxShadow: '0 4px 15px rgba(0, 200, 83, 0.4)'
                }}
              >
                ⚽ Cargar Resultados en Vivo
              </button>
              <button
                type="button"
                className="btn-toolbar-logout"
                onClick={handleAdminLogout}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--grey-light)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                🚪 Cerrar Sesión
              </button>
            </div>
          </div>
        ) : (
          <div className="public-sorteo-notice">
            {tournamentTree?.campeon ? (
              <div className="sorteo-status-badge official" style={{ background: 'linear-gradient(135deg, #FFD700, #ff8c00)', color: '#000', fontWeight: 900 }}>
                <span>👑 ¡Torneo Finalizado! Campeón Consagrado: {tournamentTree.campeon.nick}</span>
              </div>
            ) : definitiveMatches ? (
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
          tournamentTree={tournamentTree}
          isDefinitive={Boolean(definitiveMatches)}
          isAdmin={isAdminLoggedIn}
          onOpenEditMatch={() => {
            setResultadosModalOpen(true);
          }}
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
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {!isAdminLoggedIn ? (
            <button
              onClick={() => setShowAdminLoginModal(true)}
              title="Ajustes"
              aria-label="Ajustes"
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
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.8rem', color: '#00e676', fontWeight: 800 }}>
                🟢 Sesión iniciada como Administrador
              </span>
              <button
                onClick={handleAdminLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--grey-light)',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* Modal de Carga de Resultados */}
      <ResultadosModal
        isOpen={resultadosModalOpen}
        onClose={() => setResultadosModalOpen(false)}
        tournamentTree={tournamentTree}
        onSaveResult={handleSaveResult}
        onClearResult={handleClearResult}
        isSaving={isPending}
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

