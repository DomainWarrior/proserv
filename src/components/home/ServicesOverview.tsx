import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const services = [
  { icon: '🌿', name: 'Lawn Care & Maintenance', slug: 'lawn-care',       desc: 'Mowing, edging, fertilization, and seasonal cleanups.', price: 'From $49' },
  { icon: '🏠', name: 'House Cleaning',           slug: 'house-cleaning', desc: 'Deep cleaning and recurring maintenance for your home.',  price: 'From $89' },
  { icon: '❄️', name: 'Snow Removal',             slug: 'snow-removal',   desc: 'Driveways, walkways, and lots. 24/7 emergency available.', price: 'From $35' },
  { icon: '🔧', name: 'Handyman Services',         slug: 'handyman',       desc: 'Repairs, installations, and home improvements.',          price: '$75/hr' },
  { icon: '🪟', name: 'Window Cleaning',           slug: 'window-cleaning',desc: 'Interior & exterior, streak-free guarantee.',             price: 'From $120' },
  { icon: '🌳', name: 'Tree & Shrub Trimming',    slug: 'tree-trimming',  desc: 'Safe pruning, shaping, and removal by certified arborists.', price: 'From $95' },
]

export function ServicesOverview() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-eyebrow">What We Offer</p>
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">
            Professional, affordable, and reliable. Every service backed by our satisfaction guarantee.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(svc => (
            <Link
              key={svc.slug}
              href={`/services/${svc.slug}`}
              className="card group relative overflow-hidden p-7 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-md hover:border-gold-DEFAULT transition-all duration-200"
            >
              {/* Gold top accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-DEFAULT to-gold-light scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

              <div className="w-12 h-12 bg-gold-pale rounded-xl flex items-center justify-center text-2xl">
                {svc.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-navy-DEFAULT mb-1.5">{svc.name}</h3>
                <p className="text-sm text-[--gray-500] leading-relaxed">{svc.desc}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gold-DEFAULT bg-gold-pale px-3 py-1 rounded-full">
                  {svc.price}
                </span>
                <ArrowRight
                  size={16}
                  className="text-[--gray-300] group-hover:text-gold-DEFAULT group-hover:translate-x-1 transition-all"
                />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/services" className="btn-navy">
            View All Services & Pricing
          </Link>
        </div>
      </div>
    </section>
  )
}
