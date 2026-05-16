import React, { createContext, useContext, useState, useEffect } from 'react'
import { storage } from '../utils/storage'
import { simpleHash, genId } from '../utils/calculations'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = storage.getSession()
    if (session) setUser(session)
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const users = storage.getUsers()
    const found = users.find(
      u => u.email === email && u.passwordHash === simpleHash(password)
    )
    if (!found) return { error: 'Invalid email or password' }
    const session = { userId: found.id, email: found.email, name: found.name }
    storage.setSession(session)
    setUser(session)
    return { success: true }
  }

  const register = (name, email, password) => {
    const users = storage.getUsers()
    if (users.find(u => u.email === email))
      return { error: 'Email already registered' }
    const newUser = {
      id: genId(),
      email,
      name,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    }
    storage.setUsers([...users, newUser])
    const session = { userId: newUser.id, email, name }
    storage.setSession(session)
    setUser(session)
    return { success: true }
  }

  const logout = () => {
    storage.clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
