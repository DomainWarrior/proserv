'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Menu, X, Phone, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

const navLinks = [
  { href: '/',         label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/contact',  label: 'Contact' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<Profile | null>(null)
  const [scrolled, setScrolled] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user: u } }) => {
      if (!u) return
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single()
      setUser(data)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_, session) => {
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          setUser(data)
        } else {
          setUser(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-navy/96 backdrop-blur-md border-b border-gold/20 shadow-lg'
          : 'bg-navy/90 backdrop-blur-sm'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="font-display text-gold text-2xl hover:opacity-90 transition-opacity"
        >
          ProServ
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'text-gold'
                  : 'text-white/75 hover:text-white'
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:+15551234567"
            className="flex items-center gap-2 text-sm text-white/75 hover:text-gold transition-colors"
          >
            <Phone size={14} />
            (555) 123-4567
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-white/60 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="text-sm font-medium text-white/75 hover:text-gold border border-gold/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <button onClick={handleSignOut} className="text-sm text-white/50 hover:text-white transition-colors px-2">
                Sign out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-gold border border-gold/30 px-4 py-2 rounded-lg hover:bg-gold/10 transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/book"
                className="btn-primary text-sm py-2"
              >
                Book Now
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 px-4 py-4 flex flex-col gap-3">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/80 text-sm font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <a href="tel:+15551234567" className="text-gold text-sm font-semibold py-2">
            ðŸ“ž (555) 123-4567
          </a>
          {user ? (
            <Link href="/dashboard" className="btn-primary text-sm w-full justify-center mt-2">
              Dashboard
            </Link>
          ) : (
            <Link href="/book" className="btn-primary text-sm w-full justify-center mt-2">
              Book Now
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
