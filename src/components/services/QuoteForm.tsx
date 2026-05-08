'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  name:        z.string().min(2, 'Enter your name'),
  email:       z.string().email('Enter a valid email'),
  phone:       z.string().optional(),
  service:     z.string().min(1, 'Select a service'),
  address:     z.string().optional(),
  description: z.string().min(10, 'Please describe your project'),
})
type QuoteForm = z.infer<typeof schema>

const services = [
  'Lawn Care & Maintenance',
  'House Cleaning',
  'Snow Removal',
  'Handyman Services',
  'Window Cleaning',
  'Tree & Shrub Trimming',
  'Other / Custom',
]

export function QuoteForm() {
  const supabase = createClient()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<QuoteForm>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: QuoteForm) => {
    const { error } = await supabase.from('quote_requests').insert(data)
    if (error) {
      toast.error('Failed to submit. Please try again.')
      return
    }
    toast.success('✅ Quote request sent! We\'ll contact you within 24 hours.')
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name</label>
          <input type="text" {...register('name')} placeholder="Jane Smith" className="input" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" {...register('email')} placeholder="jane@email.com" className="input" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Phone (optional)</label>
          <input type="tel" {...register('phone')} placeholder="(555) 000-0000" className="input" />
        </div>
        <div>
          <label className="label">Service Needed</label>
          <select {...register('service')} className="input">
            <option value="">Select a service…</option>
            {services.map(s => <option key={s}>{s}</option>)}
          </select>
          {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Property Address (optional)</label>
        <input type="text" {...register('address')} placeholder="123 Main St, Your City, OH" className="input" />
      </div>

      <div>
        <label className="label">Describe Your Project</label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Tell us about the size of your property, specific needs, how often you'd like service, and any other details…"
          className="input resize-none"
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3">
        {isSubmitting ? 'Sending…' : 'Request My Free Quote →'}
      </button>
    </form>
  )
}
