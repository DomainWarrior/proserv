import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendAppointmentReminder24h, sendAppointmentReminder2h } from '@/lib/twilio'
import { addHours, subHours, isWithinInterval } from 'date-fns'

/** POST /api/sms/reminders
 *  Called by Vercel Cron every 30 minutes.
 *  Vercel cron.json: { "crons": [{ "path": "/api/sms/reminders", "schedule": "*/30 * * * *" }] }
 */
export async function POST(request: NextRequest) {
  // Simple secret check
  const secret = request.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()

  // ─── 24-hour reminders ────────────────────────────────────────────────────
  const window24Start = addHours(now, 23)
  const window24End   = addHours(now, 25)

  const { data: apts24 } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, customer_id,
      service:services(name),
      worker:profiles!appointments_worker_id_fkey(full_name),
      customer:profiles!appointments_customer_id_fkey(full_name, phone, sms_notifications)
    `)
    .eq('status', 'confirmed')
    .eq('reminder_sent_24h', false)
    .gte('scheduled_at', window24Start.toISOString())
    .lte('scheduled_at', window24End.toISOString())

  let sent24 = 0
  for (const apt of (apts24 ?? [])) {
    const c = apt.customer as any
    if (c?.phone && c.sms_notifications) {
      try {
        await sendAppointmentReminder24h({
          to:           c.phone,
          customerName: c.full_name ?? 'Valued Customer',
          service:      (apt.service as any)?.name ?? 'Service',
          scheduledAt:  new Date(apt.scheduled_at),
          workerName:   (apt.worker as any)?.full_name,
        })
        await supabase
          .from('appointments')
          .update({ reminder_sent_24h: true })
          .eq('id', apt.id)
        sent24++
      } catch (e) {
        console.error('[SMS] 24h reminder failed', apt.id, e)
      }
    }
  }

  // ─── 2-hour reminders ─────────────────────────────────────────────────────
  const window2Start = addHours(now, 1.5)
  const window2End   = addHours(now, 2.5)

  const { data: apts2 } = await supabase
    .from('appointments')
    .select(`
      id, scheduled_at, customer_id,
      service:services(name),
      customer:profiles!appointments_customer_id_fkey(full_name, phone, sms_notifications)
    `)
    .eq('status', 'confirmed')
    .eq('reminder_sent_2h', false)
    .gte('scheduled_at', window2Start.toISOString())
    .lte('scheduled_at', window2End.toISOString())

  let sent2 = 0
  for (const apt of (apts2 ?? [])) {
    const c = apt.customer as any
    if (c?.phone && c.sms_notifications) {
      try {
        await sendAppointmentReminder2h({
          to:           c.phone,
          customerName: c.full_name ?? 'Valued Customer',
          service:      (apt.service as any)?.name ?? 'Service',
          scheduledAt:  new Date(apt.scheduled_at),
        })
        await supabase
          .from('appointments')
          .update({ reminder_sent_2h: true })
          .eq('id', apt.id)
        sent2++
      } catch (e) {
        console.error('[SMS] 2h reminder failed', apt.id, e)
      }
    }
  }

  return NextResponse.json({
    message: `Reminders sent: ${sent24} × 24h, ${sent2} × 2h`,
  })
}
