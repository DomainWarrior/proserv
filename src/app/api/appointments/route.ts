import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCalendarEvent } from '@/lib/google/calendar'
import { sendAppointmentConfirmed } from '@/lib/twilio'

/** GET /api/appointments — list appointments for current user */
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit  = parseInt(searchParams.get('limit') ?? '20')

  let query = supabase
    .from('appointments')
    .select(`
      *,
      service:services(*),
      worker:profiles!appointments_worker_id_fkey(id, full_name, phone, avatar_url)
    `)
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  // Role-based filtering
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'customer') {
    query = query.eq('customer_id', user.id)
  } else if (profile?.role === 'worker') {
    query = query.eq('worker_id', user.id)
  }

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

/** POST /api/appointments — create a new appointment */
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { service_id, package_id, scheduled_at, address, city, state, zip, notes } = body

  // Get service details for price
  const { data: service } = await supabase
    .from('services')
    .select('*, packages:service_packages(*)')
    .eq('id', service_id)
    .single()

  const pkg = service?.packages?.find((p: any) => p.id === package_id)
  const price = pkg?.price ?? service?.base_price

  // Create appointment
  const { data: apt, error } = await supabase
    .from('appointments')
    .insert({
      customer_id: user.id,
      service_id,
      package_id: package_id || null,
      status: 'pending',
      scheduled_at,
      duration_hours: service?.duration_hours ?? 2,
      address,
      city,
      state,
      zip,
      notes: notes || null,
      price,
      payment_status: 'pending',
    })
    .select('*, service:services(*)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Create notification
  await supabase.from('notifications').insert({
    user_id: user.id,
    type: 'appointment_confirmed',
    title: 'Appointment requested',
    body: `Your ${service?.name} appointment has been submitted and is pending confirmation.`,
    data: { appointment_id: apt.id },
  })

  // Attempt Google Calendar sync (non-blocking)
  try {
    const eventId = await createCalendarEvent({
      userId: user.id,
      appointmentId: apt.id,
      service: service?.name ?? 'Service',
      scheduledAt: new Date(scheduled_at),
      durationHours: service?.duration_hours ?? 2,
      address: `${address}, ${city}, ${state} ${zip}`,
      notes,
    })
    if (eventId) {
      await supabase.from('appointments').update({ google_event_id: eventId }).eq('id', apt.id)
    }
  } catch { /* Google Calendar not connected — skip */ }

  // SMS confirmation (non-blocking)
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, full_name, sms_notifications')
      .eq('id', user.id)
      .single()

    if (profile?.phone && profile.sms_notifications) {
      await sendAppointmentConfirmed({
        to: profile.phone,
        customerName: profile.full_name ?? 'Valued Customer',
        service: service?.name ?? 'Service',
        scheduledAt: new Date(scheduled_at),
      })
    }
  } catch { /* SMS failed — skip */ }

  return NextResponse.json({ data: apt }, { status: 201 })
}
