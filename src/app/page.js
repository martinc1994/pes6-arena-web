'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

export default function Home() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const COLORS = ['#FFD700', '#E8003D', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: Math.random() * 2.5 + 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: Math.random() * 0.5 + 0.15,
      });
    }

    let animationId;
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      animationId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <main className="portada">
      <canvas className="pitch-canvas" ref={canvasRef}></canvas>
      <div className="hero-overlay"></div>

      <div className="portada-content">
        <div className="hero-eyebrow">
          <span className="dot red"></span>
          <span>20 años después, el PES6 más vivo que nunca</span>
          <span className="dot red"></span>
        </div>

        <h1 className="hero-title">
          <span className="line-top">VALEN</span>
          <span className="line-fulvo">FULVO</span>
          <span className="line-cup">PES ARENA</span>
        </h1>

        <div className="hero-event-box">
          <div className="event-date-block">
            <span className="event-day">21</span>
            <div className="event-detail">
              <span className="event-month">NOVIEMBRE</span>
              <span className="event-year">2026</span>
            </div>
          </div>
          <div className="event-divider"></div>
          <div className="event-place-block">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <div>
              <span className="event-place">MICROESTADIO</span>
              <span className="event-city">Garín, Buenos Aires</span>
            </div>
          </div>
        </div>

        <p className="hero-sub">El evento más grande de PES6.<br />16 participantes, un solo trono.</p>

        <div className="portada-buttons">
          <Link href="/evento" className="portada-btn">
            <div className="portada-btn-icon">🏟️</div>
            <div className="portada-btn-text">
              <span className="portada-btn-title">INFO DEL EVENTO</span>
              <span className="portada-btn-desc">Conocé todo sobre el PESARENA</span>
            </div>
            <div className="portada-btn-arrow">→</div>
          </Link>

          <Link href="/participantes" className="portada-btn">
            <div className="portada-btn-icon">🎮</div>
            <div className="portada-btn-text">
              <span className="portada-btn-title">CONOCÉ A LOS PARTICIPANTES</span>
              <span className="portada-btn-desc">Votá y descubrí quiénes compiten</span>
            </div>
            <div className="portada-btn-arrow">→</div>
          </Link>

          <Link href="/clasificar" className="portada-btn">
            <div className="portada-btn-icon">🏆</div>
            <div className="portada-btn-text">
              <span className="portada-btn-title">QUIERO CLASIFICAR</span>
              <span className="portada-btn-desc">Anotate como jugador o influencer</span>
            </div>
            <div className="portada-btn-arrow">→</div>
          </Link>
        </div>

        <div className="hero-stats">
          <div className="stat"><span className="stat-n">16</span><span className="stat-l">Participantes</span></div>
          <div className="stat-sep"></div>
          <div className="stat"><span className="stat-n">1</span><span className="stat-l">Gran Final</span></div>
          <div className="stat-sep"></div>
          <div className="stat"><span className="stat-n">🔥</span><span className="stat-l">Experiencia Única</span></div>
        </div>

        <div className="portada-footer-inner">
          <a href="https://wa.me/543816232650?text=Hola%20Mart%C3%ADn!%20Vi%20tu%20trabajo%20en%20la%20p%C3%A1gina%20de%20ValenFulvo%20y%20me%20gustar%C3%ADa%20consultar%20por%20tus%20servicios%20de%20desarrollo." target="_blank" rel="noopener noreferrer" className="portada-credit">
            Desarrollado por <span>Martín Castillo</span>
          </a>
        </div>
      </div>
    </main>
  );
}
