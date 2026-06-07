import { useState } from 'react'
import { supabase } from '../lib/supabase'

const GAME_OPTIONS = ['BGMI', 'Free Fire', 'eFootball']
const TIER_OPTIONS = [
  { label: 'Beginner', elo: 800 },
  { label: 'Intermediate', elo: 1000 },
  { label: 'Advanced', elo: 1200 },
  { label: 'Competitive', elo: 1500 },
]

const DEFAULT_TIER = TIER_OPTIONS[0].label

function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    selectedGames: [],
    tiers: {},
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  function toggleGame(gameName) {
    setForm((previous) => {
      const isSelected = previous.selectedGames.includes(gameName)

      return {
        ...previous,
        selectedGames: isSelected
          ? previous.selectedGames.filter((selectedGame) => selectedGame !== gameName)
          : [...previous.selectedGames, gameName],
        tiers: isSelected
          ? Object.fromEntries(
              Object.entries(previous.tiers).filter(([selectedGame]) => selectedGame !== gameName),
            )
          : {
              ...previous.tiers,
              [gameName]: previous.tiers[gameName] ?? DEFAULT_TIER,
            },
      }
    })
  }

  function setGameTier(gameName, tierName) {
    setForm((previous) => ({
      ...previous,
      tiers: {
        ...previous.tiers,
        [gameName]: tierName,
      },
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (form.selectedGames.length === 0) {
      setError('Please select at least one game before registering.')
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            username: form.username,
            game: form.game,
          },
          emailRedirectTo: window.location.origin,
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      const userId = data.user?.id

      if (!userId) {
        throw new Error('Signup completed, but no user id was returned.')
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        username: form.username,
      })

      if (profileError) {
        throw new Error(profileError.message)
      }

      const playerEloRows = form.selectedGames.map((gameName) => {
        const selectedTier = form.tiers[gameName] ?? DEFAULT_TIER
        const elo = TIER_OPTIONS.find((tier) => tier.label === selectedTier)?.elo ?? 800

        return {
          user_id: userId,
          game: gameName,
          elo,
          matches_played: 0,
          wins: 0,
          losses: 0,
        }
      })

      const { error: playerEloError } = await supabase.from('player_elo').insert(playerEloRows)

      if (playerEloError) {
        throw new Error(playerEloError.message)
      }

      setSuccess('Registration successful. Your profile and selected game stats have been created.')
      setForm({
        email: '',
        password: '',
        username: '',
        selectedGames: [],
        tiers: {},
      })
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Registration failed. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute -left-20 top-8 h-52 w-52 rounded-full bg-amber-300/40 blur-3xl" />
      <div className="absolute -bottom-10 right-0 h-64 w-64 rounded-full bg-sky-300/40 blur-3xl" />

      <section className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/85 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-md sm:p-9">
        <p className="font-['Space_Grotesk'] text-xs font-bold uppercase tracking-[0.25em] text-sky-700">
          Tournament Hub
        </p>
        <h1 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
          Create your player account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Join the queue and set your preferred game before your first match.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="username">
            Username
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              required
              minLength={3}
              placeholder="Drop your in-game name"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-slate-700">Game Selection</legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {GAME_OPTIONS.map((gameName) => {
                const isChecked = form.selectedGames.includes(gameName)

                return (
                  <label
                    key={gameName}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${
                      isChecked
                        ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleGame(gameName)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="text-sm font-semibold text-slate-800">{gameName}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {form.selectedGames.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-700">Skill Tier</p>
              {form.selectedGames.map((gameName) => (
                <fieldset
                  key={gameName}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <legend className="px-1 text-sm font-semibold text-slate-800">{gameName}</legend>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {TIER_OPTIONS.map((tier) => {
                      const isSelected = (form.tiers[gameName] ?? DEFAULT_TIER) === tier.label

                      return (
                        <label
                          key={tier.label}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition ${
                            isSelected
                              ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                              : 'border-slate-300 bg-white hover:border-slate-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`tier-${gameName}`}
                            checked={isSelected}
                            onChange={() => setGameTier(gameName, tier.label)}
                            className="h-4 w-4 border-slate-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm text-slate-800">
                            {tier.label} <span className="text-slate-500">→ ELO {tier.elo}</span>
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default RegisterPage
