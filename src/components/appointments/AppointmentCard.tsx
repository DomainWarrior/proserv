'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Calendar, Clock, User, MapPin, RefreshCw, X } from 'lucide-react'
import { getStatusColor, formatCurrency } from '@/lib/utils'
import type { Appointment } from '@/types'

interface Props {
  appointment: Appointment
  isPast?: boolean
}

export function AppointmentCard({ appointment: apt, isPast = false }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')

  const update = async (payload: Record<string, unknown>) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${apt.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Appointment updated')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const cancel = async () => {
    if (!confirm('Cancel this appointment?')) return
    await update({ status: 'cancelled', cancellation_reason: 'Cancelled by customer' })
  }

  const reschedule = async () => {
    if (!newDate || !newTime) { toast.error('Pick a new date and time'); return }
    const scheduled_at = new Date(`${newDate}T${newTime}:00`).toISOString()
    await update({ status: 'rescheduled', scheduled_at })
    setShowReschedule(false)
  }

  const service = (apt as any).service
  const worker  = (apt as any).worker

  return (
    <div className="card p-5">
      <div className="flex items-start gap-4">
        {/* Date block */}
        <div
          className="rounded-xl px-3 py-2 text-center flex-shrink-0 min-w-[58px]"
          style={{ background: isPast ? '#b8b4ad' : '#0a1628' }}
        >
          <div className="font-display text-2xl text-white leading-none">
            {format(new Date(apt.scheduled_at), 'd')}
          </div>
          <div className="text-xs text-white/70 uppercase tracking-wider">
            {format(new Date(apt.scheduled_at), 'MMM')}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
            <div>
              <h3 className="font-semibold text-navy-DEFAULT">{service?.name}</h3>
              <div className="flex flex-wrap gap-3 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-[--gray-500]">
                  <Clock size={12} /> {format(new Date(apt.scheduled_at), 'h:mm a')}
                  {service?.duration_hours && ` — ${format(new Date(new Date(apt.scheduled_at).getTime() + service.duration_hours * 3600000), 'h:mm a')}`}
                </span>
                {worker?.full_name && (
                  <span className="flex items-center gap-1 text-xs text-[--gray-500]">
                    <User size={12} /> {worker.full_name}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-[--gray-500]">
                  <MapPin size={12} /> {apt.city}, {apt.state}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`status-badge ${getStatusColor(apt.status)}`}>
                {apt.status}
              </span>
              {apt.price && (
                <span className="text-sm font-semibold text-navy-DEFAULT">
                  {formatCurrency(apt.price)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {!isPast && !['cancelled', 'completed'].includes(apt.status) && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowReschedule(!showReschedule)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[--gray-200] rounded-lg hover:bg-[--off-white] transition-colors"
              >
                <RefreshCw size={12} /> Reschedule
              </button>
              <button
                onClick={cancel}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          )}

          {isPast && (
            <div className="flex gap-2 mt-3">
              <a href="/book" className="text-xs px-3 py-1.5 border border-[--gray-200] rounded-lg hover:bg-[--off-white] transition-colors">
                Book Again
              </a>
            </div>
          )}

          {/* Reschedule inline form */}
          {showReschedule && (
            <div className="mt-3 p-3 bg-[--off-white] rounded-xl flex flex-wrap gap-3 items-end">
              <div>
                <label className="label text-[10px]">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setNewDate(e.target.value)}
                  className="input text-xs py-1.5"
                />
              </div>
              <div>
                <label className="label text-[10px]">New Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="input text-xs py-1.5"
                />
              </div>
              <button
                onClick={reschedule}
                disabled={loading}
                className="btn-navy text-xs py-1.5 px-4"
              >
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
