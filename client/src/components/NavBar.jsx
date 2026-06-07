import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const NavBar = () => {
  const [user, setUser] = useState(null)
  const [isOrganiser, setIsOrganiser] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const loadProfile = async () => {
      try {
        const getUserResult = await supabase.auth.getUser()
        const currentUser = getUserResult?.data?.user || null
        if (!currentUser) {
          if (mounted) setUser(null)
          return
        }
        if (mounted) setUser(currentUser)

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single()

        if (error) {
          console.error('Error loading profile', error)
          if (mounted) setIsOrganiser(false)
        } else {
          if (mounted) setIsOrganiser(Boolean(profile?.is_organiser))
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) return null
  if (!user) return null

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex space-x-4">
            <Link to="/tournaments" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Tournaments</Link>
            <Link to="/leaderboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Leaderboard</Link>
            <Link to="/matches" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">My Matches</Link>
            <Link to="/profile" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">My Profile</Link>
            {isOrganiser && (
              <Link to="/organiser" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Organiser Panel</Link>
            )}
          </div>

          <div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
