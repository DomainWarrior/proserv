// ─── Auth ────────────────────────────────────────────────────────────────────

export type UserRole = 'customer' | 'worker' | 'admin'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  lat: number | null
  lng: number | null
  stripe_customer_id: string | null
  sms_notifications: boolean
  email_notifications: boolean
  created_at: string
  updated_at: string
}

// ─── Services ────────────────────────────────────────────────────────────────

export type ServiceCategory =
  | 'lawn_care'
  | 'house_cleaning'
  | 'snow_removal'
  | 'handyman'
  | 'window_cleaning'
  | 'tree_trimming'
  | 'other'

export interface Service {
  id: string
  name: string
  slug: string
  category: ServiceCategory
  description: string | null
  short_desc: string | null
  base_price: number
  price_unit: string
  duration_hours: number | null
  is_active: boolean
  sort_order: number
  packages?: ServicePackage[]
}

export interface ServicePackage {
  id: string
  service_id: string
  name: string
  price: number
  price_unit: string
  features: string[]
  is_featured: boolean
  sort_order: number
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled'

export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'failed'

export interface Appointment {
  id: string
  customer_id: string
  worker_id: string | null
  service_id: string
  package_id: string | null
  status: AppointmentStatus
  scheduled_at: string
  duration_hours: number | null
  address: string
  city: string
  state: string
  zip: string
  notes: string | null
  internal_notes: string | null
  price: number | null
  payment_status: PaymentStatus
  stripe_payment_intent_id: string | null
  google_event_id: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
  // Joined fields
  service?: Service
  customer?: Profile
  worker?: Profile & { rating?: number; jobs_completed?: number }
}

export interface BookingForm {
  service_id: string
  package_id?: string
  scheduled_at: string
  address: string
  city: string
  state: string
  zip: string
  notes?: string
}

// ─── Workers ─────────────────────────────────────────────────────────────────

export interface Worker {
  id: string
  profile: Profile
  specialties: ServiceCategory[]
  bio: string | null
  is_available: boolean
  rating: number
  jobs_completed: number
  google_calendar_id: string | null
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  appointment_id: string
  customer_id: string
  worker_id: string | null
  rating: number
  title: string | null
  body: string | null
  is_verified: boolean
  is_published: boolean
  created_at: string
  customer?: Profile
  worker?: Profile
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'payment_received'
  | 'review_request'
  | 'general'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  data: Record<string, unknown> | null
  is_read: boolean
  created_at: string
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  revenue_month: number
  revenue_change: number
  jobs_month: number
  jobs_change: number
  avg_rating: number
  on_time_rate: number
  active_customers: number
  active_workers: number
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export interface WeatherData {
  temperature: number
  weatherCode: number
  description: string
  icon: string
  isRainy: boolean
  isSunny: boolean
  isSnowy: boolean
  windSpeed: number
  humidity: number
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// ─── Supabase generated types placeholder ─────────────────────────────────────
// Run: npx supabase gen types typescript --project-id YOUR_ID > src/types/supabase.ts
export interface Database {
  public: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
  }
}
