import { NextRequest, NextResponse } from 'next/server'
import { handleCallback } from '@/lib/google/calendar'

/** GET /api/calendar/callback — handle Google OAuth callback */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code   = searchParams.get('code')
  const userId = searchParams.get('state')

  if (!code || !userId) {
    return NextResponse.redirect(new URL('/dashboard?error=calendar_auth_failed', request.url))
  }

  try {
    await handleCallback(code, userId)
    return NextResponse.redirect(new URL('/dashboard?success=calendar_connected', request.url))
  } catch (err) {
    console.error('[Google Calendar callback]', err)
    return NextResponse.redirect(new URL('/dashboard?error=calendar_auth_failed', request.url))
  }
}
