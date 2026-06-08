import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const API_BASE_URL = 'http://localhost:3001'

const OrganiserPanel = () => {
  const [user, setUser] = useState(null)
  const [isOrganiser, setIsOrganiser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tournaments, setTournaments] = useState([])
  const [disputedMatches, setDisputedMatches] = useState([])
  const [error, setError] = useState('')
  const [bracketLoadingId, setBracketLoadingId] = useState(null)
  const [bracketSuccessMap, setBracketSuccessMap] = useState({})
  const [bracketErrorMap, setBracketErrorMap] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const loadPanel = async () => {
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

        if (!profile?.is_organiser) {
          navigate('/tournaments')
          return
        }

        if (mounted) setIsOrganiser(true)

        const { data: tournamentRows, error: tournamentError } = await supabase
          .from('tournaments')
          .select('id, name, game, max_players, status, registration_deadline, organizer_id')
          .eq('organizer_id', currentUser.id)
          .order('created_at', { ascending: false })

        if (tournamentError) throw tournamentError

        const tournamentIds = (tournamentRows ?? []).map((tournament) => tournament.id)

        let disputedRows = []
        if (tournamentIds.length > 0) {
          const { data: matchRows, error: matchError } = await supabase
            .from('matches')
            .select('*')
            .eq('status', 'disputed')
            .in('tournament_id', tournamentIds)

          if (matchError) throw matchError
          disputedRows = matchRows ?? []
        }

        if (mounted) {
          setTournaments(tournamentRows ?? [])
          setDisputedMatches(disputedRows)
        }
      } catch (panelError) {
        console.error(panelError)
        setError(panelError?.message || 'Failed to load organiser panel.')
        navigate('/tournaments')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadPanel()

    return () => {
      mounted = false
    }
  }, [navigate])

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
                        <dd className="mt-1 font-semibold text-slate-900">{formatDeadline(tournament.registration_deadline)}</dd>
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
          <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900">DISPUTED MATCHES</h2>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            {disputedMatches.length === 0 ? (
              <p className="text-sm text-slate-600">No disputed matches found.</p>
            ) : (
              <div className="space-y-3">
                {disputedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                  >
                    Match ID: {match.id}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default OrganiserPanel
