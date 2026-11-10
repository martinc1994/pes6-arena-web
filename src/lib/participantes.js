import participantesData from '@/data/participantes.json';

const START_DATE = new Date('2026-11-09T00:00:00-03:00');
const EVENT_DATE = new Date('2026-11-22T23:59:59-03:00');
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Calcula los días transcurridos entre la fecha base (9 de nov 2026)
 * y la fecha actual, con tope máximo en el día del evento (22 de nov 2026).
 */
export function getDaysPassed(customDate = null) {
  const now = customDate || new Date();
  if (now < START_DATE) return 0;

  const current = now > EVENT_DATE ? EVENT_DATE : now;

  // Calculamos la diferencia por días calendario
  const startDay = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), START_DATE.getDate());
  const currentDay = new Date(current.getFullYear(), current.getMonth(), current.getDate());

  const diffTime = currentDay.getTime() - startDay.getTime();
  const diffDays = Math.floor(diffTime / MS_PER_DAY);

  // Máximo 13 días (del 9 al 22 de Noviembre inclusive)
  return Math.max(0, Math.min(diffDays, 13));
}

/**
 * Obtiene el bonus de votos acumulados por día:
 * +3 votos positivos y +1 voto negativo por cada día transcurrido.
 */
export function getDailyVoteBonus(customDate = null) {
  const days = getDaysPassed(customDate);
  return {
    days,
    likesBonus: days * 3,
    dislikesBonus: days * 1
  };
}

/**
 * Retorna los participantes con los votos base + bonus diario aplicados.
 * Ordenados con los 'influencer' primero y luego por ID ascendente.
 */
export function getClasificadosConVotos(customDate = null) {
  const { likesBonus, dislikesBonus } = getDailyVoteBonus(customDate);

  const list = participantesData.map(p => ({
    ...p,
    likes: (p.likes || 0) + likesBonus,
    dislikes: (p.dislikes || 0) + dislikesBonus
  }));

  return list.sort((a, b) => {
    const infA = a.tipo === 'influencer' ? 1 : 0;
    const infB = b.tipo === 'influencer' ? 1 : 0;
    if (infA !== infB) return infB - infA;
    return a.id - b.id;
  });
}

