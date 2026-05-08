import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PricingCards } from '@/components/services/PricingCards'
import { FaqAccordion } from '@/components/services/FaqAccordion'
import { QuoteForm } from '@/components/services/QuoteForm'

export const metadata: Metadata = {
  title: 'Services & Pricing',
  description: 'Transparent pricing for lawn care, house cleaning, snow removal, handyman, and more. Free estimates available.',
}

const services = [
  {
    icon: '🌿',
    name: 'Lawn Care & Maintenance',
    slug: 'lawn-care',
    description: 'Professional mowing, edging, fertilization, and seasonal cleanups to keep your yard looking its absolute best year-round.',
    packages: [
      { name: 'Basic',    price: 49,  features: ['Mow & edge', 'Clipping cleanup', 'Walkway clearing'],                                   featured: false },
      { name: 'Standard', price: 89,  features: ['Everything in Basic', 'Fertilization', 'Weed control', 'Trimming'],                      featured: true },
      { name: 'Premium',  price: 149, features: ['Everything in Standard', 'Aeration', 'Overseeding', 'Pest treatment', 'Priority booking'], featured: false },
    ],
  },
  {
    icon: '🏠',
    name: 'House Cleaning',
    slug: 'house-cleaning',
    description: 'Thorough residential cleaning by background-checked professionals. One-time, recurring, or move-in/move-out cleans.',
    packages: [
      { name: 'Standard',  price: 89,  features: ['All rooms cleaned', 'Bathrooms & kitchen', 'Vacuuming & mopping'],                       featured: false },
      { name: 'Deep Clean', price: 149, features: ['Everything in Standard', 'Inside appliances', 'Baseboards & blinds', 'Cabinet fronts'], featured: true },
      { name: 'Move In/Out',price: 199, features: ['Full deep clean', 'Inside all cabinets', 'Windows', 'Garage sweep'],                    featured: false },
    ],
  },
  {
    icon: '❄️',
    name: 'Snow Removal',
    slug: 'snow-removal',
    description: '24/7 emergency snow clearing for driveways, walkways, and commercial properties. Never be snowed in again.',
    packages: [
      { name: 'Driveway',      price: 35,  features: ['Single driveway', 'Up to 2" snow', 'Walkway included'],        featured: false },
      { name: 'Full Property', price: 75,  features: ['Driveway + walks', 'Up to 6" snow', 'De-icing treatment'],     featured: true },
      { name: 'Commercial',    price: 149, features: ['Large lots', 'Priority response', 'Seasonal contracts', '24/7'], featured: false },
    ],
  },
  {
    icon: '🔧',
    name: 'Handyman Services',
    slug: 'handyman',
    description: 'Licensed handymen for repairs, installations, and home improvements. If it\'s broken, we fix it.',
    packages: [
      { name: '2-Hour Block',  price: 150, features: ['Up to 2 hours labor', 'Basic materials included', 'Free estimate'], featured: false },
      { name: 'Half Day',      price: 280, features: ['Up to 4 hours', 'Materials included', 'Multiple tasks'],           featured: true },
      { name: 'Full Day',      price: 520, features: ['Up to 8 hours', 'All materials', 'Complex projects', 'Cleanup'],   featured: false },
    ],
  },
]

const faqs = [
  {
    q: 'Are you licensed and insured?',
    a: 'Yes, ProServ is fully licensed and carries $2 million in general liability insurance. All technicians pass rigorous background checks and complete our in-house training program before serving customers.',
  },
  {
    q: 'Do I need to be home during service?',
    a: 'For exterior services like lawn care and snow removal, you do not need to be home. For interior services, we ask that someone be present for the first visit. After that, we can arrange a secure key lockbox or entry code.',
  },
  {
    q: 'What is your cancellation policy?',
    a: 'Cancel or reschedule up to 24 hours before your appointment at no charge. Same-day cancellations may incur a $25 fee to cover the technician\'s travel time. Manage all appointments in your customer portal.',
  },
  {
    q: 'How do you handle bad weather?',
    a: 'For outdoor services, we monitor the forecast closely. If severe weather is expected, we\'ll contact you to reschedule at no charge. We never send technicians out in dangerous conditions.',
  },
  {
    q: 'Can I set up recurring service?',
    a: 'Absolutely — and we recommend it! Recurring customers get priority scheduling, a 10% discount on every visit, and consistent technician assignment whenever possible.',
  },
  {
    q: 'How do I pay?',
    a: 'We accept all major credit cards, ACH bank transfer, and cash. Payments are processed securely via Stripe. You can also set up autopay for recurring services in your account portal.',
  },
  {
    q: 'What if I\'m not satisfied with the service?',
    a: 'We stand behind our work 100%. If you\'re not satisfied, contact us within 24 hours and we\'ll return to make it right — completely free of charge. No questions asked.',
  },
]

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="gradient-navy text-white pt-28 pb-16 px-4 text-center">
          <p className="section-eyebrow" style={{ color: '#e8c97a' }}>Professional & Reliable</p>
          <h1 className="font-display text-5xl mb-4">Our Services</h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Transparent pricing, certified professionals, and a 100% satisfaction guarantee on every job.
          </p>
          <Link href="/book" className="btn-primary text-base px-8 py-3">
            Request a Free Quote →
          </Link>
        </section>

        {/* Service sections */}
        {services.map((svc, i) => (
          <section key={svc.slug} className={`py-20 px-4 ${i % 2 === 1 ? 'bg-white' : ''}`}>
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <div className="text-4xl mb-3">{svc.icon}</div>
                <h2 className="section-title">{svc.name}</h2>
                <p className="section-subtitle">{svc.description}</p>
              </div>
              <PricingCards packages={svc.packages} />
            </div>
          </section>
        ))}

        {/* Quote form */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-eyebrow">Get a Custom Quote</p>
              <h2 className="section-title">Not Sure Which Plan Fits?</h2>
              <p className="section-subtitle">
                Tell us about your project and we'll get back to you within a few hours with a custom quote.
              </p>
            </div>
            <QuoteForm />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-eyebrow">Questions & Answers</p>
              <h2 className="section-title">Frequently Asked Questions</h2>
            </div>
            <FaqAccordion faqs={faqs} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
