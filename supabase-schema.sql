-- ============================================================
--  ProServ — Supabase Database Schema
--  Run this in your Supabase SQL editor to set up the database
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";  -- For scheduled reminders

-- ─── ENUMS ──────────────────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('customer', 'worker', 'admin');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE service_category AS ENUM ('lawn_care', 'house_cleaning', 'snow_removal', 'handyman', 'window_cleaning', 'tree_trimming', 'other');
CREATE TYPE notification_type AS ENUM ('appointment_confirmed', 'appointment_reminder', 'appointment_cancelled', 'payment_received', 'review_request', 'general');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

-- ─── PROFILES (extends auth.users) ─────────────────────────────────────────

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            user_role NOT NULL DEFAULT 'customer',
  full_name       TEXT,
  phone           TEXT,
  avatar_url      TEXT,
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  lat             DECIMAL(10, 8),
  lng             DECIMAL(11, 8),
  stripe_customer_id TEXT,
  google_calendar_token JSONB,
  sms_notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SERVICES ───────────────────────────────────────────────────────────────

CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  category        service_category NOT NULL,
  description     TEXT,
  short_desc      TEXT,
  base_price      DECIMAL(10, 2) NOT NULL,
  price_unit      TEXT DEFAULT 'per visit',   -- 'per visit', 'per hour', 'per sq ft'
  duration_hours  DECIMAL(4, 2),
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE service_packages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id      UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,              -- 'Basic', 'Standard', 'Premium'
  price           DECIMAL(10, 2) NOT NULL,
  price_unit      TEXT DEFAULT 'per visit',
  features        TEXT[],
  is_featured     BOOLEAN DEFAULT FALSE,
  sort_order      INTEGER DEFAULT 0
);

-- ─── WORKERS ────────────────────────────────────────────────────────────────

CREATE TABLE workers (
  id              UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  specialties     service_category[],
  bio             TEXT,
  is_available    BOOLEAN DEFAULT TRUE,
  rating          DECIMAL(3, 2) DEFAULT 5.00,
  jobs_completed  INTEGER DEFAULT 0,
  google_calendar_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE worker_availability (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  day_of_week     INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  UNIQUE(worker_id, day_of_week)
);

CREATE TABLE worker_time_off (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id       UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  reason          TEXT
);

-- ─── APPOINTMENTS ───────────────────────────────────────────────────────────

CREATE TABLE appointments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id       UUID NOT NULL REFERENCES profiles(id),
  worker_id         UUID REFERENCES workers(id),
  service_id        UUID NOT NULL REFERENCES services(id),
  package_id        UUID REFERENCES service_packages(id),
  status            appointment_status NOT NULL DEFAULT 'pending',
  scheduled_at      TIMESTAMPTZ NOT NULL,
  duration_hours    DECIMAL(4, 2),
  address           TEXT NOT NULL,
  city              TEXT NOT NULL,
  state             TEXT NOT NULL,
  zip               TEXT NOT NULL,
  notes             TEXT,
  internal_notes    TEXT,           -- Admin-only
  price             DECIMAL(10, 2),
  payment_status    payment_status DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  google_event_id   TEXT,           -- Google Calendar event ID
  reminder_sent_24h BOOLEAN DEFAULT FALSE,
  reminder_sent_2h  BOOLEAN DEFAULT FALSE,
  completed_at      TIMESTAMPTZ,
  cancelled_at      TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE appointment_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  changed_by      UUID REFERENCES profiles(id),
  old_status      appointment_status,
  new_status      appointment_status,
  old_scheduled_at TIMESTAMPTZ,
  new_scheduled_at TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REVIEWS ────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  customer_id     UUID NOT NULL REFERENCES profiles(id),
  worker_id       UUID REFERENCES workers(id),
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           TEXT,
  body            TEXT,
  is_verified     BOOLEAN DEFAULT TRUE,
  is_published    BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  data            JSONB,
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INVOICES ───────────────────────────────────────────────────────────────

CREATE TABLE invoices (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id        UUID NOT NULL REFERENCES appointments(id),
  customer_id           UUID NOT NULL REFERENCES profiles(id),
  stripe_invoice_id     TEXT,
  stripe_payment_intent TEXT,
  amount                DECIMAL(10, 2) NOT NULL,
  status                payment_status DEFAULT 'pending',
  paid_at               TIMESTAMPTZ,
  pdf_url               TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── QUOTE REQUESTS ─────────────────────────────────────────────────────────

CREATE TABLE quote_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  service         TEXT NOT NULL,
  address         TEXT,
  description     TEXT,
  is_handled      BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BUSINESS SETTINGS ──────────────────────────────────────────────────────

CREATE TABLE business_settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key             TEXT UNIQUE NOT NULL,
  value           JSONB NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Insert defaults
INSERT INTO business_settings (key, value) VALUES
  ('business_name',   '"ProServ Local Services"'),
  ('phone',           '"(555) 123-4567"'),
  ('email',           '"hello@proserv.com"'),
  ('address',         '"123 Main St, New Rome, OH 43101"'),
  ('hours',           '{"mon":"7:00-19:00","tue":"7:00-19:00","wed":"7:00-19:00","thu":"7:00-19:00","fri":"7:00-19:00","sat":"7:00-19:00","sun":"closed"}'),
  ('booking_advance_days', '90'),
  ('cancellation_hours',   '24');

-- Insert default services
INSERT INTO services (name, slug, category, description, short_desc, base_price, duration_hours) VALUES
  ('Lawn Care & Maintenance', 'lawn-care', 'lawn_care', 'Professional mowing, edging, fertilization, and seasonal cleanups.', 'Mowing, edging, fertilization, and cleanups.', 49.00, 2),
  ('House Cleaning', 'house-cleaning', 'house_cleaning', 'Deep cleaning, recurring maintenance, and move-in/out cleans.', 'Deep and recurring cleaning services.', 89.00, 3),
  ('Snow Removal', 'snow-removal', 'snow_removal', 'Driveways, walkways, and commercial lots. 24/7 emergency available.', '24/7 snow and ice removal.', 35.00, 1),
  ('Handyman Services', 'handyman', 'handyman', 'Repairs, installations, and home improvements by licensed professionals.', 'Repairs and home improvements.', 75.00, 2),
  ('Window Cleaning', 'window-cleaning', 'window_cleaning', 'Interior and exterior window cleaning with streak-free guarantee.', 'Crystal-clear interior & exterior windows.', 120.00, 2),
  ('Tree & Shrub Trimming', 'tree-trimming', 'tree_trimming', 'Safe pruning, shaping, and removal by certified arborists.', 'Professional pruning and tree care.', 95.00, 3);

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────────────────────

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews             ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own; admins see all
CREATE POLICY "profiles_self" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "profiles_admin" ON profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Appointments: customers see their own; workers see assigned; admins see all
CREATE POLICY "appointments_customer" ON appointments
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "appointments_worker" ON appointments
  FOR SELECT USING (worker_id = auth.uid());

CREATE POLICY "appointments_admin" ON appointments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'worker'))
  );

CREATE POLICY "appointments_insert" ON appointments
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Notifications: users see only their own
CREATE POLICY "notifications_self" ON notifications
  FOR ALL USING (user_id = auth.uid());

-- Invoices: customers see their own; admins see all
CREATE POLICY "invoices_customer" ON invoices
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "invoices_admin" ON invoices
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ─── FUNCTIONS & TRIGGERS ───────────────────────────────────────────────────

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update worker stats after review
CREATE OR REPLACE FUNCTION update_worker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE workers SET
    rating = (SELECT AVG(rating) FROM reviews WHERE worker_id = NEW.worker_id),
    jobs_completed = (SELECT COUNT(*) FROM appointments WHERE worker_id = NEW.worker_id AND status = 'completed')
  WHERE id = NEW.worker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_worker_rating();

-- Log appointment status changes
CREATE OR REPLACE FUNCTION log_appointment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status OR OLD.scheduled_at IS DISTINCT FROM NEW.scheduled_at THEN
    INSERT INTO appointment_history
      (appointment_id, changed_by, old_status, new_status, old_scheduled_at, new_scheduled_at)
    VALUES
      (NEW.id, auth.uid(), OLD.status, NEW.status, OLD.scheduled_at, NEW.scheduled_at);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointment_change_log
  AFTER UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION log_appointment_change();

-- ─── INDEXES ────────────────────────────────────────────────────────────────

CREATE INDEX idx_appointments_customer    ON appointments(customer_id);
CREATE INDEX idx_appointments_worker      ON appointments(worker_id);
CREATE INDEX idx_appointments_status      ON appointments(status);
CREATE INDEX idx_appointments_scheduled   ON appointments(scheduled_at);
CREATE INDEX idx_notifications_user       ON notifications(user_id, is_read);
CREATE INDEX idx_reviews_worker           ON reviews(worker_id);
