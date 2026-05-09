import Link from 'next/link'
import { Phone } from 'lucide-react'

export function CtaStrip() {
  return (
    <section className="gradient-navy text-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-display text-4xl mb-4">Ready to Get Started?</h2>
        <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
          Join 2,400+ satisfied customers. Instant quotes, easy scheduling, zero hassle.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+15551234567"
            className="inline-flex items-center justify-center gap-3 bg-gold text-navy px-8 py-4 rounded-xl text-lg font-bold hover:bg-gold-light transition-all hover:-translate-y-1 shadow-[0_4px_20px_rgba(201,168,76,0.35)]"
          >
            <Phone size={20} />
            (555) 123-4567
          </a>
          <Link
            href="/book"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 transition-all"
          >
            Book Online â†’
          </Link>
        </div>
      </div>
    </section>
  )
}
