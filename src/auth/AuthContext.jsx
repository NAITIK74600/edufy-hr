import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiClient, setAccessToken } from '../services/apiClient'
import { hrStore } from '../services/hrStore'
import { connectLiveUpdates } from '../services/liveUpdates'

const AuthContext = createContext(null)
const SESSION_KEY = 'edufyi.accessToken'
const USER_KEY = 'edufyi.authUser'

function readStoredToken() {
  try {
    return window.localStorage.getItem(SESSION_KEY) || window.sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function readStoredUser() {
  try {
    const raw = window.localStorage.getItem(USER_KEY) || window.sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken)
  const [user, setUser] = useState(readStoredUser)
  const [status, setStatus] = useState(() => (readStoredToken() ? (readStoredUser() ? 'authenticated' : 'loading') : 'signed-out'))
  useEffect(() => hrStore.subscribe((state) => {
    setUser((current) => {
      if (!current || ['admin', 'hr'].includes(current.role)) return current
      const found = state.employees.find((e) =>
        (current.id && (e.id === current.id || e._id === current.id)) ||
        (current.employeeId && (e.employeeId === current.employeeId || e.id === current.employeeId)) ||
        (current.email && e.email && e.email.toLowerCase() === current.email.toLowerCase())
      )
      if (!found) return current
      const displayName = found.name || found.displayName || current.displayName || current.name || current.username
      return { ...current, ...found, displayName, name: found.name || current.name || displayName }
    })
  }), [])

  useEffect(() => {
    if (status !== 'authenticated' || !user?.id) return
    let active = true
    const failed = (error) => {
      if (!active) return
      if (error.status === 401) clearSession()
      else hrStore.reportError(error)
    }
    hrStore.connectUser(user).catch(failed)
    const refresh = () => hrStore.refresh().catch(failed)
    const disconnect = connectLiveUpdates(token, refresh, failed)
    const timer = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    return () => {
      active = false
      window.clearInterval(timer)
      disconnect()
      window.removeEventListener('focus', refresh)
    }
  }, [status, user?.id, token])

  useEffect(() => {
    let active = true
    setAccessToken(token)
    if (token) {
      const timeoutId = setTimeout(() => {
        if (!active) return
        const cachedUser = readStoredUser()
        if (cachedUser) {
          console.warn('Session validation took longer than expected; using local cached session.')
          setUser(cachedUser)
          setStatus('authenticated')
        } else {
          clearSession()
        }
      }, 20000)

      apiClient
        .get('/auth/me')
        .then((result) => {
          clearTimeout(timeoutId)
          if (!active) return
          if (result?.data?.user) {
            setUser(result.data.user)
            persistUser(result.data.user)
            setStatus('authenticated')
          } else {
            clearSession()
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId)
          if (!active) return
          if (error?.status === 401) {
            console.warn('Session authentication expired (401). Signing out.')
            clearSession()
          } else {
            console.warn('Network issue during /auth/me verification:', error.message)
            const cachedUser = readStoredUser()
            if (cachedUser) {
              setUser(cachedUser)
              setStatus('authenticated')
            }
          }
        })
    } else {
      setStatus('signed-out')
    }
    return () => { active = false }
  }, [token])

  function persistToken(nextToken) {
    try {
      if (nextToken) {
        window.localStorage.setItem(SESSION_KEY, nextToken)
        window.sessionStorage.setItem(SESSION_KEY, nextToken)
      } else {
        window.localStorage.removeItem(SESSION_KEY)
        window.sessionStorage.removeItem(SESSION_KEY)
      }
    } catch {
      /* no-op */
    }
    setToken(nextToken)
  }

  function persistUser(nextUser) {
    try {
      if (nextUser) {
        const str = JSON.stringify(nextUser)
        window.localStorage.setItem(USER_KEY, str)
        window.sessionStorage.setItem(USER_KEY, str)
      } else {
        window.localStorage.removeItem(USER_KEY)
        window.sessionStorage.removeItem(USER_KEY)
      }
    } catch {
      /* no-op */
    }
    setUser(nextUser)
  }

  function updateUser(updates) {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      persistUser(updated)
      return updated
    })
  }

  function clearSession() {
    try {
      window.localStorage.removeItem(SESSION_KEY)
      window.localStorage.removeItem(USER_KEY)
      window.localStorage.removeItem('edufyi.activePersona')
      window.sessionStorage.removeItem(SESSION_KEY)
      window.sessionStorage.removeItem(USER_KEY)
      window.sessionStorage.removeItem('edufyi.activePersona')
    } catch {
      /* no-op */
    }
    setAccessToken(null)
    setToken(null)
    setUser(null)
    setStatus('signed-out')
    hrStore.connectUser(null).catch(() => {})
  }

  async function login(identifier, password, portal) {
    if (!identifier || !identifier.trim()) {
      throw new Error('Please enter your work email, username, or employee ID.')
    }
    if (!password) {
      throw new Error('Please enter your password.')
    }

    const cleanIdentifier = identifier.trim()

    // Server-side authentication only. There is no client-side/offline bypass:
    // every login must be verified by the API against the user store.
    let result = null

    try {
      result = await apiClient.post('/auth/login', {
        email: cleanIdentifier,
        username: cleanIdentifier,
        identifier: cleanIdentifier,
        password,
        portal,
      })
    } catch (apiErr) {
      if (apiErr?.code === 'PORTAL_ACCESS_DENIED' || apiErr?.status === 403) {
        throw new Error(apiErr.message || 'Access denied for this portal.')
      }
      if (apiErr?.status === 401 || apiErr?.code === 'INVALID_CREDENTIALS') {
        throw new Error('Invalid email or password.')
      }
      throw new Error(apiErr?.message || 'Unable to reach the authentication server. Please try again in a moment.')
    }

    if (result?.data?.token && result?.data?.user) {
      const loggedUser = result.data.user

      // Client-side portal role enforcement guarantee
      if (portal === 'admin' && loggedUser.role !== 'admin') {
        clearSession()
        throw new Error('Access denied: Employee credentials cannot be used to log into the Admin portal. Please use Employee Self-Service.')
      }
      if (portal === 'hr' && !['hr', 'admin'].includes(loggedUser.role)) {
        clearSession()
        throw new Error('Access denied: Employee credentials cannot be used to log into the HR portal. Please use Employee Self-Service.')
      }
      if (portal === 'management' && !['hr', 'admin'].includes(loggedUser.role)) {
        clearSession()
        throw new Error('Access denied: Employee credentials cannot be used to log into the Management Console. Please use Employee Self-Service.')
      }
      if (portal === 'employee' && ['admin', 'hr'].includes(loggedUser.role)) {
        clearSession()
        throw new Error('Access denied: Administrative accounts must sign into the Management Console. Please switch to the Management portal.')
      }

      setAccessToken(result.data.token)
      persistToken(result.data.token)
      persistUser(result.data.user)
      setStatus('authenticated')
      hrStore.addAuditLog(
        result.data.user.name,
        'USER_LOGIN',
        `Authenticated via API as ${result.data.user.role.toUpperCase()} (${cleanIdentifier})`
      )
      return result.data.user
    }

    throw new Error('Invalid email or password.')
  }

  async function logout() {
    try {
      if (token) await apiClient.post('/auth/logout', undefined)
    } catch {
      /* no-op */
    } finally {
      clearSession()
      window.location.hash = '#/login'
    }
  }

  async function changePassword({ currentPassword, newPassword }) {
    if (!newPassword || newPassword.trim().length < 8) {
      throw new Error('New password must be at least 8 characters long.')
    }
    const res = await apiClient.post('/auth/change-password', {
      currentPassword: currentPassword || undefined,
      newPassword: newPassword.trim(),
    })
    if (res?.data?.user) {
      updateUser(res.data.user)
    } else {
      updateUser({ mustChangePassword: false })
    }
    return res?.data || { success: true }
  }

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      login,
      logout,
      changePassword,
      updateUser,
    }),
    [token, user, status]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    return {
      user: null,
      status: 'loading',
      token: null,
      login: async () => {},
      logout: async () => {},
      changePassword: async () => {},
      updateUser: () => {},
    }
  }
  return context
}
