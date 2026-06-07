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

  useEffect(() => {
    let mounted = true

    const loadTournaments = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('tournaments')
          .select('id, name, game, max_players, deadline, status')
          .eq('status', 'registration_open')
          .order('deadline', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        if (mounted) {
          setTournaments(data ?? [])
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

  const formatDeadline = (deadline) => {
    if (!deadline) return 'N/A'

    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(deadline))
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
                    <dd className="mt-1 font-semibold text-slate-900">{formatDeadline(tournament.deadline)}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Join Tournament
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default TournamentsPage
