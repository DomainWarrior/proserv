import twilio from 'twilio'
import { format } from 'date-fns'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM = process.env.TWILIO_PHONE_NUMBER!

export interface SmsPayload {
  to: string
  body: string
}

export async function sendSms({ to, body }: SmsPayload) {
  if (!to || !process.env.TWILIO_ACCOUNT_SID) {
    console.warn('[Twilio] SMS skipped — no number or credentials.')
    return null
  }
  return client.messages.create({ from: FROM, to, body })
}

// ─── Pre-built message templates ────────────────────────────────────────────

export async function sendAppointmentConfirmed(opts: {
  to: string
  customerName: string
  service: string
  scheduledAt: Date
  workerName?: string
}) {
  const date = format(opts.scheduledAt, 'EEEE, MMMM d')
  const time = format(opts.scheduledAt, 'h:mm a')
  return sendSms({
    to: opts.to,
    body:
      `Hi ${opts.customerName}! ✅ Your ${opts.service} appointment is confirmed for ${date} at ${time}` +
      (opts.workerName ? ` with ${opts.workerName}` : '') +
      `. Questions? Call (555) 123-4567. — ProServ`,
  })
}

export async function sendAppointmentReminder24h(opts: {
  to: string
  customerName: string
  service: string
  scheduledAt: Date
  workerName?: string
}) {
  const time = format(opts.scheduledAt, 'h:mm a')
  return sendSms({
    to: opts.to,
    body:
      `Reminder: Your ${opts.service} is tomorrow at ${time}` +
      (opts.workerName ? ` with ${opts.workerName}` : '') +
      `. To reschedule, visit your account portal or call (555) 123-4567. — ProServ`,
  })
}

export async function sendAppointmentReminder2h(opts: {
  to: string
  customerName: string
  service: string
  scheduledAt: Date
}) {
  const time = format(opts.scheduledAt, 'h:mm a')
  return sendSms({
    to: opts.to,
    body: `Your ProServ ${opts.service} is coming up at ${time} today! Our team is on the way. — ProServ`,
  })
}

export async function sendAppointmentCancelled(opts: {
  to: string
  customerName: string
  service: string
}) {
  return sendSms({
    to: opts.to,
    body: `Hi ${opts.customerName}, your ${opts.service} appointment has been cancelled. To rebook, visit proserv.com or call (555) 123-4567. — ProServ`,
  })
}

export async function sendReviewRequest(opts: {
  to: string
  customerName: string
  service: string
  reviewLink: string
}) {
  return sendSms({
    to: opts.to,
    body:
      `Thanks for choosing ProServ, ${opts.customerName}! How was your ${opts.service}? ` +
      `Leave a quick review: ${opts.reviewLink} — it means the world to our team!`,
  })
}
