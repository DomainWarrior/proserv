import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/components/home/Hero'
import { ServicesOverview } from '@/components/home/ServicesOverview'
import { BeforeAfter } from '@/components/home/BeforeAfter'
import { Testimonials } from '@/components/home/Testimonials'
import { CtaStrip } from '@/components/home/CtaStrip'
import { StatsBar } from '@/components/home/StatsBar'
import { ChatWidget } from '@/components/ui/ChatWidget'

export const metadata: Metadata = {
  title: 'ProServ — Professional Local Services',
  description: 'Book lawn care, cleaning, handyman, and more. Fast online booking, verified technicians, 100% satisfaction guarantee.',
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <ServicesOverview />
        <BeforeAfter />
        <Testimonials />
        <CtaStrip />
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
