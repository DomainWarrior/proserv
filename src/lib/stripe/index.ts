import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

/** Create or retrieve a Stripe customer for a Supabase user */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = createAdminClient()

  // Check if customer already exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    return profile.stripe_customer_id
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_user_id: userId },
  })

  // Save to profile
  await supabase
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId)

  return customer.id
}

/** Create a PaymentIntent for an appointment */
export async function createAppointmentPaymentIntent(opts: {
  amount: number          // in cents
  customerId: string      // Stripe customer ID
  appointmentId: string
  serviceId: string
  description: string
}) {
  return stripe.paymentIntents.create({
    amount: opts.amount,
    currency: 'usd',
    customer: opts.customerId,
    description: opts.description,
    metadata: {
      appointment_id: opts.appointmentId,
      service_id: opts.serviceId,
    },
    automatic_payment_methods: { enabled: true },
  })
}

/** Process a refund for a cancelled appointment */
export async function refundAppointment(paymentIntentId: string) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: 'requested_by_customer',
  })
}
