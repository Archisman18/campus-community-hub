import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const GAME_ORDER = ['BGMI', 'Free Fire', 'eFootball']

const formatWinRate = (wins, matchesPlayed) => {
  if (!matchesPlayed) return '—'

  return `${((Number(wins) / Number(matchesPlayed)) * 100).toFixed(1)}%`
}

const getDisplayName = (profilesById, userId) => profilesById[userId] ?? 'TBD'

const Leaderboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rowsByGame, setRowsByGame] = useState({})

  useEffect(() => {
    let mounted = true

    const loadLeaderboard = async () => {
      try {
        const { data: eloRows, error: eloError } = await supabase
          .from('player_elo')
          .select('user_id, game, elo, matches_played, wins, losses')

        if (eloError) throw eloError

        const rows = Array.isArray(eloRows) ? eloRows : []
        const userIds = [...new Set(rows.map((row) => row.user_id).filter(Boolean))]

        let profilesById = {}
        if (userIds.length > 0) {
          const { data: profileRows, error: profileError } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', userIds)

          if (profileError) throw profileError

          profilesById = Object.fromEntries(
            (profileRows ?? [])
              .filter((profileRow) => profileRow?.id && profileRow?.username)
              .map((profileRow) => [profileRow.id, profileRow.username]),
          )
        }

        const nextRowsByGame = Object.fromEntries(
          GAME_ORDER.map((game) => {
            const gameRows = rows
              .filter((row) => row.game === game)
              .sort((left, right) => Number(right.elo ?? 0) - Number(left.elo ?? 0))
              .map((row) => ({
                ...row,
                username: getDisplayName(profilesById, row.user_id),
              }))

            return [game, gameRows]
          }),
        )

        if (mounted) {
          setRowsByGame(nextRowsByGame)
        }
      } catch (loadError) {
        console.error(loadError)
        if (mounted) setError(loadError?.message || 'Failed to load leaderboard.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadLeaderboard()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-sky-700">Tournament Hub</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            Leaderboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Ranked players across BGMI, Free Fire, and eFootball.
          </p>
        </header>

        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading leaderboard...
          </div>
        )}

        {error && !loading && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {GAME_ORDER.map((game) => {
              const gameRows = rowsByGame[game] ?? []

              return (
                <section key={game} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
                    <div>
                      <h2 className="font-['Space_Grotesk'] text-xl font-bold text-slate-900">{game}</h2>
                      <p className="mt-1 text-sm text-slate-500">Current ranking order</p>
                    </div>
                    <span className="text-sm text-slate-500">{gameRows.length} players</span>
                  </div>

                  {gameRows.length === 0 ? (
                    <div className="py-6 text-sm text-slate-600">No ranked players yet</div>
                  ) : (
                    <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                          <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                            <tr>
                              <th className="px-4 py-3 font-semibold">Rank</th>
                              <th className="px-4 py-3 font-semibold">Username</th>
                              <th className="px-4 py-3 font-semibold">Elo</th>
                              <th className="px-4 py-3 font-semibold">Matches Played</th>
                              <th className="px-4 py-3 font-semibold">Wins</th>
                              <th className="px-4 py-3 font-semibold">Losses</th>
                              <th className="px-4 py-3 font-semibold">Win Rate</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {gameRows.map((row, index) => (
                              <tr key={`${row.user_id}-${game}-${row.elo}-${index}`} className="hover:bg-slate-50/80">
                                <td className="px-4 py-4 font-medium text-slate-900">{index + 1}</td>
                                <td className="px-4 py-4 text-slate-700">{row.username}</td>
                                <td className="px-4 py-4 text-slate-700">{row.elo ?? 0}</td>
                                <td className="px-4 py-4 text-slate-700">{row.matches_played ?? 0}</td>
                                <td className="px-4 py-4 text-slate-700">{row.wins ?? 0}</td>
                                <td className="px-4 py-4 text-slate-700">{row.losses ?? 0}</td>
                                <td className="px-4 py-4 text-slate-700">
                                  {formatWinRate(row.wins ?? 0, row.matches_played ?? 0)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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

export default Leaderboard