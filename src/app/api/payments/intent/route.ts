import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, getOrCreateStripeCustomer, createAppointmentPaymentIntent } from '@/lib/stripe'

/** POST /api/payments/intent — create a payment intent */
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { appointment_id } = await request.json()

  // Fetch appointment & service
  const { data: apt } = await supabase
    .from('appointments')
    .select('*, service:services(name)')
    .eq('id', appointment_id)
    .eq('customer_id', user.id)
    .single()

  if (!apt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
  if (!apt.price) return NextResponse.json({ error: 'No price set for this appointment' }, { status: 400 })

  // Get user email for Stripe
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, stripe_customer_id')
    .eq('id', user.id)
    .single()

  // Get or create Stripe customer
  const stripeCustomerId = await getOrCreateStripeCustomer(
    user.id,
    authUser?.email ?? '',
    profile?.full_name ?? undefined
  )

  // Create payment intent
  const intent = await createAppointmentPaymentIntent({
    amount: Math.round(apt.price * 100), // convert to cents
    customerId: stripeCustomerId,
    appointmentId: apt.id,
    serviceId: apt.service_id,
    description: `ProServ: ${apt.service?.name ?? 'Service'}`,
  })

  // Save intent ID to appointment
  await supabase
    .from('appointments')
    .update({ stripe_payment_intent_id: intent.id })
    .eq('id', apt.id)

  return NextResponse.json({ clientSecret: intent.client_secret })
}
