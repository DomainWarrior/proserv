import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUrl, handleCallback } from '@/lib/google/calendar'

/** GET /api/calendar/connect — start Google OAuth flow */
export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const url = getAuthUrl(user.id)
  return NextResponse.redirect(url)
}
