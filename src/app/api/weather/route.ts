import { NextRequest, NextResponse } from 'next/server'
import { fetchWeather, fetchWeatherByZip } from '@/lib/weather'

/** GET /api/weather?lat=X&lng=Y or ?zip=XXXXX */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const zip = searchParams.get('zip')

  let weather = null

  if (lat && lng) {
    weather = await fetchWeather(parseFloat(lat), parseFloat(lng))
  } else if (zip) {
    weather = await fetchWeatherByZip(zip)
  } else {
    return NextResponse.json({ error: 'Provide lat/lng or zip' }, { status: 400 })
  }

  if (!weather) {
    return NextResponse.json({ error: 'Weather unavailable' }, { status: 503 })
  }

  return NextResponse.json(
    { data: weather },
    { headers: { 'Cache-Control': 's-maxage=1800, stale-while-revalidate' } }
  )
}
