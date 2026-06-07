import { BrowserRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import NavBar from './components/NavBar'
import React from 'react'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RegisterPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="tournaments" element={<div className="p-8">Tournaments placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App