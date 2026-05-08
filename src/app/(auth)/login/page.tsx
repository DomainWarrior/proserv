'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard'
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async ({ email, password }: LoginForm) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    // Get role to redirect correctly
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    toast.success('Welcome back!')
    router.push(profile?.role === 'admin' ? '/admin' : redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen gradient-navy flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-gold-DEFAULT text-3xl">ProServ</Link>
          <p className="text-white/50 text-sm mt-2">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                {...register('email')}
                placeholder="you@email.com"
                className="input"
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <Link href="/reset-password" className="text-xs text-gold-DEFAULT hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[--gray-300] hover:text-navy-DEFAULT"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-navy w-full justify-center py-3 text-base"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[--gray-100] text-center">
            <p className="text-sm text-[--gray-500]">
              Don't have an account?{' '}
              <Link href="/signup" className="text-gold-DEFAULT font-semibold hover:underline">
                Create one free
              </Link>
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-[--off-white] rounded-lg px-3 py-2">
            <Lock size={13} className="text-[--gray-300] flex-shrink-0" />
            <p className="text-xs text-[--gray-300]">
              Secured with Supabase Auth. Your data is encrypted and protected.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
