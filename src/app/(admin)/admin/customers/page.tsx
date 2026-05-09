import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Customer Management' }

export default async function AdminCustomersPage() {
  const supabase = createClient()

  const { data: customers } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'customer')
    .order('created_at', { ascending: false })
    .limit(100)

  // Get job counts per customer
  const { data: jobCounts } = await supabase
    .from('appointments')
    .select('customer_id')
    .eq('status', 'completed')

  const countMap: Record<string, number> = {}
  jobCounts?.forEach(j => { countMap[j.customer_id] = (countMap[j.customer_id] ?? 0) + 1 })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-navy">Customers</h1>
          <p className="text-[--gray-500] text-sm mt-1">{customers?.length ?? 0} registered customers</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy text-white">
                {['Name', 'Email', 'Phone', 'Jobs', 'Location', 'Member Since', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[--gray-100]">
              {customers?.map(c => (
                <tr key={c.id} className="hover:bg-[--off-white] transition-colors">
                  <td className="px-4 py-3 font-medium text-navy">{c.full_name ?? 'â€”'}</td>
                  <td className="px-4 py-3 text-[--gray-500]">{c.id.slice(0, 8)}â€¦</td>
                  <td className="px-4 py-3 text-[--gray-500]">{c.phone ?? 'â€”'}</td>
                  <td className="px-4 py-3 font-semibold">{countMap[c.id] ?? 0}</td>
                  <td className="px-4 py-3 text-[--gray-500]">{c.city ? `${c.city}, ${c.state}` : 'â€”'}</td>
                  <td className="px-4 py-3 text-[--gray-500]">{format(new Date(c.created_at), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <span className={`status-badge ${countMap[c.id] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {countMap[c.id] ? 'Active' : 'New'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
