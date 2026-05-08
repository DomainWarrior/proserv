'use client'

import Link from 'next/link'
import { Phone, ArrowRight, Star } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative gradient-navy text-white pt-24 pb-20 px-4 overflow-hidden min-h-[92vh] flex items-center">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c9a84c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-5xl mx-auto text-center relative">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-gold-DEFAULT/15 border border-gold-DEFAULT/30 text-gold-light px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <Star size={12} fill="currentColor" />
          Rated #1 Local Service in Your Area
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.1] mb-6 text-balance"
        >
          Professional Service,
          <br />
          <em className="text-gold-DEFAULT not-italic">Delivered Right</em>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          From lawn care to deep cleaning — we handle every job with precision, care,
          and a 100% satisfaction guarantee. Instant booking, no hassle.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="tel:+15551234567"
            className="inline-flex items-center justify-center gap-3 bg-gold-DEFAULT text-navy-DEFAULT px-8 py-4 rounded-xl text-lg font-bold hover:bg-gold-light transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(201,168,76,0.4)]"
          >
            <Phone size={20} />
            Call Now — (555) 123-4567
          </a>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 transition-all"
          >
            View Services
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center justify-center gap-6 mt-10 text-white/50 text-sm flex-wrap"
        >
          <span className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Licensed & Insured
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">✓</span> Background-checked Pros
          </span>
          <span className="flex items-center gap-2">
            <span className="text-green-400">✓</span> 100% Satisfaction Guarantee
          </span>
        </motion.div>
      </div>
    </section>
  )
}
