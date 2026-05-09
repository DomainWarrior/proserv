'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

const integrations = [
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Two-way sync for all appointments',
    icon: 'ðŸ“…',
    status: 'connected',
    action: '/api/calendar/connect',
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Accept cards, ACH, and recurring billing',
    icon: 'ðŸ’³',
    status: 'connected',
    action: 'https://dashboard.stripe.com',
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    description: 'Automated text reminders and notifications',
    icon: 'ðŸ’¬',
    status: 'connected',
    action: 'https://console.twilio.com',
  },
  {
    id: 'google-reviews',
    name: 'Google Reviews',
    description: 'Display Google reviews on your website',
    icon: 'â­',
    status: 'not_connected',
    action: '#',
  },
  {
    id: 'resend',
    name: 'Email (Resend)',
    description: 'Transactional email delivery',
    icon: 'ðŸ“§',
    status: 'connected',
    action: 'https://resend.com',
  },
]

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    toast.success('Settings saved')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-navy">Business Settings</h1>
        <p className="text-[--gray-500] text-sm mt-1">Configure your ProServ platform.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Business info */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy mb-5">Business Information</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Business Name</label>
              <input defaultValue="ProServ Local Services" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input defaultValue="(555) 123-4567" type="tel" className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input defaultValue="hello@proserv.com" type="email" className="input" />
              </div>
            </div>
            <div>
              <label className="label">Service Area</label>
              <input defaultValue="New Rome, OH and surrounding areas" className="input" />
            </div>
            <div>
              <label className="label">Business Hours</label>
              <input defaultValue="Monâ€“Sat, 7:00 AM â€“ 7:00 PM EST" className="input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Booking Window (days)</label>
                <input type="number" defaultValue="90" className="input" />
              </div>
              <div>
                <label className="label">Cancel Notice (hours)</label>
                <input type="number" defaultValue="24" className="input" />
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-navy">
              {saving ? 'Savingâ€¦' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Integrations */}
        <div className="card p-6">
          <h3 className="font-semibold text-navy mb-5">Integrations</h3>
          <div className="space-y-3">
            {integrations.map(intg => (
              <div key={intg.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[--off-white] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[--gray-100] flex items-center justify-center text-xl flex-shrink-0">
                  {intg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-navy">{intg.name}</p>
                    {intg.status === 'connected'
                      ? <CheckCircle size={13} className="text-brand-green" />
                      : <AlertCircle size={13} className="text-amber-500" />
                    }
                  </div>
                  <p className="text-xs text-[--gray-500]">{intg.description}</p>
                </div>
                <a
                  href={intg.action}
                  target={intg.action.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 border border-[--gray-200] rounded-lg hover:bg-[--gray-100] flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  {intg.status === 'connected' ? 'Manage' : 'Connect'}
                  <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Cron info */}
        <div className="card p-6 bg-navy text-white">
          <h3 className="font-semibold mb-3">â± Automated SMS Reminders</h3>
          <p className="text-sm text-white/70 mb-4">
            Add this to your <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">vercel.json</code> to enable automatic SMS reminders:
          </p>
          <pre className="bg-black/30 rounded-xl p-4 text-xs text-white/80 overflow-x-auto">
{`{
  "crons": [
    {
      "path": "/api/sms/reminders",
      "schedule": "*/30 * * * *"
    }
  ]
}`}
          </pre>
          <p className="text-xs text-white/50 mt-3">
            Set <code className="bg-white/10 px-1 rounded">CRON_SECRET</code> in your env vars and pass it as the <code className="bg-white/10 px-1 rounded">x-cron-secret</code> header.
          </p>
        </div>
      </div>
    </div>
  )
}
