'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { AppointmentStatus } from '@/types'

interface Props {
  appointmentId: string
  currentStatus: AppointmentStatus
  workers: Array<{ id: string; profile: any }>
}

export function AppointmentActions({ appointmentId, currentStatus, workers }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const update = async (payload: Record<string, unknown>) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
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

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {currentStatus === 'pending' && (
        <button
          onClick={() => update({ status: 'confirmed' })}
          disabled={loading}
          className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 transition-colors"
        >
          Confirm
        </button>
      )}

      {currentStatus !== 'cancelled' && currentStatus !== 'completed' && (
        <button
          onClick={() => update({ status: 'cancelled', cancellation_reason: 'Cancelled by admin' })}
          disabled={loading}
          className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded hover:bg-red-100 transition-colors"
        >
          Cancel
        </button>
      )}

      {currentStatus === 'in_progress' && (
        <button
          onClick={() => update({ status: 'completed' })}
          disabled={loading}
          className="text-xs px-2 py-1 bg-navy-DEFAULT text-white rounded hover:bg-navy-mid transition-colors"
        >
          Complete
        </button>
      )}

      {/* Worker assignment dropdown */}
      <select
        onChange={e => e.target.value && update({ worker_id: e.target.value })}
        disabled={loading}
        className="text-xs border border-[--gray-200] rounded px-1.5 py-1 bg-white text-navy-DEFAULT max-w-[120px]"
        defaultValue=""
      >
        <option value="" disabled>Assign…</option>
        {workers.map(w => (
          <option key={w.id} value={w.id}>
            {w.profile?.full_name ?? 'Unknown'}
          </option>
        ))}
      </select>
    </div>
  )
}
