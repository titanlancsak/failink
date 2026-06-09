'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (token) {
      router.push('/feed')
    } else {
      router.push('/auth/login')
    }
  }, [])

  return null
}