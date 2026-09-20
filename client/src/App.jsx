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
      const { data } = await supabase.auth.getSession()
      if (!active) return
      setSession(data.session ?? null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-slate-50" />
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