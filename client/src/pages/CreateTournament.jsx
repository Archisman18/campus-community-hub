import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const GAME_OPTIONS = ['BGMI', 'Free Fire', 'eFootball']
const MAX_PLAYERS_OPTIONS = [8, 16]

const CreateTournament = () => {
  const [user, setUser] = useState(null)
  const [isOrganiser, setIsOrganiser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    name: '',
    game: GAME_OPTIONS[0],
    max_players: MAX_PLAYERS_OPTIONS[0],
    deadline: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
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
      } catch (loadError) {
        console.error(loadError)
        navigate('/tournaments')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      mounted = false
    }
  }, [navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({
      ...previous,
      [name]: name === 'max_players' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (!user || !isOrganiser) {
        throw new Error('Only organisers can create tournaments.')
      }

      const { error: insertError } = await supabase.from('tournaments').insert({
        name: form.name,
        game: form.game,
        max_players: form.max_players,
        deadline: form.deadline,
        organiser_id: user.id,
        status: 'registration_open',
      })

      if (insertError) {
        throw insertError
      }

      setSuccess('Tournament created successfully.')
      setTimeout(() => {
        navigate('/organiser')
      }, 800)
    } catch (submitError) {
      setError(submitError?.message || 'Failed to create tournament.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-10">
        <p className="text-sm font-medium text-slate-600">Loading...</p>
      </main>
    )
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
          Create a tournament
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Organisers can open registration and set the tournament details here.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="name">
            Tournament Name
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Campus Cup 2026"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="game">
            Game
            <select
              id="game"
              name="game"
              value={form.game}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              {GAME_OPTIONS.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="max_players">
            Max Players
            <select
              id="max_players"
              name="max_players"
              value={form.max_players}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            >
              {MAX_PLAYERS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700" htmlFor="deadline">
            Registration Deadline
            <input
              id="deadline"
              name="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

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
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? 'Creating...' : 'Create Tournament'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default CreateTournament
