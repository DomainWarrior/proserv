import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google/calendar'
import { sendAppointmentCancelled } from '@/lib/twilio'

interface Params { params: { id: string } }

/** PATCH /api/appointments/[id] — update status / reschedule */
export async function PATCH(request: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { status, scheduled_at, worker_id, internal_notes, cancellation_reason } = body

  // Fetch current appointment
  const { data: apt } = await supabase
    .from('appointments')
    .select('*, service:services(name, duration_hours)')
    .eq('id', params.id)
    .single()

  if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build update payload
  const updates: Record<string, unknown> = {}
  if (status)             updates.status = status
  if (scheduled_at)       updates.scheduled_at = scheduled_at
  if (worker_id !== undefined) updates.worker_id = worker_id
  if (internal_notes)     updates.internal_notes = internal_notes
  if (cancellation_reason) updates.cancellation_reason = cancellation_reason
  if (status === 'cancelled')  updates.cancelled_at = new Date().toISOString()
  if (status === 'completed')  updates.completed_at = new Date().toISOString()
  if (status === 'rescheduled') updates.status = 'rescheduled'

  const { data: updated, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update Google Calendar event
  if (apt.google_event_id) {
    try {
      if (status === 'cancelled') {
        await deleteCalendarEvent(apt.customer_id, apt.google_event_id)
      } else if (scheduled_at) {
        await updateCalendarEvent({
          userId: apt.customer_id,
          eventId: apt.google_event_id,
          scheduledAt: new Date(scheduled_at),
          durationHours: apt.service?.duration_hours ?? 2,
        })
      }
    } catch { /* Calendar sync failed — skip */ }
  }

  // Notify customer of cancellation via SMS
  if (status === 'cancelled') {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, full_name, sms_notifications')
        .eq('id', apt.customer_id)
        .single()

      if (profile?.phone && profile.sms_notifications) {
        await sendAppointmentCancelled({
          to: profile.phone,
          customerName: profile.full_name ?? 'Valued Customer',
          service: apt.service?.name ?? 'Service',
        })
      }
    } catch { /* SMS failed */ }

    // Create notification
    await supabase.from('notifications').insert({
      user_id: apt.customer_id,
      type: 'appointment_cancelled',
      title: 'Appointment cancelled',
      body: `Your ${apt.service?.name} appointment has been cancelled.`,
      data: { appointment_id: apt.id },
    })
  }

  // Notify customer when confirmed by admin
  if (status === 'confirmed') {
    await supabase.from('notifications').insert({
      user_id: apt.customer_id,
      type: 'appointment_confirmed',
      title: 'Appointment confirmed!',
      body: `Your ${apt.service?.name} appointment is confirmed. We\'ll see you soon!`,
      data: { appointment_id: apt.id },
    })
  }

  return NextResponse.json({ data: updated })
}

/** DELETE /api/appointments/[id] — cancel (soft delete) */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', params.id)
    .eq('customer_id', user.id) // customers can only cancel their own

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Appointment cancelled.' })
}
