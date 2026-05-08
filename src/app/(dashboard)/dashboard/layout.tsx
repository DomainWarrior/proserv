import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/admin')

  return (
    <div className="flex h-screen overflow-hidden bg-[--off-white]">
      <DashboardSidebar profile={profile} userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-6 md:p-8 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
