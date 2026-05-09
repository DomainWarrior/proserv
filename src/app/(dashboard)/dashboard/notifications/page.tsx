import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { Bell } from 'lucide-react'
import { MarkAllRead } from '@/components/ui/MarkAllRead'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notifications' }

const typeIcon: Record<string, string> = {
  appointment_confirmed: 'âœ…',
  appointment_reminder:  'â°',
  appointment_cancelled: 'âŒ',
  payment_received:      'ðŸ’³',
  review_request:        'â­',
  general:               'ðŸ“£',
}

export default async function NotificationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unread = notifications?.filter(n => !n.is_read).length ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy">Notifications</h1>
          <p className="text-[--gray-500] text-sm mt-1">{unread} unread</p>
        </div>
        {unread > 0 && <MarkAllRead userId={user!.id} />}
      </div>

      <div className="card divide-y divide-[--gray-100]">
        {(!notifications || notifications.length === 0) && (
          <div className="p-12 text-center text-[--gray-300]">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p>No notifications yet.</p>
          </div>
        )}

        {notifications?.map(n => (
          <div key={n.id} className={`p-5 flex gap-4 items-start transition-colors ${!n.is_read ? 'bg-gold-pale/40' : ''}`}>
            <div className="text-xl flex-shrink-0 mt-0.5">{typeIcon[n.type] ?? 'ðŸ“£'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <p className={`text-sm font-medium ${!n.is_read ? 'text-navy' : 'text-[--gray-700]'}`}>
                  {n.title}
                </p>
                {!n.is_read && (
                  <span className="w-2 h-2 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                )}
              </div>
              {n.body && <p className="text-xs text-[--gray-500] mt-0.5 leading-relaxed">{n.body}</p>}
              <p className="text-xs text-[--gray-300] mt-1.5">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
