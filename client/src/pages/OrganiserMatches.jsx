import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
const API_BASE_URL = 'http://localhost:3001'

const statusMeta = {
  pending: {
    label: 'Pending',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  disputed: {
    label: 'Disputed',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
}

const getStatusMeta = (status) => statusMeta[status] ?? statusMeta.pending

const getDisplayName = (profilesById, playerId) => {
  if (!playerId) return 'TBD'

  return profilesById[playerId] ?? 'TBD'
}

const sortMatchesByRound = (matches) =>
  [...matches].sort((left, right) => {
    const leftRound = Number(left.round ?? 0)
    const rightRound = Number(right.round ?? 0)
    if (leftRound !== rightRound) return leftRound - rightRound

    const leftTime = new Date(left.created_at || left.updated_at || 0).getTime()
    const rightTime = new Date(right.created_at || right.updated_at || 0).getTime()
    if (leftTime !== rightTime) return leftTime - rightTime

    return String(left.id).localeCompare(String(right.id))
  })

const OrganiserMatches = () => {
  const [user, setUser] = useState(null)
  const [isOrganiser, setIsOrganiser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tournaments, setTournaments] = useState([])
  const [matches, setMatches] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [resolveOpenByMatchId, setResolveOpenByMatchId] = useState({})
  const [selectedWinnerByMatchId, setSelectedWinnerByMatchId] = useState({})
  const [resolvingMatchMap, setResolvingMatchMap] = useState({})
  const [resolveErrorMap, setResolveErrorMap] = useState({})
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const loadMatches = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const currentUser = userData?.user ?? null
        if (!currentUser) {
          navigate('/login')
          return
        }

        if (mounted) setUser(currentUser)

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (profileError) throw profileError

        const organiserFlag = Boolean(profile?.is_organiser)
        if (!organiserFlag) {
          navigate('/tournaments')
          return
        }

        if (mounted) setIsOrganiser(true)

        const { data: tournamentRows, error: tournamentError } = await supabase
          .from('tournaments')
          .select('id, name, organizer_id, created_at')
          .eq('organizer_id', currentUser.id)
          .order('created_at', { ascending: false })

        if (tournamentError) throw tournamentError

        const tournamentList = tournamentRows ?? []
        const tournamentIds = tournamentList.map((tournament) => tournament.id)

        let matchRows = []
        if (tournamentIds.length > 0) {
          const { data: fetchedMatches, error: matchError } = await supabase
            .from('matches')
            .select('id, tournament_id, player1_id, player2_id, round, submission_a, submission_b, status, winner_id, created_at, updated_at')
            .in('tournament_id', tournamentIds)
            .order('round', { ascending: true })

          if (matchError) throw matchError
          matchRows = fetchedMatches ?? []
        }

        const playerIds = new Set()
        for (const match of matchRows) {
          if (match.player1_id) playerIds.add(match.player1_id)
          if (match.player2_id) playerIds.add(match.player2_id)
        }

        let profileMap = {}
        if (playerIds.size > 0) {
          const { data: profileRows, error: profilesError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', [...playerIds])

          if (profilesError) throw profilesError

          profileMap = Object.fromEntries(
            (profileRows ?? [])
              .filter((profileRow) => profileRow?.id && profileRow?.username)
              .map((profileRow) => [profileRow.id, profileRow.username]),
          )
        }

        if (mounted) {
          setTournaments(tournamentList)
          setMatches(matchRows)
          setProfilesById(profileMap)
        }
      } catch (loadError) {
        console.error(loadError)
        if (mounted) setError(loadError?.message || 'Failed to load organiser matches.')
        navigate('/tournaments')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadMatches()

    return () => {
      mounted = false
    }
  }, [navigate])

  const handleOpenResolve = (match) => {
    setResolveErrorMap((previous) => ({ ...previous, [match.id]: '' }))
    setResolveOpenByMatchId((previous) => {
      const isOpen = Boolean(previous[match.id])
      return {
        ...previous,
        [match.id]: !isOpen,
      }
    })
    setSelectedWinnerByMatchId((previous) => ({
      ...previous,
      [match.id]: previous[match.id] ?? match.player1_id ?? match.player2_id ?? '',
    }))
  }

  const handleResolveWinner = async (match) => {
    const chosenWinnerId = selectedWinnerByMatchId[match.id] ?? match.player1_id ?? match.player2_id ?? ''

    if (!chosenWinnerId) {
      setResolveErrorMap((previous) => ({
        ...previous,
        [match.id]: 'Choose a winner before confirming.',
      }))
      return
    }

    setResolvingMatchMap((previous) => ({ ...previous, [match.id]: true }))
    setResolveErrorMap((previous) => ({ ...previous, [match.id]: '' }))

    try {
      const response = await fetch(`${API_BASE_URL}/api/matches/${match.id}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner_id: chosenWinnerId }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to resolve match.')
      }

      setMatches((previous) =>
        previous.map((row) =>
          row.id === match.id ? { ...row, status: 'confirmed', winner_id: chosenWinnerId } : row,
        ),
      )
      setResolveOpenByMatchId((previous) => ({ ...previous, [match.id]: false }))
      setSelectedWinnerByMatchId((previous) => {
        const nextSelections = { ...previous }
        delete nextSelections[match.id]
        return nextSelections
      })
    } catch (resolveError) {
      console.error(resolveError)
      setResolveErrorMap((previous) => ({
        ...previous,
        [match.id]: resolveError?.message || 'Failed to resolve match.',
      }))
    } finally {
      setResolvingMatchMap((previous) => ({ ...previous, [match.id]: false }))
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <p className="text-sm font-medium text-slate-600">Loading organiser matches...</p>
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
            Organiser Matches
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Review every match across the tournaments you manage.
          </p>
        </header>

        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <NavLink
            to="/organiser"
            end
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
            }
          >
            Overview
          </NavLink>
          <NavLink
            to="/organiser/matches"
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`
            }
          >
            Matches
          </NavLink>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {tournaments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            You haven't created any tournaments yet
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => {
              const tournamentMatches = sortMatchesByRound(
                matches.filter((match) => match.tournament_id === tournament.id),
              )

              return (
                <section
                  key={tournament.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900">
                        {tournament.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">Matches for this tournament</p>
                    </div>
                    <span className="text-sm text-slate-500">{tournamentMatches.length} total</span>
                  </div>

                  {tournamentMatches.length === 0 ? (
                    <div className="py-6 text-sm text-slate-600">No matches yet</div>
                  ) : (
                    <div className="mt-5 space-y-3">
                      {tournamentMatches.map((match) => {
                        const meta = getStatusMeta(match.status)
                        const player1Name = getDisplayName(profilesById, match.player1_id)
                        const player2Name = getDisplayName(profilesById, match.player2_id)
                        const isConfirmed = match.status === 'confirmed'
                        const isDisputed = match.status === 'disputed'
                        const isResolveOpen = Boolean(resolveOpenByMatchId[match.id])
                        const isResolving = Boolean(resolvingMatchMap[match.id])

                        return (
                          <article
                            key={match.id}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm transition hover:shadow-md"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                                  Round {match.round ?? 'TBD'}
                                </p>
                                <p className="text-base font-semibold text-slate-900">
                                  {player1Name} vs {player2Name}
                                </p>
                              </div>

                              <span
                                className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.className}`}
                              >
                                {meta.label}
                              </span>
                            </div>

                            {isConfirmed && (
                              <div className="mt-3 inline-flex rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                                Final score: {match.submission_a ?? 'TBD'}
                              </div>
                            )}

                            {isDisputed && (
                              <div className="mt-4 space-y-3 rounded-2xl border border-red-200 bg-white p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">Disputed result</p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Review both reported submissions and choose the correct winner.
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleOpenResolve(match)}
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                                  >
                                    {isResolveOpen ? 'Hide resolve' : 'Resolve'}
                                  </button>
                                </div>

                                {isResolveOpen && (
                                  <div className="space-y-3">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                      <div className="rounded-2xl bg-slate-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                          {player1Name}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-900">
                                          Reported: {match.submission_a ?? 'TBD'}
                                        </p>
                                      </div>
                                      <div className="rounded-2xl bg-slate-50 p-3">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                          {player2Name}
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-slate-900">
                                          Reported: {match.submission_b ?? 'TBD'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedWinnerByMatchId((previous) => ({
                                            ...previous,
                                            [match.id]: match.player1_id ?? '',
                                          }))
                                        }
                                        disabled={isResolving}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedWinnerByMatchId[match.id] === match.player1_id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:cursor-not-allowed disabled:opacity-60`}
                                      >
                                        {player1Name}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedWinnerByMatchId((previous) => ({
                                            ...previous,
                                            [match.id]: match.player2_id ?? '',
                                          }))
                                        }
                                        disabled={isResolving}
                                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${selectedWinnerByMatchId[match.id] === match.player2_id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:cursor-not-allowed disabled:opacity-60`}
                                      >
                                        {player2Name}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleResolveWinner(match)}
                                        disabled={isResolving}
                                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                                      >
                                        {isResolving ? 'Resolving...' : 'Confirm Winner'}
                                      </button>
                                    </div>

                                    {resolveErrorMap[match.id] && (
                                      <p className="text-sm text-red-700">{resolveErrorMap[match.id]}</p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </article>
                        )
                      })}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default OrganiserMatches