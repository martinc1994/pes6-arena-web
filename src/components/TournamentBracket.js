'use client';

import React from 'react';

/**
 * Componente que renderiza el cuadro completo del torneo de 16 participantes:
 * Octavos de Final (8 cruces) -> Cuartos de Final -> Semifinales -> Gran Final
 */
export default function TournamentBracket({ matches = [], newlyPlacedId = null, isDefinitive = false }) {
  // Aseguramos que existan 8 partidos de octavos
  const octavosMatches = Array.from({ length: 8 }).map((_, idx) => {
    return matches[idx] || {
      id: idx + 1,
      name: `Cruce #${idx + 1}`,
      p1: null,
      p2: null
    };
  });

  const renderPlayer = (player, slotLabel) => {
    const isNew = player && player.id === newlyPlacedId;
    if (!player) {
      return (
        <div className="bracket-player vacant">
          <div className="bracket-player-avatar vacant">?</div>
          <div className="bracket-player-info">
            <span className="bracket-player-name vacant">Por sortear</span>
            <span className="bracket-player-team vacant">{slotLabel}</span>
          </div>
        </div>
      );
    }

    const isInfluencer = player.tipo === 'influencer';

    return (
      <div className={`bracket-player filled ${isNew ? 'new-arrival' : ''}`}>
        <div className="bracket-player-avatar">
          {player.foto ? (
            <img src={player.foto} alt={player.nick} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <div className="avatar-fallback" style={{ display: player.foto ? 'none' : 'flex' }}>🎮</div>
        </div>
        <div className="bracket-player-info">
          <div className="bracket-player-top">
            <span className="bracket-player-name">{player.nick}</span>
            <span className={`bracket-mini-badge ${isInfluencer ? 'influencer' : 'campeon'}`}>
              {isInfluencer ? 'INF' : 'CMP'}
            </span>
          </div>
          <span className="bracket-player-team">{player.equipo || 'Sin Equipo'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="tournament-bracket-container">
      {/* Barra de estado */}
      <div className="bracket-status-header">
        <div className="bracket-badge-status">
          {isDefinitive ? (
            <span className="badge-definitivo">🏆 SORTEO OFICIAL DEFINITIVO</span>
          ) : (
            <span className="badge-preview">⚡ CUADRO DE OCTAVOS DE FINAL</span>
          )}
        </div>
        <div className="bracket-stats-info">
          16 Participantes · 8 Cruces a Partido Único · Eliminación Directa
        </div>
      </div>

      {/* Grid del Bracket */}
      <div className="bracket-scroll-wrapper">
        <div className="bracket-tree">

          {/* COLUMNA 1: OCTAVOS DE FINAL (Lado Izquierdo: Cruces 1 a 4) */}
          <div className="bracket-column">
            <div className="bracket-column-title">OCTAVOS DE FINAL</div>
            <div className="bracket-matches-list">
              {octavosMatches.slice(0, 4).map((m, idx) => (
                <div key={m.id} className="bracket-match-card">
                  <div className="bracket-match-header">
                    <span>LLAVE #{idx + 1}</span>
                    <span className="match-tag">OCTAVOS</span>
                  </div>
                  <div className="bracket-match-body">
                    {renderPlayer(m.p1, 'Local')}
                    <div className="bracket-vs-badge">VS</div>
                    {renderPlayer(m.p2, 'Visitante')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMNA 2: CUARTOS DE FINAL (Lado Izquierdo: Cruces 1-2 y 3-4) */}
          <div className="bracket-column">
            <div className="bracket-column-title">CUARTOS</div>
            <div className="bracket-matches-list space-around">
              <div className="bracket-match-card projected">
                <div className="bracket-match-header">
                  <span>CUARTOS #1</span>
                </div>
                <div className="bracket-match-body">
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #1</span>
                  </div>
                  <div className="bracket-vs-badge">VS</div>
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #2</span>
                  </div>
                </div>
              </div>

              <div className="bracket-match-card projected">
                <div className="bracket-match-header">
                  <span>CUARTOS #2</span>
                </div>
                <div className="bracket-match-body">
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #3</span>
                  </div>
                  <div className="bracket-vs-badge">VS</div>
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #4</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 3: SEMIFINALES + GRAN FINAL EN EL CENTRO */}
          <div className="bracket-column center-stage">
            <div className="bracket-column-title highlight">GRAN FINAL</div>
            <div className="bracket-final-showcase">
              <div className="trophy-icon-banner">🏆</div>
              <div className="final-title-text">PES6 ARENA 2026</div>
              <div className="final-subtitle">22 DE NOVIEMBRE · GARÍN</div>

              <div className="bracket-match-card final-card">
                <div className="bracket-match-header gold">
                  <span>GRAN FINAL POR EL TRONO</span>
                </div>
                <div className="bracket-match-body">
                  <div className="bracket-player projected final">
                    <span className="projected-text">Ganador Semifinal 1</span>
                  </div>
                  <div className="bracket-vs-badge final">VS</div>
                  <div className="bracket-player projected final">
                    <span className="projected-text">Ganador Semifinal 2</span>
                  </div>
                </div>
              </div>

              {/* Semifinales mini */}
              <div className="semis-preview-grid">
                <div className="semi-pill">
                  <span className="semi-label">SEMIFINAL 1</span>
                  <span className="semi-sub">Ganador C1 vs C2</span>
                </div>
                <div className="semi-pill">
                  <span className="semi-label">SEMIFINAL 2</span>
                  <span className="semi-sub">Ganador C3 vs C4</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 4: CUARTOS DE FINAL (Lado Derecho: Cruces 5-6 y 7-8) */}
          <div className="bracket-column">
            <div className="bracket-column-title">CUARTOS</div>
            <div className="bracket-matches-list space-around">
              <div className="bracket-match-card projected">
                <div className="bracket-match-header">
                  <span>CUARTOS #3</span>
                </div>
                <div className="bracket-match-body">
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #5</span>
                  </div>
                  <div className="bracket-vs-badge">VS</div>
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #6</span>
                  </div>
                </div>
              </div>

              <div className="bracket-match-card projected">
                <div className="bracket-match-header">
                  <span>CUARTOS #4</span>
                </div>
                <div className="bracket-match-body">
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #7</span>
                  </div>
                  <div className="bracket-vs-badge">VS</div>
                  <div className="bracket-player projected">
                    <span className="projected-text">Ganador Llave #8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA 5: OCTAVOS DE FINAL (Lado Derecho: Cruces 5 a 8) */}
          <div className="bracket-column">
            <div className="bracket-column-title">OCTAVOS DE FINAL</div>
            <div className="bracket-matches-list">
              {octavosMatches.slice(4, 8).map((m, idx) => (
                <div key={m.id} className="bracket-match-card">
                  <div className="bracket-match-header">
                    <span>LLAVE #{idx + 5}</span>
                    <span className="match-tag">OCTAVOS</span>
                  </div>
                  <div className="bracket-match-body">
                    {renderPlayer(m.p1, 'Local')}
                    <div className="bracket-vs-badge">VS</div>
                    {renderPlayer(m.p2, 'Visitante')}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

