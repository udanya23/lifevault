/**
 * StatsBar — Social proof metrics on the landing page
 * Premium: gradient numbers, animated counter feel, dividers
 */

const stats = [
  { value: '10K+',   label: 'Vaults Created',          icon: '🔐' },
  { value: '< 2s',   label: 'Emergency Access Time',   icon: '⚡' },
  { value: '256-bit', label: 'Encryption Standard',    icon: '🛡️' },
  { value: '24/7',   label: 'QR Availability',         icon: '📱' },
];

const StatsBar = () => (
  <section
    aria-label="Platform statistics"
    className="py-12 border-y border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-950 relative overflow-hidden"
  >
    {/* Subtle gradient background */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-indigo-50/30 dark:from-blue-950/10 dark:to-indigo-950/10 pointer-events-none" />

    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x-0 lg:divide-x divide-slate-200/60 dark:divide-slate-800">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center text-center px-6 py-4 group"
          >
            <span className="text-2xl mb-2" aria-hidden="true">{stat.icon}</span>
            <dt className="text-2xl md:text-3xl font-extrabold bg-gradient-to-br from-blue-600 to-indigo-500 bg-clip-text text-transparent tabular-nums">
              {stat.value}
            </dt>
            <dd className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">
              {stat.label}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  </section>
);

export default StatsBar;
