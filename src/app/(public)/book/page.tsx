'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const bookingSchema = z.object({
  service_id: z.string().min(1, 'Select a service'),
  package_id: z.string().optional(),
  scheduled_date: z.string().min(1, 'Select a date'),
  scheduled_time: z.string().min(1, 'Select a time'),
  address: z.string().min(5, 'Enter your address'),
  city: z.string().min(2, 'Enter your city'),
  state: z.string().min(2, 'Enter your state'),
  zip: z.string().regex(/^\d{5}$/, 'Enter a valid ZIP code'),
  notes: z.string().optional(),
})
type BookingForm = z.infer<typeof bookingSchema>

const services = [
  { id: 'lawn-care-id', name: 'Lawn Care & Maintenance', packages: [
    { id: 'basic', name: 'Basic', price: 49 },
    { id: 'standard', name: 'Standard', price: 89 },
    { id: 'premium', name: 'Premium', price: 149 },
  ]},
  { id: 'cleaning-id', name: 'House Cleaning', packages: [
    { id: 'standard', name: 'Standard', price: 89 },
    { id: 'deep', name: 'Deep Clean', price: 149 },
  ]},
  { id: 'snow-id', name: 'Snow Removal', packages: [
    { id: 'basic', name: 'Driveway', price: 35 },
    { id: 'full', name: 'Full Property', price: 75 },
  ]},
  { id: 'handyman-id', name: 'Handyman Services', packages: [
    { id: 'hourly', name: 'Hourly Rate', price: 75 },
  ]},
]

const timeSlots = [
  '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
]

function PaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })
    if (error) {
      toast.error(error.message ?? 'Payment failed')
    } else {
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? 'Processing...' : 'Pay & Confirm Booking'}
      </button>
    </form>
  )
}

export default function BookPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [appointmentId, setAppointmentId] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  })

  const watchedServiceId = watch('service_id')
  useEffect(() => {
    const svc = services.find(s => s.id === watchedServiceId)
    setSelectedService(svc ?? null)
  }, [watchedServiceId])

  const onSubmit = async (data: BookingForm) => {
    if (!user) {
      router.push('/login?redirectTo=/book')
      return
    }

    const scheduledAt = new Date(`${data.scheduled_date}T${convertTo24h(data.scheduled_time)}`).toISOString()

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, scheduled_at: scheduledAt }),
    })
    const result = await res.json()
    if (!res.ok) { toast.error(result.error); return }

    setAppointmentId(result.data.id)

    // Create payment intent
    const payRes = await fetch('/api/payments/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointment_id: result.data.id }),
    })
    const payResult = await payRes.json()
    if (payResult.clientSecret) {
      setClientSecret(payResult.clientSecret)
      setStep(2)
    } else {
      toast.success('Booking submitted! We\'ll confirm shortly.')
      router.push('/dashboard')
    }
  }

  const convertTo24h = (time12: string) => {
    const [time, modifier] = time12.split(' ')
    let [hours, minutes] = time.split(':')
    if (hours === '12') hours = '00'
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12)
    return `${hours.padStart(2, '0')}:${minutes}:00`
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-4 bg-[--off-white]">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-8">
            {['Booking Details', 'Payment'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= i + 1 ? 'bg-navy text-white' : 'bg-[--gray-200] text-[--gray-500]'}`}>
                  {i + 1}
                </div>
                <span className={`text-sm font-medium ${step >= i + 1 ? 'text-navy' : 'text-[--gray-300]'}`}>
                  {label}
                </span>
                {i < 1 && <span className="text-[--gray-200] mx-1">â†’</span>}
              </div>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-6">
              <div>
                <h1 className="font-display text-2xl text-navy mb-1">Book a Service</h1>
                <p className="text-sm text-[--gray-500]">Fill in your details and we'll get you scheduled.</p>
              </div>

              {/* Service */}
              <div className="form-group">
                <label className="label">Service</label>
                <select {...register('service_id')} className="input">
                  <option value="">Select a serviceâ€¦</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {errors.service_id && <p className="text-xs text-red-500 mt-1">{errors.service_id.message}</p>}
              </div>

              {/* Package */}
              {selectedService && (
                <div className="form-group">
                  <label className="label">Package</label>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedService.packages.map(pkg => (
                      <label key={pkg.id} className="cursor-pointer">
                        <input type="radio" {...register('package_id')} value={pkg.id} className="sr-only" />
                        <div className="card p-3 text-center hover:border-gold transition-colors has-[:checked]:border-gold has-[:checked]:bg-gold-pale">
                          <div className="font-semibold text-sm">{pkg.name}</div>
                          <div className="text-gold font-bold">${pkg.price}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Date</label>
                  <input
                    type="date"
                    {...register('scheduled_date')}
                    min={new Date().toISOString().split('T')[0]}
                    className="input"
                  />
                  {errors.scheduled_date && <p className="text-xs text-red-500 mt-1">{errors.scheduled_date.message}</p>}
                </div>
                <div className="form-group">
                  <label className="label">Time</label>
                  <select {...register('scheduled_time')} className="input">
                    <option value="">Selectâ€¦</option>
                    {timeSlots.map(t => <option key={t}>{t}</option>)}
                  </select>
                  {errors.scheduled_time && <p className="text-xs text-red-500 mt-1">{errors.scheduled_time.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div className="form-group">
                <label className="label">Service Address</label>
                <input type="text" {...register('address')} placeholder="123 Main St" className="input" />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="form-group col-span-1">
                  <label className="label">City</label>
                  <input type="text" {...register('city')} className="input" />
                </div>
                <div className="form-group">
                  <label className="label">State</label>
                  <input type="text" {...register('state')} placeholder="OH" className="input" />
                </div>
                <div className="form-group">
                  <label className="label">ZIP</label>
                  <input type="text" {...register('zip')} placeholder="43101" className="input" />
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="label">Special Instructions (optional)</label>
                <textarea {...register('notes')} className="input" rows={3} placeholder="Gate code, pets, specific areas to focus onâ€¦" />
              </div>

              <button type="submit" className="btn-primary w-full justify-center text-base py-3">
                Continue to Payment â†’
              </button>

              {!user && (
                <p className="text-xs text-center text-[--gray-300]">
                  You'll be asked to sign in or create an account.
                </p>
              )}
            </form>
          )}

          {step === 2 && clientSecret && (
            <div className="card p-8">
              <h2 className="font-display text-2xl text-navy mb-2">Secure Payment</h2>
              <p className="text-sm text-[--gray-500] mb-6">Your payment is encrypted and secure. Powered by Stripe.</p>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  onSuccess={() => {
                    toast.success('ðŸŽ‰ Booking confirmed! Check your SMS for details.')
                    router.push('/dashboard')
                  }}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
