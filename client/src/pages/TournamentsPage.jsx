import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GAME_BADGE_CLASSES = {
  BGMI: 'bg-blue-100 text-blue-800 ring-blue-200',
  'Free Fire': 'bg-orange-100 text-orange-800 ring-orange-200',
  eFootball: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
}

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [joinedIds, setJoinedIds] = useState(new Set())
  const [submittingId, setSubmittingId] = useState(null)
  const [errorsMap, setErrorsMap] = useState({})
  const [showTierModal, setShowTierModal] = useState(false)
  const [modalTournament, setModalTournament] = useState(null)
  const [selectedTier, setSelectedTier] = useState('Intermediate')

  useEffect(() => {
    let mounted = true

    const loadTournaments = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('tournaments')
            .select('id, name, game, max_players, registration_deadline, status, organizer_id')
            .eq('status', 'registration_open')
            .order('registration_deadline', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        if (mounted) {
          setTournaments(data ?? [])
          // after loading tournaments, also load current user and their registrations
          const { data: userData } = await supabase.auth.getUser()
          const currentUser = userData?.user ?? null

          if (currentUser && (data ?? []).length > 0) {
            const tournamentIds = (data ?? []).map((t) => t.id)
            const { data: regs, error: regsError } = await supabase
              .from('tournament_registrations')
              .select('tournament_id')
              .in('tournament_id', tournamentIds)
              .eq('user_id', currentUser.id)

            if (!regsError && regs) {
              const ids = new Set(regs.map((r) => r.tournament_id))
              if (mounted) setJoinedIds(ids)
            }
          }
        }
      } catch (loadError) {
        console.error(loadError)
        if (mounted) {
          setError(loadError?.message || 'Failed to load tournaments.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadTournaments()

    return () => {
      mounted = false
    }
  }, [])

  const TIERS = {
    Beginner: 800,
    Intermediate: 1000,
    Advanced: 1200,
    Competitive: 1500,
  }

  const handleJoin = async (tournament) => {
    const tournamentId = tournament.id
    setErrorsMap((m) => ({ ...m, [tournamentId]: '' }))
    setSubmittingId(tournamentId)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData?.user ?? null
      if (!currentUser) {
        throw new Error('You must be logged in to join a tournament.')
      }

      if (joinedIds.has(tournamentId)) {
        return
      }

      // check player_elo exists for this user+game
      const { data: eloRow, error: eloError } = await supabase
        .from('player_elo')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('game', tournament.game)
        .maybeSingle()

      if (eloError) throw eloError

      if (!eloRow) {
        // show modal to select tier
        setModalTournament(tournament)
        setSelectedTier('Intermediate')
        setShowTierModal(true)
        // don't keep button in submitting state while user chooses tier
        setSubmittingId(null)
        return
      }

      // proceed to register
      const { error: insertError } = await supabase.from('tournament_registrations').insert({
        tournament_id: tournamentId,
        user_id: currentUser.id,
        registered_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      setJoinedIds((prev) => new Set(prev).add(tournamentId))
    } catch (e) {
      console.error(e)
      setErrorsMap((m) => ({ ...m, [tournamentId]: e?.message || 'Failed to join tournament.' }))
    } finally {
      setSubmittingId(null)
    }
  }

  const confirmTierAndRegister = async () => {
    if (!modalTournament) return
    const tournamentId = modalTournament.id
    setErrorsMap((m) => ({ ...m, [tournamentId]: '' }))
    setSubmittingId(tournamentId)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData?.user ?? null
      if (!currentUser) throw new Error('You must be logged in to continue.')

      // insert player_elo
      const eloValue = TIERS[selectedTier] ?? TIERS.Intermediate
      const { error: eloInsertError } = await supabase.from('player_elo').insert({
        user_id: currentUser.id,
        game: modalTournament.game,
        elo: eloValue,
        matches_played: 0,
        wins: 0,
        losses: 0,
      })
      if (eloInsertError) throw eloInsertError

      // insert registration
      const { error: regError } = await supabase.from('tournament_registrations').insert({
        tournament_id: tournamentId,
        user_id: currentUser.id,
        registered_at: new Date().toISOString(),
      })
      if (regError) throw regError

      setJoinedIds((prev) => new Set(prev).add(tournamentId))
      setShowTierModal(false)
      setModalTournament(null)
    } catch (e) {
      console.error(e)
      setErrorsMap((m) => ({ ...m, [tournamentId]: e?.message || 'Failed to register.' }))
    } finally {
      setSubmittingId(null)
    }
  }

  const cancelTierModal = () => {
    setShowTierModal(false)
    setModalTournament(null)
    setSelectedTier('Intermediate')
  }

  const formatDeadline = (registration_deadline) => {
    if (!registration_deadline) return 'N/A'

    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(registration_deadline))
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">Tournament Hub</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            Open Tournaments
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Browse tournaments that are currently accepting registrations.
          </p>
        </header>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading tournaments...
          </div>
        )}

        {error && !loading && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && tournaments.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            No tournaments open right now. Check back soon.
          </div>
        )}

        {!loading && !error && tournaments.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tournaments.map((tournament) => (
              <article
                key={tournament.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{tournament.name}</h2>
                    <span
                      className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${GAME_BADGE_CLASSES[tournament.game] ?? 'bg-slate-100 text-slate-700 ring-slate-200'}`}
                    >
                      {tournament.game}
                    </span>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">Max Players</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{tournament.max_players}</dd>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <dt className="text-slate-500">Registration Deadline</dt>
                    <dd className="mt-1 font-semibold text-slate-900">{formatDeadline(tournament.registration_deadline)}</dd>
                  </div>
                </dl>

                {joinedIds.has(tournament.id) ? (
                  <button
                    type="button"
                    disabled
                    className="mt-5 w-full rounded-xl bg-slate-400 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Registered ✓
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleJoin(tournament)}
                      disabled={submittingId === tournament.id}
                      className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                        submittingId === tournament.id ? 'bg-slate-400' : 'bg-slate-900 hover:bg-slate-700'
                      }`}
                    >
                      {submittingId === tournament.id ? 'Joining...' : 'Join Tournament'}
                    </button>
                    {errorsMap[tournament.id] && (
                      <p className="mt-2 text-sm text-red-700">{errorsMap[tournament.id]}</p>
                    )}
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      {/* Tier selection modal */}
      {showTierModal && modalTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={cancelTierModal} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Select your skill tier</h3>
            <p className="mt-1 text-sm text-slate-600">Choose a starting tier for {modalTournament.game}</p>

            <div className="mt-4 space-y-2">
              {Object.keys(TIERS).map((tier) => (
                <label key={tier} className="flex items-center gap-3 rounded-xl border p-3">
                  <input
                    type="radio"
                    name="tier"
                    value={tier}
                    checked={selectedTier === tier}
                    onChange={() => setSelectedTier(tier)}
                    className="h-4 w-4"
                  />
                  <div>
                    <div className="font-semibold">{tier}</div>
                    <div className="text-sm text-slate-500">Elo: {TIERS[tier]}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelTierModal}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmTierAndRegister}
                disabled={submittingId === (modalTournament && modalTournament.id)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                {submittingId === (modalTournament && modalTournament.id) ? 'Registering...' : 'Confirm & Register'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default TournamentsPage
