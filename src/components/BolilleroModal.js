'use client';

import React, { useEffect, useRef, useState } from 'react';
import { soundPlayer } from '@/lib/soundEffects';

export default function BolilleroModal({
  isOpen,
  onClose,
  allPlayers = [],
  isTestMode = true,
  onConfirmDefinitive = null
}) {
  const canvasRef = useRef(null);
  const availablePlayersRef = useRef([]);
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

  const [currentSlotIndex, setCurrentSlotIndex] = useState(0); // 0 a 15
  const [isSpinning, setIsSpinning] = useState(false);
  const [extractedBall, setExtractedBall] = useState(null); // { number, player, targetSlot }
  const [revealedPlayer, setRevealedPlayer] = useState(null);
  const [isAuto, setIsAuto] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Inicializar o reiniciar bolillero
  const initDraw = () => {
    setIsFinished(false);
    setIsAuto(false);
    setIsSpinning(false);
    setCurrentSlotIndex(0);
    currentSlotRef.current = 0;
    setExtractedBall(null);
    setRevealedPlayer(null);
    setShowConfirmModal(false);

    // Mezclar aleatoriamente todos los participantes
    const source = allPlayers && allPlayers.length > 0 ? allPlayers : [];
    const shuffled = [...source].sort(() => Math.random() - 0.5);

    availablePlayersRef.current = shuffled;
    setAvailableCount(shuffled.length);

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
  }, [isOpen, allPlayers]);

  // Canvas Physics para las bolillas dentro del bolillero
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

    // Colores PES clásicos para las bolillas
    const BALL_COLORS = ['#FFD700', '#E8003D', '#00D2FF', '#FFFFFF', '#FFA500', '#00FF88'];

    const count = Math.max(availableCount, 1);
    const balls = Array.from({ length: count }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (radius - 28);
      return {
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        r: 13,
        num: i + 1,
        color: BALL_COLORS[i % BALL_COLORS.length]
      };
    });

    let clickTimer = 0;

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Dibujar esfera de cristal (bolillero exterior)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(16, 20, 35, 0.65)';
      ctx.fill();

      // Gradiente de cristal y reflejo
      const grad = ctx.createRadialGradient(centerX - 35, centerY - 45, 10, centerX, centerY, radius);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
      grad.addColorStop(0.5, 'rgba(255, 215, 0, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Borde dorado neón
      ctx.lineWidth = 4;
      ctx.strokeStyle = isSpinning ? '#FFD700' : 'rgba(255, 215, 0, 0.4)';
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = isSpinning ? 20 : 6;
      ctx.stroke();
      ctx.restore();

      // 2. Anillo metálico / Soporte del bolillero
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 8, Math.PI * 0.15, Math.PI * 0.85);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(200, 200, 220, 0.5)';
      ctx.stroke();
      ctx.restore();

      // 3. Simulación física y rebote de bolillas
      const speedMultiplier = isSpinning ? 2.5 : 0.8;
      clickTimer++;

      balls.forEach((b) => {
        if (isSpinning) {
          b.vx += (Math.random() - 0.5) * 1.5;
          b.vy += (Math.random() - 0.5) * 1.5;
        }

        b.x += b.vx * speedMultiplier;
        b.y += b.vy * speedMultiplier;

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

          b.x = centerX + normalX * (radius - 4 - b.r);
          b.y = centerY + normalY * (radius - 4 - b.r);

          if (isSpinning && clickTimer % 6 === 0) {
            soundPlayer?.playBallClick();
          }
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);

        const bGrad = ctx.createRadialGradient(b.x - 3, b.y - 4, 1, b.x, b.y, b.r);
        bGrad.addColorStop(0, '#FFFFFF');
        bGrad.addColorStop(0.35, b.color);
        bGrad.addColorStop(1, '#050505');
        ctx.fillStyle = bGrad;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 4;
        ctx.fill();

        ctx.fillStyle = '#111';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.num.toString(), b.x, b.y);
        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isSpinning, availableCount]);

  // Extraer una bolilla usando referencias sincronizadas
  const drawNextBall = () => {
    if (isSpinning) return;
    const remaining = availablePlayersRef.current;
    const currentSlot = currentSlotRef.current;

    if (!remaining || remaining.length === 0 || currentSlot >= 16) {
      setIsFinished(true);
      setIsAuto(false);
      return;
    }

    setIsSpinning(true);
    soundPlayer?.playWhoosh();

    // Tiempo de giro suspense (1.2 segundos)
    setTimeout(() => {
      const pool = availablePlayersRef.current;
      if (!pool || pool.length === 0) {
        setIsSpinning(false);
        return;
      }

      // Elegir aleatoriamente el próximo jugador de la bolsa
      const chosenIndex = Math.floor(Math.random() * pool.length);
      const chosenPlayer = pool[chosenIndex];

      // Quitar de la bolsa inmediatamente en el ref
      const newPool = pool.filter((_, idx) => idx !== chosenIndex);
      availablePlayersRef.current = newPool;
      setAvailableCount(newPool.length);

      const slotIdx = currentSlotRef.current;
      const matchIndex = Math.floor(slotIdx / 2);
      const isSlotP1 = slotIdx % 2 === 0;

      const ballData = {
        number: 16 - newPool.length,
        player: chosenPlayer,
        matchNumber: matchIndex + 1,
        slotName: isSlotP1 ? 'Local' : 'Visitante',
        slotLabel: `Llave #${matchIndex + 1} (${isSlotP1 ? 'Local' : 'Visitante'})`
      };

      setExtractedBall(ballData);
      setRevealedPlayer(chosenPlayer);
      setIsSpinning(false);
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

      // Auto-scroll suave hacia la llave asignada
      setTimeout(() => {
        const targetCard = document.getElementById(`mini-match-${matchIndex + 1}`);
        if (targetCard) {
          targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 250);

      if (nextSlot >= 16) {
        setIsFinished(true);
        setIsAuto(false);
        setTimeout(() => soundPlayer?.playFanfare(), 1500);
      }
    }, 1200);
  };

  // Efecto del modo automático: intervalo ampliado (+3 segundos solicitados por el usuario para disfrutar la foto)
  useEffect(() => {
    let timer;
    if (isAuto && !isSpinning && !isFinished && currentSlotIndex < 16) {
      // 5.6 segundos en total (2.6s base + 3s solicitados)
      timer = setTimeout(() => {
        drawNextBall();
      }, 5600);
    }
    return () => clearTimeout(timer);
  }, [isAuto, isSpinning, isFinished, currentSlotIndex]);

  // Saltear animación y completar sorteo al instante
  const skipRemaining = () => {
    if (isFinished || currentSlotRef.current >= 16) return;
    setIsAuto(false);
    setIsSpinning(false);

    const pool = [...availablePlayersRef.current].sort(() => Math.random() - 0.5);
    const newMatches = [...matches];
    let rIdx = 0;

    for (let slot = currentSlotRef.current; slot < 16; slot++) {
      const matchIdx = Math.floor(slot / 2);
      const isP1 = slot % 2 === 0;
      const player = pool[rIdx++];
      if (player) {
        if (isP1) {
          newMatches[matchIdx] = { ...newMatches[matchIdx], p1: player };
        } else {
          newMatches[matchIdx] = { ...newMatches[matchIdx], p2: player };
        }
      }
    }

    setMatches(newMatches);
    availablePlayersRef.current = [];
    setAvailableCount(0);
    currentSlotRef.current = 16;
    setCurrentSlotIndex(16);
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

        {/* Zona Principal: Bolillero + Revelación de Bolilla */}
        <div className="bolillero-main-grid">
          {/* Lado izquierdo: Bolillero Físico */}
          <div className="bolillero-drum-stage">
            <div className="drum-wrapper">
              <canvas ref={canvasRef} className="bolillero-canvas" />
              <div className="drum-glow-ring"></div>
            </div>

            <div className="drum-status-badge">
              <span>Bolillas restantes: </span>
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
                    {isSpinning ? 'GIRANDO BOLILLERO...' : '🎲 SACAR SIGUIENTE BOLILLA'}
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
                className="player-reveal-card fade-in"
              >
                <div className="reveal-header">
                  <span className="ball-number-badge">BOLILLA #{extractedBall.number}</span>
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
                  <div className="reveal-player-nick">{revealedPlayer.nick}</div>
                  <div className="reveal-player-team">
                    ⚽ {revealedPlayer.equipo || 'Equipo por definir'}
                  </div>
                  <div className="reveal-player-badge">
                    {revealedPlayer.tipo === 'influencer' ? '🎙️ INFLUENCER CONFIRMADO' : '🏆 CAMPEÓN CLASIFICADO'}
                  </div>
                </div>

                <div className="reveal-destination-banner">
                  <span>Asignado a:</span>
                  <strong>{extractedBall.slotLabel}</strong>
                </div>
              </div>
            ) : (
              <div className="player-reveal-placeholder">
                <div className="placeholder-ball">🎱</div>
                <h3>Esperando extracción...</h3>
                <p>Hacé click en "Sacar Siguiente Bolilla" o "Sorteo Automático" para comenzar.</p>
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
