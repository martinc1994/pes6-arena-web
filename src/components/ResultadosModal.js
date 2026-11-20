'use client';

import React, { useState } from 'react';

export default function ResultadosModal({
  isOpen,
  onClose,
  tournamentTree,
  onSaveResult,
  onClearResult,
  isSaving = false
}) {
  const [activeTab, setActiveTab] = useState('octavos'); // 'octavos' | 'cuartos' | 'semis' | 'final'

  // Estado local para edición de partido: { round: 'octavos', matchIndex: 0, s1: 0, s2: 0, winnerId: null, winMethod: '90min' }
  const [editingKey, setEditingKey] = useState(null);
  const [formScore1, setFormScore1] = useState('');
  const [formScore2, setFormScore2] = useState('');
  const [formWinnerId, setFormWinnerId] = useState(null);
  const [formWinMethod, setFormWinMethod] = useState('90min');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !tournamentTree) return null;

  const { octavos, cuartos, semis, final: finalMatch, campeon } = tournamentTree;

  const startEdit = (round, matchIndex, match) => {
    setEditingKey(`${round}-${matchIndex}`);
    setFormScore1(match.score1 !== null ? String(match.score1) : '');
    setFormScore2(match.score2 !== null ? String(match.score2) : '');
    setFormWinnerId(match.winnerId || null);
    setFormWinMethod(match.winMethod || '90min');
    setErrorMsg('');
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setErrorMsg('');
  };

  const handleScoreChange = (val1, val2, p1, p2) => {
    setFormScore1(val1);
    setFormScore2(val2);
    setErrorMsg('');

    const n1 = val1 !== '' ? Number(val1) : null;
    const n2 = val2 !== '' ? Number(val2) : null;

    if (n1 !== null && n2 !== null) {
      if (n1 > n2) {
        setFormWinnerId(p1 ? p1.id : null);
        setFormWinMethod('90min');
      } else if (n2 > n1) {
        setFormWinnerId(p2 ? p2.id : null);
        setFormWinMethod('90min');
      } else {
        // Empate: mantener el winnerId si coincide con uno, o null para forzar selección
        setFormWinMethod(prev => (prev === '90min' ? 'penales' : prev));
      }
    }
  };

  const submitSave = (round, matchIndex, p1, p2) => {
    const s1 = formScore1.trim() !== '' ? parseInt(formScore1, 10) : null;
    const s2 = formScore2.trim() !== '' ? parseInt(formScore2, 10) : null;

    if (s1 === null || isNaN(s1) || s2 === null || isNaN(s2) || s1 < 0 || s2 < 0) {
      setErrorMsg('Ingresá los goles de ambos participantes (números válidos mayores o iguales a 0).');
      return;
    }

    let winnerId = formWinnerId;
    let winMethod = formWinMethod;

    if (s1 > s2) {
      winnerId = p1.id;
      winMethod = '90min';
    } else if (s2 > s1) {
      winnerId = p2.id;
      winMethod = '90min';
    } else {
      // Empate: debe haber un ganador elegido por alargue o penales
      if (!winnerId) {
        setErrorMsg('El partido terminó empatado: seleccioná quién avanzó por alargue o penales.');
        return;
      }
      if (winMethod === '90min') {
        winMethod = 'penales';
      }
    }

    onSaveResult(round, matchIndex, {
      score1: s1,
      score2: s2,
      winnerId,
      winMethod
    });

    setEditingKey(null);
    setErrorMsg('');
  };

  const renderMatchRow = (round, idx, match) => {
    const isEditing = editingKey === `${round}-${idx}`;
    const p1 = match.p1;
    const p2 = match.p2;
    const canPlay = Boolean(p1 && p2);

    const isEmpate = formScore1 !== '' && formScore2 !== '' && Number(formScore1) === Number(formScore2);

    return (
      <div key={`${round}-${idx}`} className={`admin-match-edit-card ${match.isCompleted ? 'completed' : ''}`}>
        <div className="admin-match-header-row">
          <span className="admin-match-title">{match.name}</span>
          {match.isCompleted ? (
            <span className="admin-match-badge completed">
              ✓ FINALIZADO: {match.score1} - {match.score2} {match.winMethod === 'penales' ? '(Pen.)' : match.winMethod === 'alargue' ? '(Alargue)' : ''}
            </span>
          ) : canPlay ? (
            <span className="admin-match-badge pending">⏳ PENDIENTE DE JUGAR</span>
          ) : (
            <span className="admin-match-badge locked">🔒 ESPERANDO CRUCE</span>
          )}
        </div>

        {/* Participantes */}
        <div className="admin-match-teams-grid">
          {/* Local */}
          <div className={`admin-team-col ${match.winnerId === p1?.id ? 'winner' : ''}`}>
            <div className="admin-team-avatar-box">
              {p1?.foto ? (
                <img src={p1.foto} alt={p1.nick} />
              ) : (
                <div className="admin-team-avatar-fallback">?</div>
              )}
            </div>
            <div className="admin-team-info">
              <span className="admin-team-role">LOCAL</span>
              <strong className="admin-team-nick">{p1 ? p1.nick : match.sourceA || 'Por definir'}</strong>
              <small className="admin-team-sub">{p1?.equipo || '—'}</small>
            </div>
          </div>

          <div className="admin-match-vs">VS</div>

          {/* Visitante */}
          <div className={`admin-team-col ${match.winnerId === p2?.id ? 'winner' : ''}`}>
            <div className="admin-team-avatar-box">
              {p2?.foto ? (
                <img src={p2.foto} alt={p2.nick} />
              ) : (
                <div className="admin-team-avatar-fallback">?</div>
              )}
            </div>
            <div className="admin-team-info">
              <span className="admin-team-role">VISITANTE</span>
              <strong className="admin-team-nick">{p2 ? p2.nick : match.sourceB || 'Por definir'}</strong>
              <small className="admin-team-sub">{p2?.equipo || '—'}</small>
            </div>
          </div>
        </div>

        {/* Zona de Edición o Acciones */}
        {canPlay && (
          <div className="admin-match-actions-area">
            {isEditing ? (
              <div className="admin-match-form-box">
                <div className="admin-score-inputs-row">
                  <div className="admin-score-input-group">
                    <label>{p1.nick}</label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={formScore1}
                      onChange={(e) => handleScoreChange(e.target.value, formScore2, p1, p2)}
                      placeholder="0"
                      autoFocus
                    />
                  </div>

                  <span className="admin-score-sep">-</span>

                  <div className="admin-score-input-group">
                    <label>{p2.nick}</label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={formScore2}
                      onChange={(e) => handleScoreChange(formScore1, e.target.value, p1, p2)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Si hay empate, selector de desempate */}
                {isEmpate && (
                  <div className="admin-empate-box">
                    <div className="admin-empate-title">
                      ⚠️ Empate registrado en 90'. ¿Quién clasificó?
                    </div>

                    <div className="admin-empate-options">
                      <button
                        type="button"
                        className={`btn-empate-pick ${formWinnerId === p1.id ? 'active' : ''}`}
                        onClick={() => setFormWinnerId(p1.id)}
                      >
                        ⚽ Clasifica {p1.nick}
                      </button>
                      <button
                        type="button"
                        className={`btn-empate-pick ${formWinnerId === p2.id ? 'active' : ''}`}
                        onClick={() => setFormWinnerId(p2.id)}
                      >
                        ⚽ Clasifica {p2.nick}
                      </button>
                    </div>

                    <div className="admin-method-picker">
                      <label>Definido por:</label>
                      <label className="radio-pill">
                        <input
                          type="radio"
                          name={`method-${round}-${idx}`}
                          checked={formWinMethod === 'penales'}
                          onChange={() => setFormWinMethod('penales')}
                        />
                        Penales
                      </label>
                      <label className="radio-pill">
                        <input
                          type="radio"
                          name={`method-${round}-${idx}`}
                          checked={formWinMethod === 'alargue'}
                          onChange={() => setFormWinMethod('alargue')}
                        />
                        Alargue
                      </label>
                    </div>
                  </div>
                )}

                {errorMsg && <div className="admin-form-error">{errorMsg}</div>}

                <div className="admin-form-buttons">
                  <button
                    type="button"
                    className="btn-admin-cancel"
                    onClick={cancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-admin-save"
                    onClick={() => submitSave(round, idx, p1, p2)}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : '💾 Confirmar Resultado'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="admin-match-view-buttons">
                <button
                  type="button"
                  className="btn-admin-edit-score"
                  onClick={() => startEdit(round, idx, match)}
                >
                  {match.isCompleted ? '✏️ Modificar Marcador' : '⚽ Cargar Resultado'}
                </button>

                {match.isCompleted && (
                  <button
                    type="button"
                    className="btn-admin-clear-score"
                    onClick={() => onClearResult(round, idx)}
                    title="Borrar resultado y volver a pendiente"
                  >
                    🗑️ Resetear
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="admin-resultados-overlay" onClick={onClose}>
      <div className="admin-resultados-modal" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="resultados-modal-header">
          <div className="resultados-modal-title">
            <span className="resultados-tag">PANEL EN VIVO</span>
            <h2>⚽ CARGA DE RESULTADOS DEL TORNEO</h2>
            <p>
              Cargá los goles de cada partido a medida que avance el evento. Los ganadores avanzarán automáticamente en el cuadro.
            </p>
          </div>
          <button className="resultados-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Banner de Campeón si ya está definido */}
        {campeon && (
          <div className="admin-champion-announcement">
            <div className="trophy-bounce">👑 🏆</div>
            <div>
              <h3>¡CAMPEÓN DEFINIDO: {campeon.nick}!</h3>
              <p>El trono del PES6 ARENA 2026 ya tiene dueño ({campeon.equipo || 'Sin Equipo'}).</p>
            </div>
          </div>
        )}

        {/* Pestañas de Ronda */}
        <div className="resultados-tabs">
          <button
            className={`tab-btn ${activeTab === 'octavos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('octavos'); cancelEdit(); }}
          >
            <span>OCTAVOS DE FINAL</span>
            <span className="tab-count">
              {octavos.filter(m => m.isCompleted).length} / 8
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'cuartos' ? 'active' : ''}`}
            onClick={() => { setActiveTab('cuartos'); cancelEdit(); }}
          >
            <span>CUARTOS</span>
            <span className="tab-count">
              {cuartos.filter(m => m.isCompleted).length} / 4
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'semis' ? 'active' : ''}`}
            onClick={() => { setActiveTab('semis'); cancelEdit(); }}
          >
            <span>SEMIFINALES</span>
            <span className="tab-count">
              {semis.filter(m => m.isCompleted).length} / 2
            </span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'final' ? 'active' : ''}`}
            onClick={() => { setActiveTab('final'); cancelEdit(); }}
          >
            <span>GRAN FINAL</span>
            <span className="tab-count">
              {finalMatch.isCompleted ? '1 / 1' : '0 / 1'}
            </span>
          </button>
        </div>

        {/* Lista de Partidos según Ronda Activa */}
        <div className="resultados-matches-list">
          {activeTab === 'octavos' && (
            <div className="matches-column">
              {octavos.map((m, idx) => renderMatchRow('octavos', idx, m))}
            </div>
          )}

          {activeTab === 'cuartos' && (
            <div className="matches-column">
              {cuartos.map((m, idx) => renderMatchRow('cuartos', idx, m))}
            </div>
          )}

          {activeTab === 'semis' && (
            <div className="matches-column">
              {semis.map((m, idx) => renderMatchRow('semis', idx, m))}
            </div>
          )}

          {activeTab === 'final' && (
            <div className="matches-column">
              {renderMatchRow('final', 0, finalMatch)}
            </div>
          )}
        </div>

        {/* Footer del Modal */}
        <div className="resultados-modal-footer">
          <button className="btn-modal-done" onClick={onClose}>
            ✓ Cerrar y Ver Cuadro
          </button>
        </div>
      </div>
    </div>
  );
}
