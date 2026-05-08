import Link from 'next/link'
import { AlertCircle, UserCheck, CalendarCheck } from 'lucide-react'

interface Props { pendingCount: number }

export function PendingActions({ pendingCount }: Props) {
  const actions = [
    {
      icon: CalendarCheck,
      label: `${pendingCount} appointments awaiting approval`,
      href: '/admin/appointments',
      urgent: pendingCount > 0,
    },
    {
      icon: UserCheck,
      label: 'Unassigned appointments need workers',
      href: '/admin/appointments',
      urgent: true,
    },
    {
      icon: AlertCircle,
      label: 'New quote requests to review',
      href: '/admin/customers',
      urgent: false,
    },
  ]

  return (
    <div className="card p-6">
      <h3 className="font-semibold text-navy-DEFAULT mb-4">Pending Actions</h3>
      <div className="space-y-3">
        {actions.map(a => (
          <Link
            key={a.label}
            href={a.href}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[--off-white] transition-colors group"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${a.urgent ? 'bg-red-50' : 'bg-[--gray-100]'}`}>
              <a.icon size={17} className={a.urgent ? 'text-red-600' : 'text-[--gray-300]'} />
            </div>
            <p className="text-sm text-navy-DEFAULT flex-1">{a.label}</p>
            <span className="text-xs text-[--gray-300] group-hover:text-gold-DEFAULT transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
