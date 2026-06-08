const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { createClient } = require('@supabase/supabase-js')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://grwplvhedmvzjediuflr.supabase.co'
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_U8vuHdI3oW8w2iD9TmDgcQ_tDT-Q1OO'

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Missing SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY. Bracket generation will fail until env vars are set.')
}

const createSupabaseForRequest = (req) => {
  const authHeader = req.headers.authorization || ''

  return createClient(supabaseUrl || '', supabaseServiceRoleKey || '', {
    global: {
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    },
  })
}

const pairSeeds = (players) => {
  const matches = []
  let left = 0
  let right = players.length - 1

  while (left < right) {
    matches.push({
      player1_id: players[left].user_id,
      player2_id: players[right].user_id,
      seed1: players[left].seed,
      seed2: players[right].seed,
    })
    left += 1
    right -= 1
  }

  return matches
}

app.post('/api/bracket/generate', async (req, res) => {
  const { tournament_id } = req.body || {}

  if (!tournament_id) {
    return res.status(400).json({ error: 'tournament_id is required.' })
  }

  try {
    console.log('bracket generate request:', { tournament_id })
    const supabase = createSupabaseForRequest(req)

    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('id, game, max_players, status')
      .eq('id', tournament_id)
      .single()

    if (tournamentError) throw tournamentError
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found.' })
    }

    console.log('tournament:', tournament)

    const { data: registrations, error: registrationsError } = await supabase
      .from('tournament_registrations')
      .select('user_id, registered_at')
      .eq('tournament_id', tournament_id)

    if (registrationsError) throw registrationsError

    console.log('registrations:', registrations)

    const registeredUsers = registrations ?? []
    if (registeredUsers.length < 2) {
      return res.status(400).json({ error: 'At least 2 registered players are required to generate a bracket.' })
    }

    const playerIds = registeredUsers.map((row) => row.user_id)
    const playerElos = []

    for (const userId of playerIds) {
      const { data: eloRow, error: eloError } = await supabase
        .from('player_elo')
        .select('user_id, game, elo')
        .eq('user_id', userId)
        .eq('game', tournament.game)
        .maybeSingle()

      if (eloError) throw eloError

      playerElos.push({
        user_id: userId,
        elo: eloRow?.elo ?? 0,
      })
    }

    console.log('player elos:', playerElos)

    const seededPlayers = playerElos
      .sort((a, b) => b.elo - a.elo)
      .slice(0, Number(tournament.max_players) || playerElos.length)
      .map((player, index) => ({
        ...player,
        seed: index + 1,
      }))

    const matchups = pairSeeds(seededPlayers)

    if (matchups.length === 0) {
      return res.status(400).json({ error: 'Not enough players to generate matches.' })
    }

    const matchesToInsert = matchups.map((matchup) => ({
      tournament_id,
      player1_id: matchup.player1_id,
      player2_id: matchup.player2_id,
      round: 1,
      status: 'pending',
    }))

    const { data: insertedMatches, error: insertError } = await supabase
      .from('matches')
      .insert(matchesToInsert)
      .select('*')

    if (insertError) throw insertError

    console.log('inserted matches:', insertedMatches)

    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ status: 'bracket_generated' })
      .eq('id', tournament_id)

    if (updateError) throw updateError

    console.log('tournament status updated to bracket_generated')

    return res.json({
      tournament_id,
      matches: insertedMatches ?? [],
    })
  } catch (error) {
    console.error('Bracket generation failed:', error)
    return res.status(500).json({
      error: error?.message || 'Failed to generate bracket.',
    })
  }
})

const port = Number(process.env.PORT || 3001)

app.listen(port, () => {
  console.log(`Bracket API listening on port ${port}`)
})
