import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import CreateTournament from './pages/CreateTournament'
import OrganiserPanel from './pages/OrganiserPanel'
import OrganiserMatches from './pages/OrganiserMatches'
import Leaderboard from './pages/Leaderboard'
import TournamentsPage from './pages/TournamentsPage'
import BracketPage from './pages/BracketPage'
import PlayerProfile from './pages/PlayerProfile'
import NavBar from './components/NavBar'
import { supabase } from './lib/supabase'
import OrganiserLoginPage from './pages/OrganiserLoginPage'
import SubmitScore from './pages/SubmitScore';
import MyMatches from './pages/MyMatches';

const Layout = () => {
  const location = useLocation()
  const hideNav = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/organiser-login'

  return (
    <>
      {!hideNav && <NavBar />}
      <Outlet />
    </>
  )
}

const RequireAuth = ({ isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

const RootRedirect = ({ isAuthenticated }) => {
  return <Navigate to={isAuthenticated ? '/tournaments' : '/login'} replace />
}

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.warn('Session retrieval error:', error.message)
        }
        if (!active) return
        setSession(data?.session ?? null)
      } catch (err) {
        console.error('Failed to get session:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSession()

    // Safety timeout: Never leave user stuck on loading spinner if Supabase network is slow
    const fallbackTimer = setTimeout(() => {
      if (active) setLoading(false)
    }, 2500)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      clearTimeout(fallbackTimer)
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading Tournament Hub...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RootRedirect isAuthenticated={Boolean(session)} />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="/organiser-login" element={<OrganiserLoginPage />} />
          <Route path="/match/:match_id" element={<SubmitScore />} />
          <Route path="/matches" element={<MyMatches />} />
          <Route path="/leaderboard" element={<Leaderboard />} />  
        
          <Route element={<RequireAuth isAuthenticated={Boolean(session)} />}>
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="create-tournament" element={<CreateTournament />} />
            <Route path="organiser" element={<OrganiserPanel />} />
            <Route path="organiser/matches" element={<OrganiserMatches />} />
            <Route path="bracket/:tournament_id" element={<BracketPage />} />
            <Route path="profile" element={<PlayerProfile />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App