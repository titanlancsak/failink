import Cookies from 'js-cookie'
import { User } from '@/types'

export const setToken = (token: string) => {
  Cookies.set('token', token, { expires: 7, sameSite: 'strict' })
}

export const getToken = () => Cookies.get('token')

export const removeToken = () => Cookies.remove('token')

export const setUser = (user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('user')
  return u ? JSON.parse(u) : null
}

export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}

export const logout = () => {
  removeToken()
  removeUser()
  window.location.href = '/auth/login'
}
