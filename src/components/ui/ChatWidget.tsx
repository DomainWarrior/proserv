'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'

interface Message { role: 'agent' | 'user'; text: string }

const responses = [
  'Great question! We usually respond within a few hours during business hours.',
  'You can book a service anytime at the top of the page — just hit "Book Now"!',
  'Our team is available Monday through Saturday, 7 AM to 7 PM.',
  'For urgent requests, please call us at (555) 123-4567.',
  'We serve New Rome, OH and the surrounding area within 30 miles.',
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: 'Hey there! 👋 How can I help you today?' },
    { role: 'agent', text: 'I can help with quotes, bookings, or general questions.' },
  ])
  const [input, setInput] = useState('')
  const [responseIdx, setResponseIdx] = useState(0)
  const messagesEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim()) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'agent', text: responses[responseIdx % responses.length] },
      ])
      setResponseIdx(i => i + 1)
    }, 900)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Popup */}
      {open && (
        <div className="absolute bottom-16 right-0 w-72 bg-white rounded-2xl shadow-2xl border border-[--gray-200] overflow-hidden mb-2">
          {/* Header */}
          <div className="bg-navy-DEFAULT px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-DEFAULT/20 flex items-center justify-center text-lg">💬</div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">ProServ Support</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <p className="text-white/50 text-xs">Online now</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white">
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="p-3 h-48 overflow-y-auto flex flex-col gap-2">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-[88%] ${
                  m.role === 'agent'
                    ? 'bg-[--gray-100] text-navy-DEFAULT rounded-tl-none self-start'
                    : 'bg-navy-DEFAULT text-white rounded-tr-none self-end'
                }`}
              >
                {m.text}
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-[--gray-100] flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message…"
              className="flex-1 text-xs border border-[--gray-200] rounded-lg px-3 py-1.5 outline-none focus:border-gold-DEFAULT"
            />
            <button
              onClick={send}
              className="w-7 h-7 bg-navy-DEFAULT text-white rounded-lg flex items-center justify-center hover:bg-navy-mid transition-colors"
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-13 h-13 w-12 h-12 bg-navy-DEFAULT text-white rounded-full shadow-xl flex items-center justify-center hover:bg-navy-mid transition-all hover:scale-105"
        aria-label="Open chat"
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  )
}
