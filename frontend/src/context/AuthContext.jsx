import { createContext, useState, useEffect, useCallback } from "react"
import api from "@/api/axios"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  const fetchUser = useCallback(async () => {
    const tokens = JSON.parse(localStorage.getItem("tokens") || "null")
    if (!tokens?.access) {
      setLoading(false)
      return
    }

    try {
      const { data } = await api.get("/users/me/")
      setUser(data)
    } catch {
      localStorage.removeItem("tokens")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login/", { username, password })
    localStorage.setItem("tokens", JSON.stringify(data))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem("tokens")
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
