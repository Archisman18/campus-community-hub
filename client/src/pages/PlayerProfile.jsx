import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const formatWinRate = (wins, matchesPlayed) => {
  if (!matchesPlayed) return '0.0'

  return ((Number(wins) / Number(matchesPlayed)) * 100).toFixed(1)
}

const PlayerProfile = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [username, setUsername] = useState('Player')
  const [eloRows, setEloRows] = useState([])

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError

        const currentUser = userData?.user ?? null
        if (!currentUser) {
          throw new Error('You must be logged in to view your profile.')
        }

        const [{ data: profileData, error: profileError }, { data: eloData, error: eloError }] = await Promise.all([
          supabase.from('profiles').select('username').eq('id', currentUser.id).maybeSingle(),
          supabase.from('player_elo').select('game, elo, matches_played, wins, losses').eq('user_id', currentUser.id),
        ])

        if (profileError) throw profileError
        if (eloError) throw eloError

        if (mounted) {
          setUsername(profileData?.username || 'Player')
          setEloRows(Array.isArray(eloData) ? eloData : [])
        }
      } catch (loadError) {
        console.error(loadError)
        if (mounted) {
          setError(loadError?.message || 'Failed to load profile.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">Player Hub</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            {username}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Your game-by-game rating history and match totals.
          </p>
        </header>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading profile...
          </div>
        )}

        {error && !loading && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && eloRows.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
            No matches played yet.
          </div>
        )}

        {!loading && !error && eloRows.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {eloRows.map((row) => (
              <article
                key={`${row.game}-${row.matches_played}-${row.elo}`}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">{row.game}</h2>
                    <p className="mt-1 text-sm text-slate-500">Current rating</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900 px-3 py-2 text-right text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Elo</p>
                    <p className="text-xl font-bold">{row.elo}</p>
                  </div>
                </div>

                <dl className="mt-5 grid gap-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Matches Played</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{row.matches_played ?? 0}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Win Rate</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{formatWinRate(row.wins, row.matches_played)}%</dd>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Wins</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{row.wins ?? 0}</dd>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <dt className="text-slate-500">Losses</dt>
                      <dd className="mt-1 font-semibold text-slate-900">{row.losses ?? 0}</dd>
                    </div>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default PlayerProfile
