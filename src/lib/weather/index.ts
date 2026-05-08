export interface WeatherData {
  temperature: number      // Fahrenheit
  weatherCode: number
  description: string
  icon: string             // emoji
  isRainy: boolean
  isSunny: boolean
  isSnowy: boolean
  windSpeed: number
  humidity: number
}

/** WMO weather interpretation codes → human label + emoji */
function interpretWeatherCode(code: number): { description: string; icon: string } {
  if (code === 0)               return { description: 'Clear sky',           icon: '☀️' }
  if (code <= 2)                return { description: 'Partly cloudy',       icon: '⛅' }
  if (code === 3)               return { description: 'Overcast',            icon: '☁️' }
  if (code <= 49)               return { description: 'Foggy',               icon: '🌫️' }
  if (code <= 57)               return { description: 'Drizzle',             icon: '🌦️' }
  if (code <= 67)               return { description: 'Rain',                icon: '🌧️' }
  if (code <= 77)               return { description: 'Snow',                icon: '❄️' }
  if (code <= 82)               return { description: 'Rain showers',        icon: '🌧️' }
  if (code <= 86)               return { description: 'Snow showers',        icon: '🌨️' }
  if (code <= 99)               return { description: 'Thunderstorm',        icon: '⛈️' }
  return                               { description: 'Unknown',             icon: '🌤️' }
}

/** Fetch current weather from Open-Meteo API (free, no API key) */
export async function fetchWeather(
  lat: number,
  lng: number
): Promise<WeatherData | null> {
  try {
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude',     String(lat))
    url.searchParams.set('longitude',    String(lng))
    url.searchParams.set('current',      'temperature_2m,weathercode,windspeed_10m,relativehumidity_2m')
    url.searchParams.set('temperature_unit', 'fahrenheit')
    url.searchParams.set('windspeed_unit',   'mph')
    url.searchParams.set('forecast_days',    '1')

    const res  = await fetch(url.toString(), { next: { revalidate: 1800 } })
    const data = await res.json()
    const c    = data.current

    const { description, icon } = interpretWeatherCode(c.weathercode)

    return {
      temperature: Math.round(c.temperature_2m),
      weatherCode: c.weathercode,
      description,
      icon,
      isRainy:  c.weathercode >= 51 && c.weathercode <= 82,
      isSunny:  c.weathercode <= 2,
      isSnowy:  c.weathercode >= 71 && c.weathercode <= 77,
      windSpeed: Math.round(c.windspeed_10m),
      humidity:  Math.round(c.relativehumidity_2m),
    }
  } catch (err) {
    console.error('[Weather] Failed to fetch:', err)
    return null
  }
}

/** Server-side weather fetch by zip code using Open-Meteo geocoding */
export async function fetchWeatherByZip(zip: string): Promise<WeatherData | null> {
  try {
    // Geocode the zip
    const geoRes  = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${zip}&count=1&language=en&format=json`
    )
    const geoData = await geoRes.json()
    const loc     = geoData.results?.[0]
    if (!loc) return null

    return fetchWeather(loc.latitude, loc.longitude)
  } catch {
    return null
  }
}
