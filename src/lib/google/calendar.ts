import { google } from 'googleapis'
import { format } from 'date-fns'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
]

/** Generate the OAuth URL to redirect the user to */
export function getAuthUrl(userId: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: userId,
    prompt: 'consent',
  })
}

/** Exchange auth code for tokens and save to profile */
export async function handleCallback(code: string, userId: string) {
  const { tokens } = await oauth2Client.getToken(code)
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = createAdminClient()

  await supabase
    .from('profiles')
    .update({ google_calendar_token: tokens })
    .eq('id', userId)

  return tokens
}

/** Get an authenticated calendar client for a user */
async function getCalendarForUser(userId: string) {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('google_calendar_token')
    .eq('id', userId)
    .single()

  if (!profile?.google_calendar_token) {
    throw new Error('No Google Calendar token for user ' + userId)
  }

  const userOauth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  userOauth.setCredentials(profile.google_calendar_token as any)

  // Auto-refresh if expired
  userOauth.on('tokens', async (tokens) => {
    await supabase
      .from('profiles')
      .update({ google_calendar_token: tokens })
      .eq('id', userId)
  })

  return google.calendar({ version: 'v3', auth: userOauth })
}

/** Create a calendar event for a booked appointment */
export async function createCalendarEvent(opts: {
  userId: string
  appointmentId: string
  service: string
  scheduledAt: Date
  durationHours: number
  address: string
  workerName?: string
  notes?: string
}) {
  const cal = await getCalendarForUser(opts.userId)

  const endTime = new Date(opts.scheduledAt)
  endTime.setHours(endTime.getHours() + opts.durationHours)

  const event = await cal.events.insert({
    calendarId: 'primary',
    requestBody: {
      summary: `ProServ: ${opts.service}`,
      description:
        `Service: ${opts.service}\n` +
        (opts.workerName ? `Technician: ${opts.workerName}\n` : '') +
        (opts.notes ? `Notes: ${opts.notes}\n` : '') +
        `Appointment ID: ${opts.appointmentId}`,
      location: opts.address,
      start: { dateTime: opts.scheduledAt.toISOString(), timeZone: 'America/New_York' },
      end:   { dateTime: endTime.toISOString(),           timeZone: 'America/New_York' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email',  minutes: 24 * 60 },
          { method: 'popup',  minutes: 120 },
        ],
      },
      colorId: '5', // Banana yellow
    },
  })

  return event.data.id
}

/** Update an existing calendar event (reschedule) */
export async function updateCalendarEvent(opts: {
  userId: string
  eventId: string
  scheduledAt: Date
  durationHours: number
}) {
  const cal = await getCalendarForUser(opts.userId)
  const endTime = new Date(opts.scheduledAt)
  endTime.setHours(endTime.getHours() + opts.durationHours)

  return cal.events.patch({
    calendarId: 'primary',
    eventId: opts.eventId,
    requestBody: {
      start: { dateTime: opts.scheduledAt.toISOString(), timeZone: 'America/New_York' },
      end:   { dateTime: endTime.toISOString(),           timeZone: 'America/New_York' },
    },
  })
}

/** Cancel a calendar event */
export async function deleteCalendarEvent(userId: string, eventId: string) {
  const cal = await getCalendarForUser(userId)
  return cal.events.delete({ calendarId: 'primary', eventId })
}
