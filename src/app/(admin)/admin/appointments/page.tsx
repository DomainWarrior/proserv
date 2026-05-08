import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { getStatusColor } from '@/lib/utils'
import { AppointmentActions } from '@/components/admin/AppointmentActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Manage Appointments' }

export default async function AdminAppointmentsPage() {
  const supabase = createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(name),
      customer:profiles!appointments_customer_id_fkey(id, full_name, phone),
      worker:profiles!appointments_worker_id_fkey(id, full_name)
    `)
    .order('scheduled_at', { ascending: true })
    .limit(50)

  const { data: workers } = await supabase
    .from('workers')
    .select('id, profile:profiles(id, full_name)')
    .eq('is_available', true)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-DEFAULT">Appointments</h1>
          <p className="text-[--gray-500] text-sm mt-1">{appointments?.length ?? 0} appointments found</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy-DEFAULT text-white">
                {['Customer', 'Service', 'Date & Time', 'Worker', 'Status', 'Price', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[--gray-100]">
              {appointments?.map(apt => (
                <tr key={apt.id} className="hover:bg-[--off-white] transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-navy-DEFAULT">{(apt.customer as any)?.full_name ?? '—'}</div>
                    <div className="text-xs text-[--gray-300]">{(apt.customer as any)?.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-[--gray-700]">{(apt.service as any)?.name}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{format(new Date(apt.scheduled_at), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-[--gray-300]">{format(new Date(apt.scheduled_at), 'h:mm a')}</div>
                  </td>
                  <td className="px-4 py-3">
                    {(apt.worker as any)?.full_name
                      ? <span className="text-navy-DEFAULT">{(apt.worker as any).full_name}</span>
                      : <span className="text-xs text-red-500 font-medium">Unassigned</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${getStatusColor(apt.status)}`}>{apt.status}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {apt.price ? `$${Number(apt.price).toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <AppointmentActions
                      appointmentId={apt.id}
                      currentStatus={apt.status}
                      workers={workers ?? []}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
