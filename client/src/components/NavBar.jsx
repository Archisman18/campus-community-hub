import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const formatRelativeTime = (dateValue) => {
  const timestamp = new Date(dateValue).getTime()
  if (Number.isNaN(timestamp)) return ''

  const deltaMinutes = Math.floor((Date.now() - timestamp) / 60000)

  if (deltaMinutes < 1) return 'just now'
  if (deltaMinutes < 60) return `${deltaMinutes} minute${deltaMinutes === 1 ? '' : 's'} ago`

  const deltaHours = Math.floor(deltaMinutes / 60)
  if (deltaHours < 24) return `${deltaHours} hour${deltaHours === 1 ? '' : 's'} ago`

  const deltaDays = Math.floor(deltaHours / 24)
  if (deltaDays < 7) return `${deltaDays} day${deltaDays === 1 ? '' : 's'} ago`

  const deltaWeeks = Math.floor(deltaDays / 7)
  return `${deltaWeeks} week${deltaWeeks === 1 ? '' : 's'} ago`
}

const NavBar = () => {
  const [user, setUser] = useState(null)
  const [isOrganiser, setIsOrganiser] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const navigate = useNavigate()
  const notificationsMenuRef = useRef(null)

  const unreadNotificationCount = notifications.filter((notification) => !notification.is_read).length

  const loadNotifications = useCallback(async (currentUserId) => {
    setNotificationsLoading(true)

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('id, user_id, message, match_id, is_read, created_at')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setNotifications(data ?? [])
    } catch (notificationError) {
      console.error('Error loading notifications', notificationError)
    } finally {
      setNotificationsLoading(false)
    }
  }, [])

  const markNotificationsAsRead = async (notificationRows) => {
    const unreadNotifications = notificationRows.filter((notification) => !notification.is_read)
    if (unreadNotifications.length === 0) return

    const unreadIds = unreadNotifications.map((notification) => notification.id)
    const previousNotifications = notificationRows

    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        unreadIds.includes(notification.id)
          ? { ...notification, is_read: true }
          : notification,
      ),
    )

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    if (error) {
      console.error('Error marking notifications as read', error)
      setNotifications(previousNotifications)
    }
  }

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
        await loadNotifications(currentUser.id)

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
  }, [loadNotifications])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!notificationsMenuRef.current) return
      if (notificationsMenuRef.current.contains(event.target)) return
      setNotificationsOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
    }
  }, [])

  const handleToggleNotifications = async () => {
    setNotificationsOpen((previous) => !previous)

    if (notificationsOpen) return

    await markNotificationsAsRead(notifications)
  }

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
            <Link to="/profile" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
            {isOrganiser && (
              <Link to="/organiser" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Organiser Panel</Link>
            )}
          </div>

          <div className="relative flex items-center gap-3" ref={notificationsMenuRef}>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className="relative flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              aria-label="Notifications"
            >
              <span className="text-lg leading-none">🔔</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notificationsLoading ? (
                    <p className="px-4 py-4 text-sm text-gray-500">Loading notifications...</p>
                  ) : notifications.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-gray-500">No notifications yet</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <li key={notification.id} className="px-4 py-3">
                          <p className="text-sm text-gray-800">{notification.message}</p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatRelativeTime(notification.created_at)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar
