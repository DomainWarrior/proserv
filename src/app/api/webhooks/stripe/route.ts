import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import { sendReviewRequest } from '@/lib/twilio'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const intent = event.data.object as Stripe.PaymentIntent
      const appointmentId = intent.metadata.appointment_id
      if (!appointmentId) break

      // Mark appointment as paid and confirmed
      const { data: apt } = await supabase
        .from('appointments')
        .update({ payment_status: 'paid', status: 'confirmed' })
        .eq('id', appointmentId)
        .select('*, service:services(name), customer:profiles(full_name, phone, sms_notifications)')
        .single()

      // Create invoice record
      await supabase.from('invoices').insert({
        appointment_id: appointmentId,
        customer_id: apt?.customer_id,
        stripe_payment_intent: intent.id,
        amount: intent.amount / 100,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })

      // Notify customer
      await supabase.from('notifications').insert({
        user_id: apt?.customer_id,
        type: 'payment_received',
        title: 'Payment received',
        body: `Payment of $${(intent.amount / 100).toFixed(2)} for your ${apt?.service?.name} appointment has been processed.`,
        data: { appointment_id: appointmentId, amount: intent.amount / 100 },
      })
      break
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent
      const appointmentId = intent.metadata.appointment_id
      if (appointmentId) {
        await supabase
          .from('appointments')
          .update({ payment_status: 'failed' })
          .eq('id', appointmentId)
      }
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      if (charge.payment_intent) {
        await supabase
          .from('invoices')
          .update({ status: 'refunded' })
          .eq('stripe_payment_intent', charge.payment_intent as string)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
