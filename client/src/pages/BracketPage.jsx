import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { SingleEliminationBracket } from 'react-tournament-brackets'
import { supabase } from '../lib/supabase'

const getDisplayName = (profilesById, playerId) => {
  if (!playerId) return 'TBD'

  return profilesById[playerId] ?? 'TBD'
}

const BracketMatchCard = ({ match, topParty, bottomParty, topText, bottomText }) => {
  const currentUserId = match.currentUserId ?? null
  const canSubmitScore =
    match.status === 'pending' &&
    Boolean(currentUserId) &&
    (match.player1_id === currentUserId || match.player2_id === currentUserId)

  return (
    <div className="flex h-full w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Round {match.round}</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{match.name}</p>
        </div>
        {match.status === 'confirmed' && (
          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Confirmed
          </span>
        )}
        {match.status === 'disputed' && (
          <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
            Disputed
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <span className="truncate font-medium">{match.player1Name ?? topParty?.name ?? topText ?? 'TBD'}</span>
          <span className="text-xs text-slate-500">{topParty?.resultText ?? ''}</span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
          <span className="truncate font-medium">{match.player2Name ?? bottomParty?.name ?? bottomText ?? 'TBD'}</span>
          <span className="text-xs text-slate-500">{bottomParty?.resultText ?? ''}</span>
        </div>
      </div>

      {canSubmitScore && (
        <Link
          to={`/match/${match.id}`}
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Submit Score
        </Link>
      )}
    </div>
  )
}

const fetchProfilesByPlayerIds = async (playerIds) => {
  if (playerIds.length === 0) return {}

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username')
    .in('id', playerIds)

  if (profilesError) throw profilesError

  return Object.fromEntries(
    (profiles ?? [])
      .filter((profile) => profile?.id && profile?.username)
      .map((profile) => [profile.id, profile.username]),
  )
}

const buildBracketMatches = (matchRows, profilesById) => {
  const sortedRows = [...matchRows].sort((left, right) => {
    const roundDiff = Number(left.round || 1) - Number(right.round || 1)
    if (roundDiff !== 0) return roundDiff

    const leftTime = new Date(left.created_at || left.registered_at || 0).getTime()
    const rightTime = new Date(right.created_at || right.registered_at || 0).getTime()
    if (leftTime !== rightTime) return leftTime - rightTime

    return String(left.id).localeCompare(String(right.id))
  })

  const rounds = new Map()
  for (const match of sortedRows) {
    const roundNumber = Number(match.round || 1)
    if (!rounds.has(roundNumber)) {
      rounds.set(roundNumber, [])
    }

    rounds.get(roundNumber).push(match)
  }

  const bracketMatches = []
  const roundNumbers = [...rounds.keys()].sort((left, right) => left - right)

  roundNumbers.forEach((roundNumber) => {
    const currentRoundMatches = rounds.get(roundNumber) || []
    const nextRoundMatches = rounds.get(roundNumber + 1) || []

    currentRoundMatches.forEach((match, index) => {
      const nextMatch = nextRoundMatches[Math.floor(index / 2)] ?? null
      const hasWinner = Boolean(match.winner_id)
      const player1Name = getDisplayName(profilesById, match.player1_id)
      const player2Name = getDisplayName(profilesById, match.player2_id)

      bracketMatches.push({
        id: match.id,
        name: `Round ${roundNumber} - Match ${index + 1}`,
        nextMatchId: nextMatch?.id ?? null,
        tournamentRoundText: String(roundNumber),
        round: roundNumber,
        status: match.status,
        player1_id: match.player1_id,
        player2_id: match.player2_id,
        player1Name,
        player2Name,
        startTime: match.created_at || match.updated_at || new Date().toISOString(),
        state: hasWinner ? 'DONE' : 'NO_PARTY',
        participants: [
          {
            id: `${match.id}-player-1`,
            name: player1Name,
            status: match.player1_id ? 'PLAYED' : 'NO_PARTY',
          },
          {
            id: `${match.id}-player-2`,
            name: player2Name,
            status: match.player2_id ? 'PLAYED' : 'NO_PARTY',
          },
        ],
      })
    })
  })

  return bracketMatches
}

const BracketPage = () => {
  const { tournament_id } = useParams()
  const [loading, setLoading] = useState(true)
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    let channel = null

    const loadBracket = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const activeUserId = userData?.user?.id ?? null

        const [{ data: tournamentData, error: tournamentError }, { data: matchRows, error: matchError }] =
          await Promise.all([
            supabase
              .from('tournaments')
              .select('id, name, game, status, registration_deadline, max_players')
              .eq('id', tournament_id)
              .single(),
            supabase
              .from('matches')
              .select('id, tournament_id, player1_id, player2_id, winner_id, round, status, created_at, updated_at')
              .eq('tournament_id', tournament_id)
              .order('round', { ascending: true }),
          ])

        if (tournamentError) throw tournamentError
        if (matchError) throw matchError

        const playerIds = new Set()
        for (const row of matchRows ?? []) {
          if (row.player1_id) playerIds.add(row.player1_id)
          if (row.player2_id) playerIds.add(row.player2_id)
          if (row.winner_id) playerIds.add(row.winner_id)
        }

        const profilesById =
          playerIds.size > 0 ? await fetchProfilesByPlayerIds([...playerIds]) : {}

        if (mounted) {
          setTournament(tournamentData)
          setMatches(
            buildBracketMatches(matchRows ?? [], profilesById).map((match) => ({
              ...match,
              currentUserId: activeUserId,
            })),
          )
        }
      } catch (loadError) {
        console.error(loadError)
        if (mounted) setError(loadError?.message || 'Failed to load bracket.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadBracket()

    channel = supabase
      .channel(`matches:${tournament_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournament_id}`,
        },
        () => {
          loadBracket()
        },
      )
      .subscribe()

    return () => {
      mounted = false
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [tournament_id])

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">Loading bracket...</main>
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">Tournament Hub</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            Bracket
          </h1>
          {tournament && (
            <p className="mt-2 text-sm text-slate-600">
              {tournament.name} · {tournament.game}
            </p>
          )}
        </header>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Tournament Bracket</h2>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-max pb-4">
              {matches.length === 0 ? (
                <p className="text-sm text-slate-600">No matches have been generated yet.</p>
              ) : (
                <SingleEliminationBracket
                  matches={matches}
                  matchComponent={BracketMatchCard}
                  options={{
                    style: {
                      roundHeader: {
                        isShown: true,
                        roundTextGenerator: (currentRoundNumber) => `Round ${currentRoundNumber}`,
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default BracketPage
