import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    confirmed:   'bg-green-100 text-green-800',
    pending:     'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed:   'bg-gray-100 text-gray-800',
    cancelled:   'bg-red-100 text-red-800',
    rescheduled: 'bg-purple-100 text-purple-800',
    paid:        'bg-green-100 text-green-800',
    failed:      'bg-red-100 text-red-800',
    refunded:    'bg-gray-100 text-gray-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
