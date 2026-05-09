export function BeforeAfter() {
  const items = [
    {
      title: 'Complete Lawn Restoration',
      desc: 'Overgrown yard transformed in one visit',
      before: { bg: 'from-yellow-800 to-yellow-900', emoji: 'ðŸŒ¾' },
      after:  { bg: 'from-green-700 to-green-900',   emoji: 'ðŸŒ¿' },
    },
    {
      title: 'Exterior Window Deep Clean',
      desc: '12 windows, crystal clear',
      before: { bg: 'from-purple-800 to-purple-900', emoji: 'ðŸšï¸' },
      after:  { bg: 'from-blue-600 to-blue-800',     emoji: 'ðŸ ' },
    },
    {
      title: 'Shrub & Tree Shaping',
      desc: 'Overgrown trees reshaped perfectly',
      before: { bg: 'from-amber-800 to-amber-900',   emoji: 'ðŸªµ' },
      after:  { bg: 'from-emerald-700 to-emerald-900', emoji: 'ðŸŒ³' },
    },
  ]

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="section-eyebrow">Real Results</p>
          <h2 className="section-title">See the Difference</h2>
          <p className="section-subtitle">Our work speaks for itself. Transformations that wow every time.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map(item => (
            <div key={item.title} className="rounded-2xl overflow-hidden shadow-sm border border-[--gray-100]">
              <div className="grid grid-cols-2 h-44 relative">
                <div className={`bg-gradient-to-br ${item.before.bg} flex flex-col items-center justify-center gap-1`}>
                  <span className="text-3xl">{item.before.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">Before</span>
                </div>
                <div className={`bg-gradient-to-br ${item.after.bg} flex flex-col items-center justify-center gap-1`}>
                  <span className="text-3xl">{item.after.emoji}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white/70">After</span>
                </div>
                {/* Divider */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white -translate-x-1/2 z-10 flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-xs font-bold text-[--gray-500]">
                    â†”
                  </div>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h4 className="font-semibold text-navy text-sm">{item.title}</h4>
                <p className="text-xs text-[--gray-300] mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
