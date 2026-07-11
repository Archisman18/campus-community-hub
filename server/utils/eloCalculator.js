const K_FACTORS = { bgmi: 28, freefire: 32, efootball: 16 };

function getKFactor(game, matchesPlayed) {
  const base = K_FACTORS[game];
  if (matchesPlayed <= 5) return base * 1.5;
  if (matchesPlayed <= 15) return base * 1.0;
  return base * 0.6;
}

function calculateElo(winnerElo, loserElo, game, winnerMatches, loserMatches) {
  const kWinner = getKFactor(game, winnerMatches);
  const kLoser = getKFactor(game, loserMatches);

  const expectedWinner = 1 / (1 + 10 ** ((loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + 10 ** ((winnerElo - loserElo) / 400));

  return {
    winnerNewElo: Math.round(winnerElo + kWinner * (1 - expectedWinner)),
    loserNewElo: Math.round(loserElo + kLoser * (0 - expectedLoser)),
  };
}

module.exports = { calculateElo };