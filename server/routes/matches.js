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

    const { error: winnerUpdateErr } = await supabase.from('player_elo').update({
      elo: winnerNewElo, matches_played: winnerRow.matches_played + 1,
      wins: winnerRow.wins + 1,
    }).eq('user_id', winner_id).eq('game', game);
    if (winnerUpdateErr) throw winnerUpdateErr;

    const { error: loserUpdateErr } = await supabase.from('player_elo').update({
      elo: loserNewElo, matches_played: loserRow.matches_played + 1,
      losses: loserRow.losses + 1,
    }).eq('user_id', loser_id).eq('game', game);
    if (loserUpdateErr) throw loserUpdateErr;
    await supabase.from('matches').update({
      status: 'confirmed', winner_id, updated_at: new Date().toISOString(),
    }).eq('id', match_id);

    await supabase.from('notifications').insert([
      {
        user_id: winner_id,
        message: `You won your ${game} match!`,
        match_id,
      },
      {
        user_id: loser_id,
        message: `You lost your ${game} match. Better luck next time!`,
        match_id,
      },
    ]);

    // Check whether the entire round that match belongs to is now fully confirmed
    const currentRound = Number(match.round);
    const { data: roundMatches, error: roundMatchesErr } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', match.tournament_id)
      .eq('round', currentRound)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });

    if (roundMatchesErr) throw roundMatchesErr;

    const sortedMatches = [...(roundMatches || [])].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return String(a.id).localeCompare(String(b.id));
    });

    if (sortedMatches.length === 1 && sortedMatches[0].status === 'confirmed') {
      // Final round confirmed — mark tournament as completed
      const { error: tournamentUpdateErr } = await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', match.tournament_id);
      if (tournamentUpdateErr) throw tournamentUpdateErr;
    } else if (
      sortedMatches.length > 1 &&
      sortedMatches.every(m => m.status === 'confirmed' && m.winner_id)
    ) {
      const nextRound = currentRound + 1;

      // Check whether matches for that next round already exist for this tournament
      const { data: existingNextRoundMatches, error: nextRoundCheckErr } = await supabase
        .from('matches')
        .select('id')
        .eq('tournament_id', match.tournament_id)
        .eq('round', nextRound);

      if (nextRoundCheckErr) throw nextRoundCheckErr;

      if (!existingNextRoundMatches || existingNextRoundMatches.length === 0) {
        const nextRoundMatches = [];
        for (let i = 0; i < sortedMatches.length; i += 2) {
          if (i + 1 < sortedMatches.length) {
            nextRoundMatches.push({
              tournament_id: match.tournament_id,
              player1_id: sortedMatches[i].winner_id,
              player2_id: sortedMatches[i + 1].winner_id,
              round: nextRound,
              status: 'pending',
            });
          }
        }

        if (nextRoundMatches.length > 0) {
          const { error: insertErr } = await supabase
            .from('matches')
            .insert(nextRoundMatches);

          if (insertErr) {
            if (insertErr.code === '23505') {
              console.warn('Next round matches already exist (23505 unique constraint swallowed)');
            } else {
              throw insertErr;
            }
          }
        }
      }
    }

    res.json({ winnerNewElo, loserNewElo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error confirming match' });
  }
});

module.exports = router;