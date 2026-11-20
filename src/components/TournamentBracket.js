'use client';

import React from 'react';
import { buildTournamentTree } from '@/lib/tournamentManager';

/**
 * Componente que renderiza el cuadro completo del torneo de 16 participantes:
 * Octavos de Final (8 cruces) -> Cuartos de Final (4) -> Semifinales (2) -> Gran Final (1) -> Campeón
 */
export default function TournamentBracket({
  matches = [],
  tournamentTree = null,
  newlyPlacedId = null,
  isDefinitive = false,
  isAdmin = false,
  onOpenEditMatch = null
}) {
  // Si no se pasó tournamentTree directamente, lo calculamos a partir de matches
  const tree = tournamentTree || buildTournamentTree(matches);
  const { octavos, cuartos, semis, final: finalMatch, campeon } = tree;

  const renderPlayer = (player, fallbackLabel, score = null, isWinner = false, isLoser = false) => {
    const isNew = player && player.id === newlyPlacedId;

    if (!player) {
      return (
        <div className="bracket-player vacant">
          <div className="bracket-player-avatar vacant">?</div>
          <div className="bracket-player-info">
            <span className="bracket-player-name vacant">{fallbackLabel}</span>
            <span className="bracket-player-team vacant">Por clasificar</span>
          </div>
        </div>
      );
    }

    const isInfluencer = player.tipo === 'influencer';

    return (
      <div
        className={`bracket-player filled ${isNew ? 'new-arrival' : ''} ${isWinner ? 'is-winner' : ''} ${
          isLoser ? 'is-loser' : ''
        }`}
      >
        <div className="bracket-player-avatar">
          {player.foto ? (
            <img
              src={player.foto}
              alt={player.nick}
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="avatar-fallback" style={{ display: player.foto ? 'none' : 'flex' }}>
            🎮
          </div>
          {isWinner && <span className="winner-crown-micro">👑</span>}
        </div>

        <div className="bracket-player-info">
          <div className="bracket-player-top">
            <span className="bracket-player-name">{player.nick}</span>
            <span className={`bracket-mini-badge ${isInfluencer ? 'influencer' : 'campeon'}`}>
              {isInfluencer ? 'INF' : 'CMP'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bracket-player-team">{player.equipo || 'Sin Equipo'}</span>
            {score !== null && score !== undefined && (
              <span className={`bracket-player-score ${isWinner ? 'winner-score' : ''}`}>{score}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderMatch = (match, round, matchIndex, customHeader = null) => {
    const isCompleted = match.isCompleted;
    const p1 = match.p1;
    const p2 = match.p2;
    const isReady = Boolean(p1 && p2);

    return (
      <div
        key={`${round}-${match.id}`}
        className={`bracket-match-card ${isCompleted ? 'completed-match' : ''} ${!isReady ? 'projected' : ''}`}
      >
        <div className="bracket-match-header">
          <span>{customHeader || match.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isCompleted ? (
              <span className="match-tag-completed">
                {match.score1} - {match.score2}{' '}
                {match.winMethod === 'penales' ? '(Pen.)' : match.winMethod === 'alargue' ? '(Alargue)' : ''}
              </span>
            ) : (
              <span className="match-tag">{round.toUpperCase()}</span>
            )}
            {isAdmin && isReady && onOpenEditMatch && (
              <button
                type="button"
                className="bracket-quick-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditMatch(round, matchIndex);
                }}
                title="Cargar o modificar resultado"
              >
                ✏️ Cargar
              </button>
            )}
          </div>
        </div>

        <div className="bracket-match-body">
          {renderPlayer(
            p1,
            match.sourceA || 'Local',
            match.score1,
            isCompleted && match.winnerId === p1?.id,
            isCompleted && match.winnerId && match.winnerId !== p1?.id
          )}

          <div className={`bracket-vs-badge ${isCompleted ? 'has-score' : ''}`}>
            {isCompleted ? `${match.score1} - ${match.score2}` : 'VS'}
          </div>

          {renderPlayer(
            p2,
            match.sourceB || 'Visitante',
            match.score2,
            isCompleted && match.winnerId === p2?.id,
            isCompleted && match.winnerId && match.winnerId !== p2?.id
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tournament-bracket-container">
      {/* Barra de estado */}
      <div className="bracket-status-header">
        <div className="bracket-badge-status">
          {campeon ? (
            <span className="badge-definitivo" style={{ background: 'linear-gradient(135deg, #FFD700, #ff8c00)' }}>
              👑 ¡TORNEO FINALIZADO · CAMPEÓN CONSAGRADO!
            </span>
          ) : isDefinitive ? (
            <span className="badge-definitivo">🏆 CUADRO OFICIAL DEFINITIVO</span>
          ) : (
            <span className="badge-preview">⚡ CUADRO DE OCTAVOS DE FINAL</span>
          )}
        </div>
        <div className="bracket-stats-info">
          16 Participantes · 8 Cruces a Partido Único · Eliminación Directa
        </div>
      </div>

      {/* Showcase de Campeón si ya fue definido */}
      {campeon && (
        <div className="bracket-champion-showcase-box fade-in">
          <div className="champion-aura"></div>
          <div className="champion-trophy-top">🏆</div>
          <span className="champion-title-tag">CAMPEÓN DEL PES6 ARENA 2026</span>
          <div className="champion-avatar-wrap">
            {campeon.foto ? (
              <img src={campeon.foto} alt={campeon.nick} />
            ) : (
              <div className="champion-avatar-fallback">👑</div>
            )}
            <div className="champion-badge-float">GLORIA ETERNA</div>
          </div>
          <h2 className="champion-nick-banner">{campeon.nick}</h2>
          <span className="champion-team-banner">⚽ {campeon.equipo || 'Campeón Invicto'}</span>
        </div>
      )}

      {/* Grid del Bracket */}
      <div className="bracket-scroll-wrapper">
        <div className="bracket-tree">
          {/* COLUMNA 1: OCTAVOS DE FINAL (Lado Izquierdo: Cruces 1 a 4) */}
          <div className="bracket-column">
            <div className="bracket-column-title">OCTAVOS DE FINAL</div>
            <div className="bracket-matches-list">
              {octavos.slice(0, 4).map((m, idx) => renderMatch(m, 'octavos', idx))}
            </div>
          </div>

          {/* COLUMNA 2: CUARTOS DE FINAL (Lado Izquierdo: Cruces 1-2 y 3-4) */}
          <div className="bracket-column">
            <div className="bracket-column-title">CUARTOS</div>
            <div className="bracket-matches-list space-around">
              {renderMatch(cuartos[0], 'cuartos', 0)}
              {renderMatch(cuartos[1], 'cuartos', 1)}
            </div>
          </div>

          {/* COLUMNA 3: SEMIFINALES + GRAN FINAL EN EL CENTRO */}
          <div className="bracket-column center-stage">
            <div className="bracket-column-title highlight">GRAN FINAL</div>
            <div className="bracket-final-showcase">
              <div className="trophy-icon-banner">🏆</div>
              <div className="final-title-text">PES6 ARENA 2026</div>
              <div className="final-subtitle">DOMINGO 22 DE NOVIEMBRE · GARÍN</div>

              {/* Gran Final Card */}
              <div className="final-match-container">
                {renderMatch(finalMatch, 'final', 0, 'GRAN FINAL POR EL TRONO')}
              </div>

              {/* Semifinales Cards */}
              <div className="bracket-column-title" style={{ fontSize: '0.8rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
                SEMIFINALES
              </div>
              <div className="semis-matches-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {renderMatch(semis[0], 'semis', 0, 'SEMIFINAL 1')}
                {renderMatch(semis[1], 'semis', 1, 'SEMIFINAL 2')}
              </div>
            </div>
          </div>

          {/* COLUMNA 4: CUARTOS DE FINAL (Lado Derecho: Cruces 5-6 y 7-8) */}
          <div className="bracket-column">
            <div className="bracket-column-title">CUARTOS</div>
            <div className="bracket-matches-list space-around">
              {renderMatch(cuartos[2], 'cuartos', 2)}
              {renderMatch(cuartos[3], 'cuartos', 3)}
            </div>
          </div>

          {/* COLUMNA 5: OCTAVOS DE FINAL (Lado Derecho: Cruces 5 a 8) */}
          <div className="bracket-column">
            <div className="bracket-column-title">OCTAVOS DE FINAL</div>
            <div className="bracket-matches-list">
              {octavos.slice(4, 8).map((m, idx) => renderMatch(m, 'octavos', idx + 4))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
