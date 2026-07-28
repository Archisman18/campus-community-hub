import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const API_BASE_URL = 'http://localhost:3001'

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

const getDisplayName = (profilesById, playerId) => profilesById[playerId] ?? 'TBD'

const statusMeta = {
  pending: {
    label: 'Pending',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
    order: 1,
  },
  confirmed: {
    label: 'Confirmed',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    order: 2,
  },
  disputed: {
    label: 'Disputed',
    className: 'border-red-200 bg-red-50 text-red-700',
    order: 0,
  },
}

const getStatusMeta = (status) => statusMeta[status] ?? statusMeta.pending

const sortMatchesForReview = (matches) =>
  [...matches].sort((left, right) => {
    const statusDiff = getStatusMeta(left.status).order - getStatusMeta(right.status).order
    if (statusDiff !== 0) return statusDiff

    const leftTime = new Date(left.created_at || left.updated_at || 0).getTime()
    const rightTime = new Date(right.created_at || right.updated_at || 0).getTime()
    if (leftTime !== rightTime) return rightTime - leftTime

    return String(left.id).localeCompare(String(right.id))
  })

const OrganiserPanel = () => {
  const [user, setUser] = useState(null)
  const [isOrganiser, setIsOrganiser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tournaments, setTournaments] = useState([])
  const [matches, setMatches] = useState([])
  const [selectedWinnerByMatchId, setSelectedWinnerByMatchId] = useState({})
  const [confirmingMatchMap, setConfirmingMatchMap] = useState({})
  const [matchErrorMap, setMatchErrorMap] = useState({})
  const [error, setError] = useState('')
  const [bracketLoadingId, setBracketLoadingId] = useState(null)
  const [bracketSuccessMap, setBracketSuccessMap] = useState({})
  const [bracketErrorMap, setBracketErrorMap] = useState({})
  const navigate = useNavigate()

  const loadPanel = useCallback(async ({ preserveLoading = false } = {}) => {
    try {
      if (!preserveLoading) {
        setLoading(true)
      }

      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const currentUser = userData?.user ?? null
      if (!currentUser) {
        navigate('/login')
        return false
      }

      setUser(currentUser)

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single()

      if (profileError) throw profileError

      if (!profile?.is_organiser) {
        navigate('/tournaments')
        return false
      }

      setIsOrganiser(true)

      const { data: tournamentRows, error: tournamentError } = await supabase
        .from('tournaments')
        .select('id, name, game, max_players, status, registration_deadline, organizer_id')
        .eq('organizer_id', currentUser.id)
        .order('created_at', { ascending: false })

      if (tournamentError) throw tournamentError

      const tournamentIds = (tournamentRows ?? []).map((tournament) => tournament.id)

      let matchRows = []
      if (tournamentIds.length > 0) {
        const { data: fetchedMatchRows, error: matchError } = await supabase
          .from('matches')
          .select('id, tournament_id, player1_id, player2_id, round, submission_a, submission_b, status, winner_id, created_at, updated_at')
          .in('tournament_id', tournamentIds)
          .order('created_at', { ascending: false })

        if (matchError) throw matchError
        matchRows = fetchedMatchRows ?? []
      }

      const playerIds = new Set()
      for (const match of matchRows) {
        if (match.player1_id) playerIds.add(match.player1_id)
        if (match.player2_id) playerIds.add(match.player2_id)
        if (match.winner_id) playerIds.add(match.winner_id)
      }

      const profilesById = playerIds.size > 0 ? await fetchProfilesByPlayerIds([...playerIds]) : {}
      const tournamentsById = Object.fromEntries(
        (tournamentRows ?? []).map((tournament) => [tournament.id, tournament]),
      )

      const hydratedMatches = sortMatchesForReview(
        matchRows.map((match) => ({
          ...match,
          tournamentName: tournamentsById[match.tournament_id]?.name ?? 'TBD',
          player1Name: getDisplayName(profilesById, match.player1_id),
          player2Name: getDisplayName(profilesById, match.player2_id),
          winnerName: match.status === 'confirmed' ? getDisplayName(profilesById, match.winner_id) : '',
        })),
      )

      setTournaments(tournamentRows ?? [])
      setMatches(hydratedMatches)
      setSelectedWinnerByMatchId((previous) => {
        const nextSelections = { ...previous }

        for (const match of hydratedMatches) {
          if (match.status === 'confirmed') {
            delete nextSelections[match.id]
            continue
          }

          if (!nextSelections[match.id]) {
            nextSelections[match.id] = match.player1_id ?? match.player2_id ?? ''
          }
        }

        return nextSelections
      })

      return true
    } catch (panelError) {
      console.error(panelError)
      setError(panelError?.message || 'Failed to load organiser panel.')
      navigate('/tournaments')
      return false
    } finally {
      if (!preserveLoading) {
        setLoading(false)
      }
    }
  }, [navigate])

  useEffect(() => {
    loadPanel()

    return undefined
  }, [loadPanel])

  const formatDeadline = (registration_deadline) => {
    if (!registration_deadline) return 'N/A'
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(registration_deadline))
  }

  const gameBadgeClasses = {
    BGMI: 'bg-amber-100 text-amber-800 ring-amber-200',
    'Free Fire': 'bg-sky-100 text-sky-800 ring-sky-200',
    eFootball: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  }

  const handleGenerateBracket = async (tournament) => {
    setBracketLoadingId(tournament.id)
    setBracketErrorMap((previous) => ({ ...previous, [tournament.id]: '' }))

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const response = await fetch(`${API_BASE_URL}/api/bracket/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ tournament_id: tournament.id }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to generate bracket.')
      }

      setBracketSuccessMap((previous) => ({ ...previous, [tournament.id]: true }))

      setTimeout(() => {
        navigate(`/bracket/${tournament.id}`)
      }, 700)
    } catch (generateError) {
      console.error(generateError)
      setBracketErrorMap((previous) => ({
        ...previous,
        [tournament.id]: generateError?.message || 'Failed to generate bracket.',
      }))
    } finally {
      setBracketLoadingId(null)
    }
  }

  const handleConfirmWinner = async (match) => {
    const selectedWinnerId = selectedWinnerByMatchId[match.id] ?? match.player1_id ?? match.player2_id ?? ''

    if (!selectedWinnerId) {
      setMatchErrorMap((previous) => ({
        ...previous,
        [match.id]: 'Please choose a winner before confirming.',
      }))
      return
    }

    setConfirmingMatchMap((previous) => ({ ...previous, [match.id]: true }))
    setMatchErrorMap((previous) => ({ ...previous, [match.id]: '' }))

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const response = await fetch(`${API_BASE_URL}/api/matches/${match.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ winner_id: selectedWinnerId }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to confirm winner.')
      }

      await loadPanel({ preserveLoading: true })
    } catch (confirmError) {
      console.error(confirmError)
      setMatchErrorMap((previous) => ({
        ...previous,
        [match.id]: confirmError?.message || 'Failed to confirm winner.',
      }))
    } finally {
      setConfirmingMatchMap((previous) => ({ ...previous, [match.id]: false }))
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <p className="text-sm font-medium text-slate-600">Loading organiser panel...</p>
      </main>
    )
  }

  if (!user || !isOrganiser) {
    return null
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">Tournament Hub</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            Organiser Panel
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Manage your tournaments and review disputed matches in one place.
          </p>
        </header>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/create-tournament')}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Create New Tournament
          </button>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900">MY TOURNAMENTS</h2>
            <span className="text-sm text-slate-500">{tournaments.length} total</span>
          </div>

          {tournaments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              <p>No tournaments found for your account yet.</p>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/create-tournament')}
                  className="rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700"
                >
                  Create New Tournament
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tournaments.map((tournament) => (
                <article
                  key={tournament.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{tournament.name}</h3>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${gameBadgeClasses[tournament.game] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}
                      >
                        {tournament.game}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleGenerateBracket(tournament)}
                      disabled={bracketLoadingId === tournament.id || tournament.status === 'bracket_generated'}
                      className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {bracketSuccessMap[tournament.id] || tournament.status === 'bracket_generated'
                        ? 'Bracket Generated!'
                        : bracketLoadingId === tournament.id
                          ? 'Generating...'
                          : 'Generate Bracket'}
                    </button>
                  </div>

                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Max Players</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{tournament.max_players}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Status</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{tournament.status}</dd>
                    </div>
                    <div className="col-span-2 rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Registration Deadline</dt>
                      <dd className="mt-1 font-semibold text-slate-900">
                        {formatDeadline(tournament.registration_deadline)}
                      </dd>
                    </div>
                  </dl>

                  {bracketErrorMap[tournament.id] && (
                    <p className="mt-3 text-sm text-red-700">{bracketErrorMap[tournament.id]}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900">ALL MATCHES</h2>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {matches.length === 0 ? (
              <div className="p-6 text-sm text-slate-600">No matches yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Tournament</th>
                      <th className="px-5 py-4 font-semibold">Round</th>
                      <th className="px-5 py-4 font-semibold">Players</th>
                      <th className="px-5 py-4 font-semibold">Scores</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Winner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {matches.map((match) => {
                      const meta = getStatusMeta(match.status)
                      const hasSubmissions =
                        match.submission_a !== null &&
                        match.submission_a !== undefined &&
                        match.submission_b !== null &&
                        match.submission_b !== undefined

                      return (
                        <tr key={match.id} className="align-top hover:bg-slate-50/80">
                          <td className="px-5 py-4 font-medium text-slate-900">{match.tournamentName}</td>
                          <td className="px-5 py-4 text-slate-700">Round {match.round ?? 'TBD'}</td>
                          <td className="px-5 py-4 text-slate-700">
                            {match.player1Name} vs {match.player2Name}
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {hasSubmissions
                              ? `${match.player1Name}: ${match.submission_a} — ${match.player2Name}: ${match.submission_b}`
                              : 'Waiting on submissions'}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {match.status === 'confirmed' ? (
                              match.winnerName
                            ) : (
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <select
                                    value={selectedWinnerByMatchId[match.id] ?? match.player1_id ?? match.player2_id ?? ''}
                                    onChange={(event) =>
                                      setSelectedWinnerByMatchId((previous) => ({
                                        ...previous,
                                        [match.id]: event.target.value,
                                      }))
                                    }
                                    className="min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                                  >
                                    <option value={match.player1_id}>{match.player1Name}</option>
                                    <option value={match.player2_id}>{match.player2Name}</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() => handleConfirmWinner(match)}
                                    disabled={Boolean(confirmingMatchMap[match.id])}
                                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                  >
                                    {confirmingMatchMap[match.id] ? 'Confirming...' : 'Confirm'}
                                  </button>
                                </div>

                                {matchErrorMap[match.id] && (
                                  <p className="text-xs text-red-700">{matchErrorMap[match.id]}</p>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default OrganiserPanel