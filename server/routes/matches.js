const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient'); // your service-role client
const { calculateElo } = require('../utils/eloCalculator');

router.post('/:match_id/confirm', async (req, res) => {
  const { match_id } = req.params;
  const { winner_id } = req.body;

  try {
    const { data: match, error: matchErr } = await supabase
      .from('matches')
      .select('*, tournaments(game)')
      .eq('id', match_id)
      .single();
    if (matchErr || !match) return res.status(404).json({ error: 'Match not found' });

    const game = match.tournaments.game;
    const loser_id = winner_id === match.player1_id ? match.player2_id : match.player1_id;

    const { data: eloRows, error: eloErr } = await supabase
      .from('player_elo')
      .select('*')
      .in('user_id', [winner_id, loser_id])
      .eq('game', game);
    if (eloErr || !eloRows || eloRows.length < 2)
      return res.status(400).json({ error: 'Missing ELO rows for one or both players' });

    const winnerRow = eloRows.find(r => r.user_id === winner_id);
    const loserRow = eloRows.find(r => r.user_id === loser_id);

    const { winnerNewElo, loserNewElo } = calculateElo(
      winnerRow.elo, loserRow.elo, game, winnerRow.matches_played, loserRow.matches_played
    );

    await supabase.from('player_elo').update({
      elo: winnerNewElo, matches_played: winnerRow.matches_played + 1,
      wins: winnerRow.wins + 1, last_updated: new Date().toISOString(),
    }).eq('user_id', winner_id).eq('game', game);

    await supabase.from('player_elo').update({
      elo: loserNewElo, matches_played: loserRow.matches_played + 1,
      losses: loserRow.losses + 1, last_updated: new Date().toISOString(),
    }).eq('user_id', loser_id).eq('game', game);

    await supabase.from('matches').update({
      status: 'confirmed', winner_id, updated_at: new Date().toISOString(),
    }).eq('id', match_id);

    res.json({ winnerNewElo, loserNewElo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error confirming match' });
  }
});

module.exports = router;