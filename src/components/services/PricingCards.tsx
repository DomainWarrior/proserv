import Link from 'next/link'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Package {
  name: string
  price: number
  features: string[]
  featured: boolean
}

export function PricingCards({ packages }: { packages: Package[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {packages.map(pkg => (
        <div
          key={pkg.name}
          className={cn(
            'card p-7 flex flex-col relative',
            pkg.featured && 'border-gold-DEFAULT border-2'
          )}
        >
          {pkg.featured && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-DEFAULT text-navy-DEFAULT text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
              Most Popular
            </div>
          )}

          <h3 className="font-semibold text-[--gray-500] mb-1">{pkg.name}</h3>
          <div className="font-display text-4xl text-navy-DEFAULT mb-0.5">
            ${pkg.price}
          </div>
          <p className="text-xs text-[--gray-300] mb-6">per visit</p>

          <ul className="space-y-3 flex-1 mb-6">
            {pkg.features.map(f => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-[--gray-700]">
                <Check size={14} className="text-brand-green flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link
            href={`/book`}
            className={cn(
              'w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all',
              pkg.featured
                ? 'bg-navy-DEFAULT text-white hover:bg-navy-mid'
                : 'border border-[--gray-200] text-navy-DEFAULT hover:border-navy-DEFAULT hover:bg-[--off-white]'
            )}
          >
            Book {pkg.name}
          </Link>
        </div>
      ))}
    </div>
  )
}
