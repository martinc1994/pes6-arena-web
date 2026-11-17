'use client';

import React, { useEffect, useRef, useState } from 'react';
import { soundPlayer } from '@/lib/soundEffects';

const SEEDED_IDS = [24, 25, 26, 27, 28, 30, 33];
// Cubilla (24), Benja Calero (25), Nickoema (26), El Tío Bock (27), Maxi (28), Facu Codeso (30), Cabra (33)

export const isSeededPlayer = (p) => {
  if (!p) return false;
  if (SEEDED_IDS.includes(Number(p.id))) return true;
  const name = (p.nick || '').toLowerCase();
  return (
    name.includes('benja') ||
    name.includes('cubilla') ||
    name.includes('nicko') ||
    name.includes('codeso') ||
    name.includes('maxi') ||
    name.includes('bock') ||
    name.includes('cabra')
  );
};

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Dibuja una pelota de fútbol realista en el Canvas con gajos negros y costuras
function drawSoccerBall(ctx, x, y, r, rot, num) {
  ctx.save();
  ctx.translate(x, y);

  // 1. Recorte circular para la esfera del balón
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.save();
  ctx.clip();

  // Fondo de cuero blanco
  ctx.fillStyle = '#f8f9fa';
  ctx.fill();

  // Rotación física del balón
  ctx.rotate(rot);

  // 5 gajos perimetrales negros
  ctx.fillStyle = '#18181c';
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * (r * 0.95), Math.sin(a) * (r * 0.95), r * 0.38, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pentágono negro central
  const pentR = r * 0.38;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * pentR;
    const py = Math.sin(a) * pentR;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#141416';
  ctx.fill();

  // Líneas de costura desde el pentágono hacia los bordes
  ctx.strokeStyle = '#2b2b36';
  ctx.lineWidth = 1.1;
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(a) * pentR;
    const py = Math.sin(a) * pentR;
    const ox = Math.cos(a + Math.PI / 5) * (r * 0.95);
    const oy = Math.sin(a + Math.PI / 5) * (r * 0.95);
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(ox, oy);
    ctx.stroke();
  }

  // Sombreado esférico 3D y brillo de luz
  const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.38, r * 0.08, 0, 0, r);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.06)');
  grad.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.restore(); // fin clip

  // Borde exterior
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Número dorado en el centro (sin rotar para que siempre sea legible)
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 4;
  ctx.font = `900 ${Math.round(r * 0.8)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(num.toString(), 0, 1);

  ctx.restore();
}

export default function BolilleroModal({
  isOpen,
  onClose,
  allPlayers = [],
  isTestMode = true,
  onConfirmDefinitive = null
}) {
  const canvasRef = useRef(null);
  const plannedSlotsRef = useRef([]);
  const currentSlotRef = useRef(0);

  const [availableCount, setAvailableCount] = useState(16);
  const [matches, setMatches] = useState(
    Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      name: `Llave #${i + 1}`,
      p1: null,
      p2: null
    }))
  );

  const [currentSlotIndex, setCurrentSlotIndex] = useState(0); // 0 a 16
  const [isSpinning, setIsSpinning] = useState(false);
  const [extractedBall, setExtractedBall] = useState(null);
  const [revealedPlayer, setRevealedPlayer] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Inicializar o reiniciar bolillero con la regla de 7 Cabezas de Serie en llaves distintas
  const initDraw = () => {
    setIsFinished(false);
    setIsAuto(false);
    setIsSpinning(false);
    setCurrentSlotIndex(0);
    currentSlotRef.current = 0;
    setExtractedBall(null);
    setRevealedPlayer(null);
    setShowConfirmModal(false);

    const source = allPlayers && allPlayers.length > 0 ? allPlayers : [];
    const seeded = source.filter((p) => isSeededPlayer(p));
    const nonSeeded = source.filter((p) => !isSeededPlayer(p));

    // 1. Elegir 7 llaves distintas al azar entre las 8 (0 a 7) para los 7 cabezas de serie
    const matchIndices = [0, 1, 2, 3, 4, 5, 6, 7];
    const chosenMatches = shuffle(matchIndices).slice(0, 7);
    const shuffledSeeded = shuffle(seeded);

    const planned = new Array(16).fill(null);

    // 2. Ubicar a cada cabeza de serie en una llave distinta (Local o Visitante al azar)
    chosenMatches.forEach((mIdx, i) => {
      const isVisitante = Math.random() < 0.5;
      const slot = mIdx * 2 + (isVisitante ? 1 : 0);
      planned[slot] = shuffledSeeded[i];
    });

    // 3. Rellenar los 9 lugares restantes con los no cabezas de serie
    const shuffledNonSeeded = shuffle(nonSeeded);
    let nonIdx = 0;
    for (let s = 0; s < 16; s++) {
      if (!planned[s]) {
        planned[s] = shuffledNonSeeded[nonIdx++];
      }
    }

    plannedSlotsRef.current = planned;
    setAvailableCount(16);

    setMatches(
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: `Llave #${i + 1}`,
        p1: null,
        p2: null
      }))
    );
  };

  useEffect(() => {
    if (isOpen) {
      initDraw();
    }
  }, [isOpen]);

  // Canvas Physics para las pelotas de fútbol dentro del bolillero
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const width = (canvas.width = 300);
    const height = (canvas.height = 300);
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 125;

    const count = Math.max(availableCount, 1);
    const ballRadius = 16.5; // Tamaño mayor solicitado para pelotas de fútbol

    const balls = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius - 32);
      return {
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: ballRadius,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        num: i + 1
      };
    });

    let clickTimer = 0;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Esfera de cristal
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 20, 35, 0.65)';
      ctx.fill();

      const grad = ctx.createRadialGradient(centerX - 35, centerY - 45, 10, centerX, centerY, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.lineWidth = 4;
      ctx.strokeStyle = isSpinning ? '#FFD700' : 'rgba(255, 215, 0, 0.4)';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = isSpinning ? 20 : 6;
      ctx.stroke();
      ctx.restore();

      // 2. Anillo metálico
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, Math.PI * 0.15, Math.PI * 0.85);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(200, 200, 220, 0.5)';
      ctx.stroke();
      ctx.restore();

      // 3. Simulación física y rebote de pelotas de fútbol
      const speedMultiplier = isSpinning ? 2.5 : 0.8;
      clickTimer++;

      balls.forEach((b) => {
        if (isSpinning) {
          b.vx += (Math.random() - 0.5) * 1.5;
          b.vy += (Math.random() - 0.5) * 1.5;
        }

        b.x += b.vx * speedMultiplier;
        b.y += b.vy * speedMultiplier;
        b.rot += b.vx * 0.04 + b.vRot;

        b.vx *= 0.99;
        b.vy *= 0.99;

        const dx = b.x - centerX;
        const dy = b.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist + b.r > radius - 4) {
          const normalX = dx / dist;
          const normalY = dy / dist;
          const dot = b.vx * normalX + b.vy * normalY;

          b.vx = (b.vx - 2 * dot * normalX) * 0.92;
          b.vy = (b.vy - 2 * dot * normalY) * 0.92;
          b.vRot = (Math.random() - 0.5) * 0.12;

          b.x = centerX + normalX * (radius - 4 - b.r);
          b.y = centerY + normalY * (radius - 4 - b.r);

          if (isSpinning && clickTimer % 6 === 0) {
            soundPlayer?.playBallClick();
          }
        }

        // Dibujar la pelota de fútbol con sus costuras y número
        drawSoccerBall(ctx, b.x, b.y, b.r, b.rot, b.num);
      });

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isSpinning, availableCount]);

  // Extraer una bolilla / pelota de fútbol
  const drawNextBall = () => {
    if (isSpinning) return;
    const currentSlot = currentSlotRef.current;
    const planned = plannedSlotsRef.current;

    if (!planned || currentSlot >= 16) {
      setIsFinished(true);
      setIsAuto(false);
      return;
    }

    setIsSpinning(true);
    // Sonido de golpe seco al balón + aceleración
    soundPlayer?.playKick();
    soundPlayer?.playWhoosh();

    // Tiempo de giro suspense (1.2 segundos). La tarjeta previa sigue visible sin desaparecer.
    setTimeout(() => {
      const slotIdx = currentSlotRef.current;
      if (slotIdx >= 16) {
        setIsSpinning(false);
        return;
      }

      const chosenPlayer = plannedSlotsRef.current[slotIdx];
      const matchIndex = Math.floor(slotIdx / 2);
      const isSlotP1 = slotIdx % 2 === 0;
      const isSeeded = isSeededPlayer(chosenPlayer);

      const ballData = {
        number: slotIdx + 1,
        player: chosenPlayer,
        matchNumber: matchIndex + 1,
        slotName: isSlotP1 ? 'Local' : 'Visitante',
        slotLabel: `Llave #${matchIndex + 1} (${isSlotP1 ? 'Local' : 'Visitante'})`,
        isSeeded
      };

      // Establecer tarjeta de revelación (se mantiene fija en pantalla sin desaparecer)
      setExtractedBall(ballData);
      setRevealedPlayer(chosenPlayer);
      setIsSpinning(false);

      // Sonido de GOL con tribuna de fondo!
      soundPlayer?.playReveal();

      // Actualizar matches
      setMatches((prev) => {
        const copy = [...prev];
        if (isSlotP1) {
          copy[matchIndex] = { ...copy[matchIndex], p1: chosenPlayer };
        } else {
          copy[matchIndex] = { ...copy[matchIndex], p2: chosenPlayer };
        }
        return copy;
      });

      const nextSlot = slotIdx + 1;
      currentSlotRef.current = nextSlot;
      setCurrentSlotIndex(nextSlot);
      setAvailableCount(16 - nextSlot);

      // Desplazamiento horizontal EXCLUSIVO dentro de la tira de llaves
      setTimeout(() => {
        const container = document.getElementById('mini-matches-scroll-container');
        const targetCard = document.getElementById(`mini-match-${matchIndex + 1}`);
        if (container && targetCard) {
          const cRect = container.getBoundingClientRect();
          const tRect = targetCard.getBoundingClientRect();
          container.scrollLeft += (tRect.left - cRect.left) - (cRect.width / 2) + (tRect.width / 2);
        }
      }, 150);

      if (nextSlot >= 16) {
        setIsFinished(true);
        setIsAuto(false);
        setTimeout(() => soundPlayer?.playFanfare(), 2500);
      }
    }, 1200);
  };

  // Modo automático: tiempo extendido entre pelotas para disfrutar la foto y los detalles
  useEffect(() => {
    let timer;
    if (isAuto && !isSpinning && !isFinished && currentSlotIndex < 16) {
      timer = setTimeout(() => {
        drawNextBall();
      }, 5500);
    }
    return () => clearTimeout(timer);
  }, [isAuto, isSpinning, isFinished, currentSlotIndex]);

  // Saltear animación y completar sorteo al instante
  const skipRemaining = () => {
    if (isFinished || currentSlotRef.current >= 16) return;
    setIsAuto(false);
    setIsSpinning(false);

    const planned = plannedSlotsRef.current;
    const newMatches = [...matches];

    for (let slot = currentSlotRef.current; slot < 16; slot++) {
      const matchIdx = Math.floor(slot / 2);
      const isP1 = slot % 2 === 0;
      const player = planned[slot];
      if (player) {
        if (isP1) {
          newMatches[matchIdx] = { ...newMatches[matchIdx], p1: player };
        } else {
          newMatches[matchIdx] = { ...newMatches[matchIdx], p2: player };
        }
      }
    }

    const lastPlayer = planned[15];
    setExtractedBall({
      number: 16,
      player: lastPlayer,
      matchNumber: 8,
      slotName: 'Visitante',
      slotLabel: 'Llave #8 (Visitante)',
      isSeeded: isSeededPlayer(lastPlayer)
    });
    setRevealedPlayer(lastPlayer);

    setMatches(newMatches);
    currentSlotRef.current = 16;
    setCurrentSlotIndex(16);
    setAvailableCount(0);
    setIsFinished(true);
    soundPlayer?.playFanfare();
  };

  const handleConfirmSave = async () => {
    if (!onConfirmDefinitive) return;
    try {
      setIsSaving(true);
      await onConfirmDefinitive(matches);
      setShowConfirmModal(false);
    } catch (e) {
      alert('Error al publicar: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bolillero-overlay" onClick={onClose}>
      <div className="bolillero-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Sorteo */}
        <div className="bolillero-header">
          <div className="bolillero-title-box">
            <span className="bolillero-badge">
              {isTestMode ? '🟡 MODO PRUEBA (SIMULADOR)' : '🔴 SORTEO OFICIAL DEFINITIVO'}
            </span>
            <h2>SORTEO DE LLAVES · OCTAVOS DE FINAL</h2>
            <p className="bolillero-sub">
              {isTestMode
                ? 'Sorteo de práctica. No modifica la web pública.'
                : 'Sorteo oficial para el evento del 22 de Noviembre.'}
            </p>
          </div>

          <div className="bolillero-header-actions">
            <button
              className="sound-toggle-btn"
              title="Sonido"
              onClick={() => {
                const s = soundPlayer?.toggleSound();
                setSoundEnabled(s);
              }}
            >
              {soundEnabled ? '🔊 SONIDO ON' : '🔇 SONIDO OFF'}
            </button>
            <button className="bolillero-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Zona Principal: Bolillero de Fútbol + Revelación de Participante */}
        <div className="bolillero-main-grid">
          {/* Lado izquierdo: Bolillero Físico de Pelotas */}
          <div className="bolillero-drum-stage">
            <div className="drum-wrapper">
              <canvas ref={canvasRef} className="bolillero-canvas" />
              <div className="drum-glow-ring"></div>
            </div>

            <div className="drum-status-badge">
              <span>Pelotas restantes: </span>
              <strong>{availableCount} / 16</strong>
            </div>

            {/* Controles de Acción */}
            <div className="bolillero-controls">
              {!isFinished ? (
                <>
                  <button
                    className="btn-draw-action primary"
                    disabled={isSpinning || currentSlotIndex >= 16}
                    onClick={drawNextBall}
                  >
                    {isSpinning ? 'GIRANDO BOLILLERO...' : '⚽ SACAR SIGUIENTE PELOTA'}
                  </button>

                  <button
                    className={`btn-draw-action ${isAuto ? 'active-auto' : 'secondary'}`}
                    disabled={isSpinning || currentSlotIndex >= 16}
                    onClick={() => setIsAuto(!isAuto)}
                  >
                    {isAuto ? '⏸️ PAUSAR AUTOMÁTICO' : '⚡ SORTEO AUTOMÁTICO'}
                  </button>

                  <button
                    className="btn-draw-action ghost"
                    disabled={isSpinning || currentSlotIndex >= 16}
                    onClick={skipRemaining}
                  >
                    ⏩ SALTEAR ANIMACIÓN
                  </button>
                </>
              ) : (
                <div className="finished-actions">
                  <button className="btn-draw-action secondary" onClick={initDraw}>
                    🔄 REINICIAR SORTEO
                  </button>

                  {!isTestMode && onConfirmDefinitive && (
                    <button
                      className="btn-draw-action publish"
                      onClick={() => setShowConfirmModal(true)}
                    >
                      🏆 PUBLICAR COMO SORTEO DEFINITIVO
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lado derecho: Tarjeta de Revelación del Participante Sorteado */}
          <div className="bolillero-reveal-stage">
            {revealedPlayer && extractedBall ? (
              <div
                key={`reveal-card-${extractedBall.number}-${revealedPlayer.id}`}
                className="player-reveal-card"
              >
                <div className="reveal-header">
                  <span className="ball-number-badge">⚽ PELOTA #{extractedBall.number}</span>
                  <span className="slot-assigned-badge">{extractedBall.slotLabel}</span>
                </div>

                <div className="reveal-photo-wrapper">
                  {revealedPlayer.foto ? (
                    <img
                      key={`img-${extractedBall.number}-${revealedPlayer.id}`}
                      src={revealedPlayer.foto}
                      alt={revealedPlayer.nick}
                      className="reveal-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="reveal-photo-placeholder"
                    style={{ display: revealedPlayer.foto ? 'none' : 'flex' }}
                  >
                    🎮
                  </div>
                  <div className="reveal-glow-back"></div>
                </div>

                <div className="reveal-player-info">
                  <div className="reveal-player-nick">
                    {revealedPlayer.nick}
                  </div>
                  <div className="reveal-player-team">
                    ⚽ {revealedPlayer.equipo || 'Equipo por definir'}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px' }}>
                    <span className="reveal-player-badge">
                      {revealedPlayer.tipo === 'influencer' ? '🎙️ INFLUENCER CONFIRMADO' : '🏆 CAMPEÓN CLASIFICADO'}
                    </span>
                  </div>
                </div>

                <div className="reveal-destination-banner">
                  <span>Asignado a:</span>
                  <strong>{extractedBall.slotLabel}</strong>
                </div>
              </div>
            ) : (
              <div className="player-reveal-placeholder">
                <div className="placeholder-ball">⚽</div>
                <h3>Esperando extracción...</h3>
                <p>Hacé click en "Sacar Siguiente Pelota" o "Sorteo Automático" para comenzar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de Cruces en tiempo real con scroll e iluminación automática */}
        <div className="bolillero-bracket-preview">
          <div className="preview-header">
            <h3>LLAVES SORTEADAS ({matches.filter((m) => m.p1 && m.p2).length} / 8 DEFINIDAS)</h3>
          </div>
          <div className="mini-matches-grid" id="mini-matches-scroll-container">
            {matches.map((m, idx) => {
              const isTargetMatch = extractedBall && extractedBall.matchNumber === idx + 1;
              return (
                <div
                  key={m.id}
                  id={`mini-match-${idx + 1}`}
                  className={`mini-match-card ${isTargetMatch ? 'flash-highlight' : ''}`}
                >
                  <div className="mini-match-title">LLAVE #{idx + 1}</div>
                  <div className="mini-match-teams">
                    <div className={`mini-team ${m.p1 ? 'filled' : 'vacant'}`}>
                      <span className="mini-role">L</span>
                      <span className="mini-name">{m.p1 ? m.p1.nick : '—'}</span>
                    </div>
                    <div className="mini-vs">VS</div>
                    <div className={`mini-team ${m.p2 ? 'filled' : 'vacant'}`}>
                      <span className="mini-role">V</span>
                      <span className="mini-name">{m.p2 ? m.p2.nick : '—'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal de Confirmación para Publicar Definitivo */}
        {showConfirmModal && (
          <div className="confirm-modal-overlay">
            <div className="confirm-modal-box">
              <div className="confirm-icon">🏆</div>
              <h3>¿Publicar este Sorteo Definitivo?</h3>
              <p>
                Este sorteo se guardará en la base de datos y quedará visible para todo el público en la sección
                <strong> LLAVES DEL TORNEO</strong>.
              </p>
              <div className="confirm-buttons">
                <button
                  className="btn-confirm-cancel"
                  disabled={isSaving}
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn-confirm-publish"
                  disabled={isSaving}
                  onClick={handleConfirmSave}
                >
                  {isSaving ? 'PUBLICANDO...' : 'SÍ, PUBLICAR OFICIALMENTE'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
