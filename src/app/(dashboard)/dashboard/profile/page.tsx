'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { User, Bell, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm()
  const { register: regPass, handleSubmit: submitPass, reset: resetPass, formState: { errors: passErrors } } = useForm()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      reset({
        full_name: data?.full_name,
        phone: data?.phone,
        address: data?.address,
        city: data?.city,
        state: data?.state,
        zip: data?.zip,
        sms_notifications: data?.sms_notifications,
        email_notifications: data?.email_notifications,
      })
    })
  }, [])

  const onSave = async (data: any) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update(data).eq('id', user.id)
    setSaving(false)
    if (error) toast.error(error.message)
    else { toast.success('Profile saved!'); router.refresh() }
  }

  const onChangePass = async (data: any) => {
    if (data.new_password !== data.confirm) { toast.error('Passwords do not match'); return }
    const { error } = await supabase.auth.updateUser({ password: data.new_password })
    if (error) toast.error(error.message)
    else { toast.success('Password updated!'); resetPass() }
  }

  if (!profile) return <div className="text-[--gray-300] text-sm">Loadingâ€¦</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy">My Profile</h1>
        <p className="text-[--gray-500] text-sm mt-1">Manage your personal information and preferences.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Avatar */}
        <div className="card p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-gold text-xl font-bold font-display">
              {getInitials(profile.full_name ?? profile.id)}
            </div>
            <div>
              <p className="font-semibold text-navy">{profile.full_name}</p>
              <p className="text-sm text-[--gray-300]">Customer Â· Member since {new Date(profile.created_at).getFullYear()}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name</label>
                <input {...register('full_name')} className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" {...register('phone')} className="input" />
              </div>
            </div>
            <div>
              <label className="label">Service Address</label>
              <input {...register('address')} placeholder="123 Main St" className="input" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <label className="label">City</label>
                <input {...register('city')} className="input" />
              </div>
              <div>
                <label className="label">State</label>
                <input {...register('state')} placeholder="OH" className="input" />
              </div>
              <div>
                <label className="label">ZIP</label>
                <input {...register('zip')} placeholder="43101" className="input" />
              </div>
            </div>

            {/* Notification preferences */}
            <div className="pt-4 border-t border-[--gray-100]">
              <p className="text-xs font-bold uppercase tracking-widest text-[--gray-300] mb-3">Notifications</p>
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input type="checkbox" {...register('sms_notifications')} className="w-4 h-4 accent-gold" />
                <span className="text-sm text-navy">SMS reminders and updates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('email_notifications')} className="w-4 h-4 accent-gold" />
                <span className="text-sm text-navy">Email reminders and updates</span>
              </label>
            </div>

            <button type="submit" disabled={saving} className="btn-navy">
              {saving ? 'Savingâ€¦' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock size={16} className="text-gold" />
            <h3 className="font-semibold text-navy">Change Password</h3>
          </div>
          <form onSubmit={submitPass(onChangePass)} className="space-y-4">
            <div>
              <label className="label">New Password</label>
              <input type="password" {...regPass('new_password', { minLength: { value: 8, message: 'Min 8 characters' } })} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className="input" />
              {passErrors.new_password && <p className="text-xs text-red-500 mt-1">{passErrors.new_password.message as string}</p>}
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" {...regPass('confirm')} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className="input" />
            </div>
            <button type="submit" className="btn-ghost border border-[--gray-200]">Update Password</button>
          </form>
        </div>

        {/* Google Calendar */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-navy mb-0.5">Google Calendar Sync</p>
              <p className="text-sm text-[--gray-500]">Auto-add appointments to your Google Calendar</p>
            </div>
            <a href="/api/calendar/connect" className="btn-primary text-sm">Connect â†’</a>
          </div>
        </div>
      </div>
    </div>
  )
}
