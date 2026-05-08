import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const monthStart = startOfMonth(now).toISOString()
  const monthEnd   = endOfMonth(now).toISOString()
  const lastMonthStart = startOfMonth(subMonths(now, 1)).toISOString()
  const lastMonthEnd   = endOfMonth(subMonths(now, 1)).toISOString()

  // Revenue this month
  const [{ data: invoicesThis }, { data: invoicesLast }] = await Promise.all([
    supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'paid')
      .gte('paid_at', monthStart)
      .lte('paid_at', monthEnd),
    supabase
      .from('invoices')
      .select('amount')
      .eq('status', 'paid')
      .gte('paid_at', lastMonthStart)
      .lte('paid_at', lastMonthEnd),
  ])

  const revenueThis = (invoicesThis ?? []).reduce((s: number, i: any) => s + Number(i.amount), 0)
  const revenueLast = (invoicesLast ?? []).reduce((s: number, i: any) => s + Number(i.amount), 0)

  // Jobs this month
  const { count: jobsThis } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .in('status', ['completed', 'confirmed', 'in_progress'])
    .gte('scheduled_at', monthStart)

  const { count: jobsLast } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .in('status', ['completed', 'confirmed', 'in_progress'])
    .gte('scheduled_at', lastMonthStart)
    .lte('scheduled_at', lastMonthEnd)

  // Avg rating
  const { data: ratings } = await supabase.from('reviews').select('rating')
  const avgRating = ratings?.length
    ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / ratings.length
    : 5.0

  // Active customers
  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'customer')

  // Active workers
  const { count: totalWorkers } = await supabase
    .from('workers')
    .select('id', { count: 'exact', head: true })
    .eq('is_available', true)

  // Revenue by service
  const { data: revenueByService } = await supabase
    .from('invoices')
    .select('amount, appointment:appointments(service:services(name))')
    .eq('status', 'paid')
    .gte('paid_at', monthStart)

  const byService: Record<string, number> = {}
  for (const inv of (revenueByService ?? [])) {
    const name = (inv as any).appointment?.service?.name ?? 'Other'
    byService[name] = (byService[name] ?? 0) + Number((inv as any).amount)
  }

  return NextResponse.json({
    data: {
      revenue_month: revenueThis,
      revenue_change: revenueLast ? ((revenueThis - revenueLast) / revenueLast) * 100 : 0,
      jobs_month: jobsThis ?? 0,
      jobs_change: (jobsThis ?? 0) - (jobsLast ?? 0),
      avg_rating: Math.round(avgRating * 100) / 100,
      active_customers: totalCustomers ?? 0,
      active_workers: totalWorkers ?? 0,
      revenue_by_service: byService,
    },
  })
}
