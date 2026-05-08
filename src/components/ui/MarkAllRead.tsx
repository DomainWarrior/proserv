'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

export function MarkAllRead({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const markAll = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) toast.error('Failed to mark as read')
    else { toast.success('All marked as read'); router.refresh() }
  }

  return (
    <button onClick={markAll} className="btn-ghost border border-[--gray-200] text-sm">
      Mark all read
    </button>
  )
}
