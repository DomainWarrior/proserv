import Link from 'next/link'
import { Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-navy text-white pt-16 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="font-display text-gold text-2xl mb-3">ProServ</div>
            <p className="text-white/50 text-sm leading-relaxed">
              Professional local services delivered with care. Licensed, insured, and satisfaction guaranteed.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Services</h4>
            <ul className="space-y-2.5">
              {['Lawn Care', 'House Cleaning', 'Snow Removal', 'Handyman', 'Window Cleaning', 'Tree Trimming'].map(s => (
                <li key={s}>
                  <Link href="/services" className="text-sm text-white/60 hover:text-gold transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/',        label: 'Home' },
                { href: '/services',label: 'Services' },
                { href: '/book',    label: 'Book Now' },
                { href: '/login',   label: 'Customer Login' },
                { href: '/signup',  label: 'Create Account' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 hover:text-gold transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone size={14} className="text-gold flex-shrink-0" />
                <a href="tel:+15551234567" className="hover:text-gold transition-colors">(555) 123-4567</a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail size={14} className="text-gold flex-shrink-0" />
                <a href="mailto:hello@proserv.com" className="hover:text-gold transition-colors">hello@proserv.com</a>
              </li>
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin size={14} className="text-gold flex-shrink-0 mt-0.5" />
                New Rome, OH & Surrounding Areas
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-white/30 mb-1">Hours</p>
              <p className="text-sm text-white/60">Mon â€“ Sat: 7:00 AM â€“ 7:00 PM</p>
              <p className="text-sm text-white/40">Sunday: Closed (Emergency available)</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            Â© {new Date().getFullYear()} ProServ Local Services. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-white/30">Privacy Policy</span>
            <span className="text-xs text-white/30">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
