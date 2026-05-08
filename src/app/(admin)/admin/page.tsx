import { createClient } from '@/lib/supabase/server'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { formatCurrency } from '@/lib/utils'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { PendingActions } from '@/components/admin/PendingActions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin Analytics' }

export default async function AdminPage() {
  const supabase = createClient()

  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()

  const [
    { data: invoicesMonth },
    { data: appointments },
    { data: reviews },
    { count: customers },
    { count: workers },
    { count: pendingApts },
  ] = await Promise.all([
    supabase.from('invoices').select('amount').eq('status', 'paid').gte('paid_at', monthStart),
    supabase.from('appointments').select('id, status, scheduled_at').gte('scheduled_at', monthStart),
    supabase.from('reviews').select('rating'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    supabase.from('workers').select('id', { count: 'exact', head: true }).eq('is_available', true),
    supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const revenue  = (invoicesMonth ?? []).reduce((s, i) => s + Number(i.amount), 0)
  const jobCount = (appointments ?? []).length
  const avgRating = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 5.0

  const metrics = [
    { label: 'Monthly Revenue',  value: formatCurrency(revenue),         sub: `${format(now, 'MMMM yyyy')}` },
    { label: 'Jobs This Month',  value: String(jobCount),                sub: 'total appointments' },
    { label: 'Avg Rating',       value: `${avgRating.toFixed(2)} ★`,     sub: 'from all reviews' },
    { label: 'Total Customers',  value: String(customers ?? 0),          sub: 'registered accounts' },
    { label: 'Active Workers',   value: String(workers ?? 0),            sub: 'available now' },
    { label: 'Pending Approvals',value: String(pendingApts ?? 0),        sub: 'need review' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy-DEFAULT">Analytics</h1>
          <p className="text-[--gray-500] text-sm mt-1">
            Business overview for {format(now, 'MMMM yyyy')}
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map(m => (
          <div key={m.label} className="card p-5">
            <p className="text-xs font-semibold text-[--gray-300] uppercase tracking-wider mb-2">
              {m.label}
            </p>
            <p className="font-display text-2xl text-navy-DEFAULT">{m.value}</p>
            <p className="text-xs text-[--gray-300] mt-1">{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <PendingActions pendingCount={pendingApts ?? 0} />
      </div>
    </div>
  )
}
