// Lógica de gestión y avance del torneo PES6 ARENA
// 16 Participantes -> Octavos -> Cuartos -> Semifinales -> Gran Final -> Campeón

export function buildTournamentTree(baseOctavos = [], savedState = {}) {
  // 1. Octavos de Final (8 cruces)
  const octavos = baseOctavos.map((m, idx) => {
    const ov = savedState?.octavos?.[idx] || {};
    const score1 = ov.score1 !== undefined && ov.score1 !== null ? Number(ov.score1) : null;
    const score2 = ov.score2 !== undefined && ov.score2 !== null ? Number(ov.score2) : null;
    const winnerId = ov.winnerId ? Number(ov.winnerId) : null;
    const winMethod = ov.winMethod || '90min';
    const isCompleted = winnerId !== null && score1 !== null && score2 !== null;

    return {
      ...m,
      score1,
      score2,
      winnerId,
      winMethod,
      isCompleted
    };
  });

  const getWinner = (match) => {
    if (!match || !match.winnerId) return null;
    if (match.p1 && Number(match.p1.id) === Number(match.winnerId)) return match.p1;
    if (match.p2 && Number(match.p2.id) === Number(match.winnerId)) return match.p2;
    return null;
  };

  // 2. Cuartos de Final (4 cruces)
  // C1: Ganador Llave 1 vs Ganador Llave 2
  // C2: Ganador Llave 3 vs Ganador Llave 4
  // C3: Ganador Llave 5 vs Ganador Llave 6
  // C4: Ganador Llave 7 vs Ganador Llave 8
  const cuartosConfigs = [
    { id: 1, name: 'Cuartos #1', sourceA: 'Llave #1', sourceB: 'Llave #2', p1: getWinner(octavos[0]), p2: getWinner(octavos[1]) },
    { id: 2, name: 'Cuartos #2', sourceA: 'Llave #3', sourceB: 'Llave #4', p1: getWinner(octavos[2]), p2: getWinner(octavos[3]) },
    { id: 3, name: 'Cuartos #3', sourceA: 'Llave #5', sourceB: 'Llave #6', p1: getWinner(octavos[4]), p2: getWinner(octavos[5]) },
    { id: 4, name: 'Cuartos #4', sourceA: 'Llave #7', sourceB: 'Llave #8', p1: getWinner(octavos[6]), p2: getWinner(octavos[7]) }
  ];

  const cuartos = cuartosConfigs.map((cfg, idx) => {
    const ov = savedState?.cuartos?.[idx] || {};
    const score1 = cfg.p1 && cfg.p2 && ov.score1 !== undefined && ov.score1 !== null ? Number(ov.score1) : null;
    const score2 = cfg.p1 && cfg.p2 && ov.score2 !== undefined && ov.score2 !== null ? Number(ov.score2) : null;
    const winnerId = cfg.p1 && cfg.p2 && ov.winnerId ? Number(ov.winnerId) : null;
    const winMethod = ov.winMethod || '90min';
    const isCompleted = winnerId !== null && score1 !== null && score2 !== null;

    return {
      ...cfg,
      score1,
      score2,
      winnerId,
      winMethod,
      isCompleted
    };
  });

  // 3. Semifinales (2 cruces)
  // S1: Ganador C1 vs Ganador C2
  // S2: Ganador C3 vs Ganador C4
  const semisConfigs = [
    { id: 1, name: 'Semifinal #1', sourceA: 'Cuartos #1', sourceB: 'Cuartos #2', p1: getWinner(cuartos[0]), p2: getWinner(cuartos[1]) },
    { id: 2, name: 'Semifinal #2', sourceA: 'Cuartos #3', sourceB: 'Cuartos #4', p1: getWinner(cuartos[2]), p2: getWinner(cuartos[3]) }
  ];

  const semis = semisConfigs.map((cfg, idx) => {
    const ov = savedState?.semis?.[idx] || {};
    const score1 = cfg.p1 && cfg.p2 && ov.score1 !== undefined && ov.score1 !== null ? Number(ov.score1) : null;
    const score2 = cfg.p1 && cfg.p2 && ov.score2 !== undefined && ov.score2 !== null ? Number(ov.score2) : null;
    const winnerId = cfg.p1 && cfg.p2 && ov.winnerId ? Number(ov.winnerId) : null;
    const winMethod = ov.winMethod || '90min';
    const isCompleted = winnerId !== null && score1 !== null && score2 !== null;

    return {
      ...cfg,
      score1,
      score2,
      winnerId,
      winMethod,
      isCompleted
    };
  });

  // 4. Gran Final
  const finalP1 = getWinner(semis[0]);
  const finalP2 = getWinner(semis[1]);
  const finalOv = savedState?.final || {};
  const finalScore1 = finalP1 && finalP2 && finalOv.score1 !== undefined && finalOv.score1 !== null ? Number(finalOv.score1) : null;
  const finalScore2 = finalP1 && finalP2 && finalOv.score2 !== undefined && finalOv.score2 !== null ? Number(finalOv.score2) : null;
  const finalWinnerId = finalP1 && finalP2 && finalOv.winnerId ? Number(finalOv.winnerId) : null;
  const finalWinMethod = finalOv.winMethod || '90min';
  const finalCompleted = finalWinnerId !== null && finalScore1 !== null && finalScore2 !== null;

  const finalMatch = {
    id: 1,
    name: 'Gran Final',
    sourceA: 'Semifinal #1',
    sourceB: 'Semifinal #2',
    p1: finalP1,
    p2: finalP2,
    score1: finalScore1,
    score2: finalScore2,
    winnerId: finalWinnerId,
    winMethod: finalWinMethod,
    isCompleted: finalCompleted
  };

  // 5. Campeón Consagrado
  const campeon = getWinner(finalMatch);

  return {
    octavos,
    cuartos,
    semis,
    final: finalMatch,
    campeon
  };
}
