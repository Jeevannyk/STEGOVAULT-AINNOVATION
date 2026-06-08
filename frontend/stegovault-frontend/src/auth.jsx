import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { API } from '@/config'

const AuthContext = createContext(null)

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('sv_token') || null)
  const [loading, setLoading] = useState(() => !!localStorage.getItem('sv_token'))

  // Restore session on mount if a token is present.
  useEffect(() => {
    const t = localStorage.getItem('sv_token')
    if (!t) { setLoading(false); return }
    fetch(`${API}/auth/me/`, { headers: { Authorization: `Token ${t}` } })
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(d => { setUser(d.user); setToken(t) })
      .catch(() => { localStorage.removeItem('sv_token'); setToken(null); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  const persist = (tok, usr) => {
    localStorage.setItem('sv_token', tok)
    setToken(tok); setUser(usr)
  }

  const login = useCallback(async (email, password) => {
    const r = await fetch(`${API}/auth/login/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Unable to sign in.')
    persist(d.token, d.user)
  }, [])

  const register = useCallback(async (name, email, password) => {
    const r = await fetch(`${API}/auth/register/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'Unable to create account.')
    persist(d.token, d.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout/`, { method: 'POST', headers: { Authorization: `Token ${token}` } })
    } catch { /* best-effort */ }
    localStorage.removeItem('sv_token'); setToken(null); setUser(null)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
