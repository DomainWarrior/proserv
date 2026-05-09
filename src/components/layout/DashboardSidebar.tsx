'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, CalendarDays, Calendar, ClipboardList,
  Bell, User, LogOut, ChevronRight,
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

interface Props {
  profile: Profile | null
  userEmail: string
  isAdmin?: boolean
}

const customerLinks = [
  { href: '/dashboard',               label: 'Overview',       icon: LayoutDashboard },
  { href: '/dashboard/appointments',  label: 'Appointments',   icon: CalendarDays },
  { href: '/dashboard/calendar',      label: 'Calendar',       icon: Calendar },
  { href: '/dashboard/history',       label: 'Service History',icon: ClipboardList },
  { href: '/dashboard/notifications', label: 'Notifications',  icon: Bell },
  { href: '/dashboard/profile',       label: 'My Profile',     icon: User },
]

const adminLinks = [
  { href: '/admin',                   label: 'Analytics',      icon: LayoutDashboard },
  { href: '/admin/appointments',      label: 'Appointments',   icon: CalendarDays },
  { href: '/admin/calendar',          label: 'Calendar',       icon: Calendar },
  { href: '/admin/customers',         label: 'Customers',      icon: User },
  { href: '/admin/workers',           label: 'Workers',        icon: ClipboardList },
  { href: '/admin/settings',          label: 'Settings',       icon: User },
]

export function DashboardSidebar({ profile, userEmail, isAdmin = false }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const links = isAdmin ? adminLinks : customerLinks

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-64 bg-navy flex-shrink-0 flex flex-col hidden md:flex">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="font-display text-gold text-xl">ProServ</Link>
        <p className="text-white/40 text-xs mt-0.5 font-sans">
          {isAdmin ? 'Admin Dashboard' : 'Customer Portal'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="mb-2 px-3 text-white/30 text-xs font-semibold uppercase tracking-widest">
          {isAdmin ? 'Operations' : 'Main'}
        </div>
        {links.map(link => {
          const Icon = link.icon
          const active = pathname === link.href || (link.href !== '/dashboard' && link.href !== '/admin' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'sidebar-item mb-0.5',
                active && 'active'
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              <span>{link.label}</span>
              {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
            </Link>
          )
        })}

        {!isAdmin && (
          <Link
            href="/api/calendar/connect"
            className="sidebar-item mt-4 mb-0.5 border border-white/10 rounded-lg"
          >
            <Calendar size={17} />
            <span>Connect Google Cal</span>
          </Link>
        )}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold flex-shrink-0">
            {getInitials(profile?.full_name ?? userEmail)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {profile?.full_name ?? userEmail}
            </p>
            <p className="text-white/40 text-xs">{isAdmin ? 'Admin' : 'Customer'}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-white/30 hover:text-red-400 transition-colors p-1"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
