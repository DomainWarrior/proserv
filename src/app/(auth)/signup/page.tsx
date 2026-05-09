'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const signupSchema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  email:     z.string().email('Enter a valid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters')
             .regex(/[A-Z]/, 'Include at least one uppercase letter')
             .regex(/[0-9]/, 'Include at least one number'),
  confirm_password: z.string(),
  phone:     z.string().optional(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
})
type SignupForm = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  })

  const password = watch('password', '')
  const strength = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'][strength]

  const onSubmit = async ({ full_name, email, password, phone }: SignupForm) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, role: 'customer' },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Update phone if provided
    if (phone) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({ phone }).eq('id', user.id)
      }
    }

    toast.success('Account created! Check your email to confirm.')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-gold text-3xl">ProServ</Link>
          <p className="text-white/50 text-sm mt-2">Create your free customer account</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input type="text" {...register('full_name')} placeholder="Jane Smith" className="input" autoComplete="name" />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="label">Email Address</label>
              <input type="email" {...register('email')} placeholder="you@email.com" className="input" autoComplete="email" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone (for SMS reminders)</label>
              <input type="tel" {...register('phone')} placeholder="(555) 000-0000" className="input" autoComplete="tel" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="At least 8 characters"
                  className="input pr-10"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--gray-300]">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-[--gray-100]'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-[--gray-500]">{strengthLabel}</span>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <input type="password" {...register('confirm_password')} placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" className="input" autoComplete="new-password" />
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-navy w-full justify-center py-3 text-base mt-2">
              {loading ? 'Creating accountâ€¦' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[--gray-100] text-center">
            <p className="text-sm text-[--gray-500]">
              Already have an account?{' '}
              <Link href="/login" className="text-gold font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-[--off-white] rounded-lg px-3 py-2">
            <Shield size={13} className="text-green-600 flex-shrink-0" />
            <p className="text-xs text-[--gray-300]">
              Passwords are hashed with bcrypt. We never store them in plain text.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
