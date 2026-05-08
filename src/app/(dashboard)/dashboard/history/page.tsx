import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Service History' }

export default async function HistoryPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, service:services(name), worker:profiles!appointments_worker_id_fkey(full_name)')
    .eq('customer_id', user!.id)
    .in('status', ['completed', 'cancelled'])
    .order('scheduled_at', { ascending: false })

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  const totalSpent = invoices?.reduce((s, i) => s + Number(i.amount), 0) ?? 0

  return (
    <div>
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-navy-DEFAULT">Service History</h1>
          <p className="text-[--gray-500] text-sm mt-1">
            {appointments?.length ?? 0} past services · {formatCurrency(totalSpent)} total spent
          </p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {(!appointments || appointments.length === 0) ? (
          <div className="p-12 text-center text-[--gray-300]">
            <p className="mb-4">No service history yet.</p>
            <Link href="/book" className="btn-primary inline-flex">Book Your First Service</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[--gray-100]">
                  {['Date', 'Service', 'Technician', 'Status', 'Amount', 'Rating'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-[--gray-300]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[--gray-100]">
                {appointments.map(apt => (
                  <tr key={apt.id} className="hover:bg-[--off-white] transition-colors">
                    <td className="px-5 py-4 text-[--gray-700] whitespace-nowrap">
                      {format(new Date(apt.scheduled_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4 font-medium text-navy-DEFAULT">
                      {(apt.service as any)?.name}
                    </td>
                    <td className="px-5 py-4 text-[--gray-500]">
                      {(apt.worker as any)?.full_name ?? '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`status-badge ${getStatusColor(apt.status)}`}>{apt.status}</span>
                    </td>
                    <td className="px-5 py-4 font-medium text-navy-DEFAULT">
                      {apt.price ? formatCurrency(apt.price) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {apt.status === 'completed' ? (
                        <button className="text-xs text-gold-DEFAULT hover:underline">Leave Review</button>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
