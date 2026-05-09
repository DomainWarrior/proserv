import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Worker Management' }

export default async function AdminWorkersPage() {
  const supabase = createClient()

  const { data: workers } = await supabase
    .from('workers')
    .select('*, profile:profiles(*)')
    .order('rating', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy">Workers</h1>
          <p className="text-[--gray-500] text-sm mt-1">{workers?.length ?? 0} team members</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {}}
        >
          + Add Worker
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {workers?.map(w => {
          const profile = w.profile as any
          return (
            <div key={w.id} className="card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-navy flex items-center justify-center text-gold font-bold font-display text-lg flex-shrink-0">
                  {getInitials(profile?.full_name ?? 'W')}
                </div>
                <div>
                  <p className="font-semibold text-navy">{profile?.full_name}</p>
                  <p className="text-xs text-[--gray-300] capitalize">
                    {w.specialties?.join(', ').replace(/_/g, ' ')}
                  </p>
                </div>
                <div className={`ml-auto w-2 h-2 rounded-full ${w.is_available ? 'bg-green-500' : 'bg-gray-300'}`} title={w.is_available ? 'Available' : 'Unavailable'} />
              </div>

              <div className="flex items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Star size={13} className="text-gold fill-gold" />
                  <span className="font-semibold">{Number(w.rating).toFixed(2)}</span>
                </div>
                <span className="text-[--gray-300]">Â·</span>
                <span className="text-[--gray-500]">{w.jobs_completed} jobs</span>
              </div>

              {w.bio && <p className="text-xs text-[--gray-500] mb-4 line-clamp-2">{w.bio}</p>}

              <div className="flex gap-2">
                <button className="btn-ghost text-xs border border-[--gray-200] rounded-lg flex-1 justify-center py-1.5">
                  View Schedule
                </button>
                <button className="btn-ghost text-xs border border-[--gray-200] rounded-lg px-3 py-1.5">
                  Edit
                </button>
              </div>
            </div>
          )
        })}

        {(!workers || workers.length === 0) && (
          <div className="col-span-3 card p-12 text-center text-[--gray-300]">
            <p>No workers added yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
