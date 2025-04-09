"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface UserContextType {
  user: { email: string } | null
  login: (email: string) => void
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(null)

  const login = (email: string) => {
    setUser({ email })
  }

  const logout = () => {
    setUser(null)
  }

  return <UserContext.Provider value={{ user, login, logout }}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
