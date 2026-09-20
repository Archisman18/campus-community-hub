import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
     const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        throw signInError
      }

      navigate('/tournaments')
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.')
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
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">Welcome back — enter your credentials to continue.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
            Email
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Your password"
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <p className="mt-2 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-sky-700 hover:underline">
              Register
            </Link>
          </p>
          <p className="text-center text-sm text-slate-500 mt-2">
            Are you a tournament organiser?{' '}
           <Link to="/organiser-login" className="text-blue-600 font-medium">
             Sign in here
           </Link>
          </p>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
