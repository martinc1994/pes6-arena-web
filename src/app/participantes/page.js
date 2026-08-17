'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { voteClasificado } from '../actions';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const TOTAL_SLOTS = 16;

export default function ParticipantesPage() {
  const [toastMsg, setToastMsg] = useState(null);
  const [clasificados, setClasificados] = useState([]);
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
      return { text: '🎙️ INFLUENCER', className: 'badge-influencer' };
    }
    return { text: c.desc_text || 'CLASIFICADO', className: 'badge-campeon' };
  };

  const fetchDatos = async () => {
    if (!supabase) return;
    const { data: clas } = await supabase.from('clasificados').select('*').order('id', { ascending: true });
    if (clas) {
      const sorted = [...clas].sort((a, b) => {
        const infA = a.tipo === 'influencer' ? 1 : 0;
        const infB = b.tipo === 'influencer' ? 1 : 0;
        if (infA !== infB) return infB - infA;
        return a.id - b.id;
      });
      setClasificados(sorted);
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <ThemeToggle />
            <Link href="/" className="nav-back-btn">← VOLVER</Link>
          </div>
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
              const isInfluencer = c.tipo === 'influencer';
              return (
                <div
                  key={c.id}
                  className={`champion-card ${isInfluencer ? 'champion-card-influencer' : ''} fade-in visible`}
                  onClick={() => setSelectedChampion(c)}
                  style={{ cursor: 'pointer' }}
                >
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

      <footer className="footer" style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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

      {/* Detail Modal (Detalle Participante) */}
      {selectedChampion && (() => {
        const { name, team } = getNickAndEquipo(selectedChampion);
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
