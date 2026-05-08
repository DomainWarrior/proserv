'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, momentLocalizer, Event } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { format } from 'date-fns'
import { Cloud, Sun, Wind, Droplets } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, getStatusColor } from '@/lib/utils'
import type { Appointment, WeatherData } from '@/types'

const localizer = momentLocalizer(moment)

interface CalEvent extends Event {
  resource: Appointment
}

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [events, setEvents] = useState<CalEvent[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  // Fetch appointments
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('appointments')
        .select('*, service:services(*), worker:profiles!appointments_worker_id_fkey(full_name)')
        .eq('customer_id', user.id)
        .neq('status', 'cancelled')
        .order('scheduled_at')

      setAppointments(data ?? [])
      setEvents(
        (data ?? []).map(apt => ({
          title: (apt.service as any)?.name ?? 'Appointment',
          start: new Date(apt.scheduled_at),
          end:   new Date(new Date(apt.scheduled_at).getTime() + (apt.duration_hours ?? 2) * 3600000),
          resource: apt,
        }))
      )
      setLoading(false)
    })
  }, [])

  // Fetch weather via geolocation
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(
          `/api/weather?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`
        )
        const { data } = await res.json()
        setWeather(data)
      } catch { /* ignore */ }
    })
  }, [])

  const eventStyleGetter = (event: CalEvent) => {
    const status = event.resource.status
    const colorMap: Record<string, string> = {
      confirmed:   '#1a6b3c',
      pending:     '#c9a84c',
      in_progress: '#1a5276',
      completed:   '#7a7670',
    }
    return {
      style: {
        backgroundColor: colorMap[status] ?? '#0a1628',
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        padding: '2px 6px',
      },
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-navy-DEFAULT">Calendar</h1>
          <p className="text-[--gray-500] text-sm mt-1">Your appointment schedule</p>
        </div>

        {/* Weather widget */}
        {weather && (
          <div className={cn(
            'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium border',
            weather.isRainy  ? 'bg-blue-50 border-blue-200 text-blue-800' :
            weather.isSnowy  ? 'bg-slate-50 border-slate-200 text-slate-700' :
            weather.isSunny  ? 'bg-amber-50 border-amber-200 text-amber-800' :
                               'bg-gray-50 border-gray-200 text-gray-700'
          )}>
            <span className="text-2xl">{weather.icon}</span>
            <div>
              <div className="font-semibold">{weather.temperature}°F — {weather.description}</div>
              <div className="flex gap-3 text-xs opacity-70 mt-0.5">
                <span className="flex items-center gap-1"><Wind size={11} /> {weather.windSpeed} mph</span>
                <span className="flex items-center gap-1"><Droplets size={11} /> {weather.humidity}%</span>
              </div>
            </div>
            {weather.isRainy && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                ⚠️ Outdoor services may be affected
              </span>
            )}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="card p-1 mb-6" style={{ height: 560 }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-[--gray-300]">
            Loading calendar...
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={e => setSelectedApt(e.resource)}
            popup
          />
        )}
      </div>

      {/* Selected appointment detail */}
      {selectedApt && (
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="font-semibold text-navy-DEFAULT">Appointment Details</h3>
            <button onClick={() => setSelectedApt(null)} className="text-[--gray-300] hover:text-navy-DEFAULT">✕</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-semibold text-[--gray-300] uppercase tracking-wider mb-1">Service</p>
              <p className="font-medium">{(selectedApt.service as any)?.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[--gray-300] uppercase tracking-wider mb-1">Status</p>
              <span className={`status-badge ${getStatusColor(selectedApt.status)}`}>{selectedApt.status}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-[--gray-300] uppercase tracking-wider mb-1">Date & Time</p>
              <p className="font-medium">{format(new Date(selectedApt.scheduled_at), 'MMMM d, yyyy • h:mm a')}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-[--gray-300] uppercase tracking-wider mb-1">Technician</p>
              <p className="font-medium">{(selectedApt.worker as any)?.full_name ?? 'TBD'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold text-[--gray-300] uppercase tracking-wider mb-1">Address</p>
              <p className="font-medium">{selectedApt.address}, {selectedApt.city}, {selectedApt.state}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
