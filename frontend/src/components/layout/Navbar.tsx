'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { logout } from '@/lib/auth'
import { Home, Users, User, LogOut, Bell } from 'lucide-react'

const navLinks = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/friends', label: 'Friends', icon: Users },
  { href: '/profile', label: 'Profile', icon: User },
]

export default function Navbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-paper border-b border-steel-200">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-ink group-hover:bg-accent transition-colors duration-200 flex items-center justify-center">
            <span className="text-paper font-display text-xs font-bold">A</span>
          </div>
          <span className="font-display text-lg tracking-wide text-ink hidden sm:block">Agora</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3 py-2 text-xs tracking-widest uppercase font-display transition-all duration-150 
                  ${active
                    ? 'text-ink border-b-2 border-accent'
                    : 'text-steel-400 hover:text-ink border-b-2 border-transparent'
                  }`}
              >
                <Icon size={15} />
                <span className="hidden md:block">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* User actions */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-ink-soft flex items-center justify-center text-paper text-xs font-display">
                {user.username[0].toUpperCase()}
              </div>
              <span className="text-xs text-steel-400 hidden md:block">{user.username}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="p-2 text-steel-400 hover:text-accent transition-colors duration-150"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
