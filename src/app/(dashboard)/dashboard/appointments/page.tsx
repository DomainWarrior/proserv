import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { getStatusColor, formatCurrency } from '@/lib/utils'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Appointments' }

export default async function AppointmentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(name, duration_hours),
      worker:profiles!appointments_worker_id_fkey(id, full_name, avatar_url)
    `)
    .eq('customer_id', user!.id)
    .order('scheduled_at', { ascending: true })

  const upcoming = appointments?.filter(a => !['cancelled', 'completed'].includes(a.status)) ?? []
  const past     = appointments?.filter(a =>  ['cancelled', 'completed'].includes(a.status)) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-navy-DEFAULT">Appointments</h1>
          <p className="text-[--gray-500] text-sm mt-1">Manage all your upcoming and past bookings.</p>
        </div>
        <Link href="/book" className="btn-primary">+ New Booking</Link>
      </div>

      {/* Upcoming */}
      <div className="mb-10">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[--gray-300] mb-4">
          Upcoming ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="card p-10 text-center text-[--gray-300]">
            <p className="mb-4">No upcoming appointments.</p>
            <Link href="/book" className="btn-primary inline-flex">Book a Service</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt as any} />
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[--gray-300] mb-4">
            History ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map(apt => (
              <AppointmentCard key={apt.id} appointment={apt as any} isPast />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
