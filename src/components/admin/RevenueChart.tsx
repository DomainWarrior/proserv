'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const data = [
  { month: 'Dec', revenue: 9800 },
  { month: 'Jan', revenue: 11200 },
  { month: 'Feb', revenue: 8900 },
  { month: 'Mar', revenue: 13400 },
  { month: 'Apr', revenue: 12100 },
  { month: 'May', revenue: 14820 },
]

export function RevenueChart() {
  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy mb-4">Revenue (6 months)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7a7670' }} />
          <YAxis tick={{ fontSize: 11, fill: '#7a7670' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
            contentStyle={{ fontFamily: 'DM Sans', fontSize: 12, border: '1px solid #ddd9d2', borderRadius: 8 }}
          />
          <Bar dataKey="revenue" fill="#c9a84c" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
