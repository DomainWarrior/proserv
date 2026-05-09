import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, formatDistanceToNow } from 'date-fns'
import { CalendarDays, DollarSign, Star, CheckCircle } from 'lucide-react'
import { getStatusColor, formatCurrency } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [
    { data: profile },
    { data: upcoming },
    { data: notifications },
    { count: totalJobs },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase
      .from('appointments')
      .select('*, service:services(name)')
      .eq('customer_id', user!.id)
      .in('status', ['pending', 'confirmed'])
      .order('scheduled_at')
      .limit(3),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', user!.id),
  ])

  const name = profile?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-navy">{greeting}, {name}</h1>
          <p className="text-[--gray-500] text-sm mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Link href="/book" className="btn-primary">
          + Book a Service
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Upcoming', value: upcoming?.length ?? 0, icon: CalendarDays, sub: 'appointments' },
          { label: 'Total Jobs', value: totalJobs ?? 0, icon: CheckCircle, sub: 'completed' },
          { label: 'Rating Given', value: '5.0â˜…', icon: Star, sub: 'average' },
          { label: 'Member Since', value: format(new Date(profile?.created_at ?? Date.now()), 'MMM yyyy'), icon: DollarSign, sub: 'account age' },
        ].map(m => (
          <div key={m.label} className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <m.icon size={16} className="text-gold" />
              <span className="text-xs font-semibold text-[--gray-300] uppercase tracking-wider">{m.label}</span>
            </div>
            <div className="font-display text-2xl text-navy">{m.value}</div>
            <div className="text-xs text-[--gray-300] mt-0.5">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Upcoming appointments */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy">Upcoming Appointments</h2>
          <Link href="/dashboard/appointments" className="text-sm text-gold hover:underline">
            View all â†’
          </Link>
        </div>

        {upcoming?.length === 0 ? (
          <div className="card p-8 text-center text-[--gray-300]">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-40" />
            <p>No upcoming appointments.</p>
            <Link href="/book" className="btn-primary mt-4 inline-flex">Book Your First Service</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming?.map(apt => (
              <div key={apt.id} className="card p-4 flex items-center gap-4 hover:border-gold transition-colors">
                <div className="bg-navy text-white rounded-xl px-3 py-2 text-center flex-shrink-0 min-w-[52px]">
                  <div className="font-display text-xl leading-none">{format(new Date(apt.scheduled_at), 'd')}</div>
                  <div className="text-xs uppercase opacity-70">{format(new Date(apt.scheduled_at), 'MMM')}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-navy text-sm truncate">
                    {(apt.service as any)?.name}
                  </p>
                  <p className="text-xs text-[--gray-500]">
                    {format(new Date(apt.scheduled_at), 'EEEE')} at {format(new Date(apt.scheduled_at), 'h:mm a')}
                  </p>
                </div>
                <span className={`status-badge ${getStatusColor(apt.status)}`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent notifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-navy">Recent Notifications</h2>
          <Link href="/dashboard/notifications" className="text-sm text-gold hover:underline">
            View all â†’
          </Link>
        </div>
        <div className="card divide-y divide-[--gray-100]">
          {notifications?.length === 0 && (
            <p className="p-6 text-sm text-center text-[--gray-300]">No notifications yet.</p>
          )}
          {notifications?.map(n => (
            <div key={n.id} className="p-4 flex gap-3 items-start">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.is_read ? 'bg-[--gray-200]' : 'bg-gold'}`} />
              <div>
                <p className="text-sm font-medium text-navy">{n.title}</p>
                {n.body && <p className="text-xs text-[--gray-500] mt-0.5">{n.body}</p>}
                <p className="text-xs text-[--gray-300] mt-1">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
