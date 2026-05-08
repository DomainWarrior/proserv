'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Faq { q: string; a: string }

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-[--gray-200]">
      {faqs.map((faq, i) => (
        <div key={i} className="py-5">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 text-left"
          >
            <span className="font-semibold text-navy-DEFAULT">{faq.q}</span>
            <ChevronDown
              size={18}
              className={cn(
                'text-[--gray-300] flex-shrink-0 transition-transform duration-200',
                open === i && 'rotate-180 text-gold-DEFAULT'
              )}
            />
          </button>
          {open === i && (
            <p className="mt-3 text-sm text-[--gray-500] leading-relaxed">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
