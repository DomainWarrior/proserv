'use client'

import { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    id: 1,
    name: 'Maria K.',
    initials: 'MK',
    color: '#0a1628',
    rating: 5,
    service: 'Lawn Care',
    date: '2 weeks ago',
    text: 'ProServ transformed my overgrown yard into a showpiece. They were on time, professional, and the price was exactly what they quoted. I\'ll never use anyone else.',
  },
  {
    id: 2,
    name: 'Robert J.',
    initials: 'RJ',
    color: '#1a4a6e',
    rating: 5,
    service: 'House Cleaning',
    date: '1 month ago',
    text: 'The cleaning team left my house spotless before a big family event. Every corner was addressed. This is genuinely the best cleaning service I\'ve ever hired.',
  },
  {
    id: 3,
    name: 'Sarah L.',
    initials: 'SL',
    color: '#3a1a6e',
    rating: 5,
    service: 'Snow Removal',
    date: '3 months ago',
    text: 'Called at 6am after a huge snowstorm. They were at my place within the hour and had my driveway cleared before I needed to leave for work. Absolute lifesavers.',
  },
  {
    id: 4,
    name: 'David H.',
    initials: 'DH',
    color: '#1a6b3c',
    rating: 4,
    service: 'Handyman',
    date: '3 weeks ago',
    text: 'Excellent handyman work â€” fixed my deck, replaced two doors, and patched drywall all in one day. Competitive pricing and no hidden fees. Very happy overall.',
  },
  {
    id: 5,
    name: 'Jennifer T.',
    initials: 'JT',
    color: '#6b3a1a',
    rating: 5,
    service: 'Window Cleaning',
    date: '1 week ago',
    text: 'My windows have never looked this clean. The team was in and out in under two hours, and they were so careful with my indoor plants. Highly recommend.',
  },
]

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return
    const id = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 5000)
    return () => clearInterval(id)
  }, [autoplay])

  const prev = () => { setAutoplay(false); setCurrent(c => (c - 1 + testimonials.length) % testimonials.length) }
  const next = () => { setAutoplay(false); setCurrent(c => (c + 1) % testimonials.length) }

  return (
    <section className="py-24 px-4 bg-white dark:bg-[--gray-100]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-eyebrow">Customer Love</p>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Real reviews from verified customers across our service areas. 4.9â˜… average from 2,400+ jobs.
          </p>
        </div>

        {/* Featured testimonial */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="card p-8 md:p-12 max-w-3xl mx-auto"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < testimonials[current].rating ? 'text-gold fill-gold' : 'text-[--gray-200]'}
                  />
                ))}
              </div>

              <blockquote className="text-lg text-[--gray-700] leading-relaxed italic mb-8">
                "{testimonials[current].text}"
              </blockquote>

              <div className="flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-gold font-bold text-sm flex-shrink-0"
                  style={{ background: testimonials[current].color }}
                >
                  {testimonials[current].initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy">{testimonials[current].name}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-brand-green bg-brand-green-light px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle size={10} />
                      Verified
                    </span>
                  </div>
                  <span className="text-sm text-[--gray-300]">
                    {testimonials[current].service} Â· {testimonials[current].date}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-[--gray-200] flex items-center justify-center hover:bg-navy hover:text-white hover:border-navy transition-all"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setAutoplay(false); setCurrent(i) }}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === current ? 'bg-gold w-6' : 'bg-[--gray-200]'
                  )}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-[--gray-200] flex items-center justify-center hover:bg-navy hover:text-white hover:border-navy transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Google Reviews note */}
        <p className="text-center text-sm text-[--gray-300] mt-8">
          Reviews sourced from Google, Yelp, and our platform. All reviews are from verified customers.
        </p>
      </div>
    </section>
  )
}
