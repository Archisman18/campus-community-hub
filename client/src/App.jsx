import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import CreateTournament from './pages/CreateTournament'
import OrganiserPanel from './pages/OrganiserPanel'
import TournamentsPage from './pages/TournamentsPage'
import BracketPage from './pages/BracketPage'
import NavBar from './components/NavBar'
import { supabase } from './lib/supabase'

const Layout = () => {
  const location = useLocation()
  const hideNav = location.pathname === '/login' || location.pathname === '/register'

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

          <Route element={<RequireAuth isAuthenticated={Boolean(session)} />}>
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="create-tournament" element={<CreateTournament />} />
            <Route path="organiser" element={<OrganiserPanel />} />
            <Route path="bracket/:tournament_id" element={<BracketPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App