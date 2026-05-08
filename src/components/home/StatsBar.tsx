// StatsBar.tsx
export function StatsBar() {
  const stats = [
    { value: '2,400+', label: 'Jobs Completed' },
    { value: '4.94★', label: 'Average Rating' },
    { value: '12 Yrs', label: 'Experience' },
    { value: '100%', label: 'Satisfaction Guarantee' },
  ]
  return (
    <div className="bg-white border-b border-[--gray-100]">
      <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {stats.map(s => (
          <div key={s.label}>
            <div className="font-display text-2xl text-navy-DEFAULT">{s.value}</div>
            <div className="text-xs text-[--gray-300] uppercase tracking-wider mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
