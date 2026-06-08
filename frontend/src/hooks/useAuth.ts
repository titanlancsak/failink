'use client'
import { useState, useEffect } from 'react'
import { User } from '@/types'
import { getUser, getToken } from '@/lib/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    const storedUser = getUser()
    if (token && storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  return { user, loading, isAuthenticated: !!user }
}
