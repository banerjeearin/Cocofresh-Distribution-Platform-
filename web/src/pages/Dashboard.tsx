import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/api';

const fmt = (n: number) =>
  '₹' + n.toLocaleString('en-IN');

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
    refetchInterval: 60_000, // auto-refresh every minute
  });

  const s = stats ?? {} as any;
  const customers  = s.customers  ?? {};
  const deliveries = s.deliveries ?? {};
  const revenue    = s.revenue    ?? {};
  const attention  = s.attention  ?? [];
  const recentPay  = s.recent_payments ?? [];
  const weekTrend  = s.week_trend ?? [];

  const completionPct = deliveries.today_total > 0
    ? Math.round((deliveries.today_done / deliveries.today_total) * 100) : 0;
  const maxTrend = Math.max(...weekTrend.map((d: any) => d.delivered), 1);

  const today = new Date();
  const todayLabel = today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Get first name from logged-in Google user
  const userName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return (user.name || 'Admin').split(' ')[0]; // first name only
    } catch { return 'Admin'; }
  })();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <svg className="w-8 h-8 text-brand-500 animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="sm:h-16 py-4 sm:py-0 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 gap-4 sm:gap-0 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{greeting}, {userName} 👋</h1>
          <p className="text-xs text-slate-500">{todayLabel} · Here's your business snapshot</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-2 text-xs text-brand-700 bg-brand-50 border border-brand-200 px-3 py-2 rounded-lg whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-brand-500 pulse inline-block"></span>
            Live data
          </div>
          <Link to="/customers/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Customer
          </Link>
        </div>
      </header>

      {/* Dashboard body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">

        {/* ── ROW 1: KPI cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {/* Total Customers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
              </div>
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{customers.total ?? '--'}</p>
            <p className="text-sm text-slate-500 mt-0.5">Total Customers</p>
            <div className="mt-3 flex gap-2 text-xs">
              <span className="text-brand-600 font-medium">{customers.active ?? 0} active</span>
              <span className="text-slate-300">·</span>
              <span className="text-amber-500 font-medium">{customers.paused ?? 0} paused</span>
            </div>
          </div>

          {/* Today's Deliveries */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 pulse inline-block"></span>
                Live
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {deliveries.today_done ?? '--'}
              <span className="text-xl text-slate-400 font-medium">/{deliveries.today_total ?? '--'}</span>
            </p>
            <p className="text-sm text-slate-500 mt-0.5">Slots Delivered Today</p>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full transition-all" style={{width: deliveries.today_total > 0 ? `${Math.round((deliveries.today_done / deliveries.today_total) * 100)}%` : '0%'}}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                <span>✅ {deliveries.today_done ?? 0} done</span>
                <span>⏳ {deliveries.today_pending ?? 0} pending</span>
                {(deliveries.today_skipped ?? 0) > 0 && <span>⊘ {deliveries.today_skipped} skipped</span>}
              </div>
            </div>
          </div>

          {/* Revenue Collected MTD */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                {today.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{fmt(revenue.mtd_collected ?? 0)}</p>
            <p className="text-sm text-slate-500 mt-0.5">Collected this month</p>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-400 to-violet-600 rounded-full" style={{width: revenue.mtd_billed > 0 ? `${Math.min(100, Math.round((revenue.mtd_collected / revenue.mtd_billed) * 100))}%` : '0%'}}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">of {fmt(revenue.mtd_billed ?? 0)} billed this month</p>
            </div>
          </div>

          {/* Outstanding */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{revenue.overdue_customers ?? 0} customers</span>
            </div>
            <p className="text-3xl font-bold text-red-600">{fmt(revenue.outstanding ?? 0)}</p>
            <p className="text-sm text-slate-500 mt-0.5">Total Outstanding</p>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{width: revenue.mtd_billed > 0 ? `${Math.min(100, Math.round((revenue.outstanding / revenue.mtd_billed) * 100))}%` : '0%'}}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                {revenue.mtd_billed > 0 ? Math.round((revenue.outstanding / revenue.mtd_billed) * 100) : 0}% of total billed outstanding
              </p>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Customer health donut — live */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-1">Customer Health</h3>
            <p className="text-xs text-slate-400 mb-5">Active · Paused · Churned</p>
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                {(() => {
                  const total = customers.total || 1;
                  const circ  = 2 * Math.PI * 52; // 326.7
                  const activeFrac  = (customers.active  || 0) / total;
                  const pausedFrac  = (customers.paused  || 0) / total;
                  const activeDash  = activeFrac * circ;
                  const pausedDash  = pausedFrac * circ;
                  const activeAngle = -90;
                  const pausedAngle = activeAngle + activeFrac * 360;
                  const activePct   = Math.round(activeFrac * 100);
                  return (
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="52" fill="none" stroke="#f1f5f9" strokeWidth="16"/>
                      <circle cx="70" cy="70" r="52" fill="none" stroke="#16a34a" strokeWidth="16"
                        strokeDasharray={`${activeDash} ${circ - activeDash}`} strokeLinecap="round"
                        style={{transform:`rotate(${activeAngle}deg)`,transformOrigin:'70px 70px'}}/>
                      <circle cx="70" cy="70" r="52" fill="none" stroke="#f59e0b" strokeWidth="16"
                        strokeDasharray={`${pausedDash} ${circ - pausedDash}`} strokeLinecap="round"
                        style={{transform:`rotate(${pausedAngle}deg)`,transformOrigin:'70px 70px'}}/>
                      <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a">{activePct}%</text>
                      <text x="70" y="82" textAnchor="middle" fontSize="10" fill="#94a3b8">Active</text>
                    </svg>
                  );
                })()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-600 inline-block"></span>Active</div>
                <span className="font-semibold text-slate-800">{customers.active ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>Paused</div>
                <span className="font-semibold text-slate-800">{customers.paused ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Churned</div>
                <span className="font-semibold text-slate-800">{customers.churned ?? 0}</span>
              </div>
            </div>
          </div>

          {/* 7-day delivery trend — live */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-800">Coconuts Delivered</h3>
                <p className="text-xs text-slate-400">Last 7 days · slots marked delivered</p>
              </div>
              <span className="text-2xl font-bold text-slate-900">
                {weekTrend.reduce((s: number, d: any) => s + d.delivered, 0)}
                <span className="text-sm font-normal text-brand-600"> this week</span>
              </span>
            </div>
            <div className="flex items-end justify-between gap-2 h-32">
              {weekTrend.map((d: any, i: number) => {
                const isToday = i === 6;
                const pct = maxTrend > 0 ? Math.round((d.delivered / maxTrend) * 100) : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end" style={{height:'100px'}}>
                      <div className="w-full rounded-md transition-all" style={{height:`${pct}%`, background: isToday ? '#16a34a' : '#4ade80', minHeight: d.delivered > 0 ? '6px' : '2px'}}></div>
                    </div>
                    <span className={`text-[10px] ${isToday ? 'font-bold text-brand-600' : 'text-slate-400'}`}>{d.label}</span>
                    <span className={`text-[10px] font-semibold ${isToday ? 'text-brand-700' : 'text-slate-600'}`}>{d.delivered}</span>
                  </div>
                );
              })}
              {weekTrend.length === 0 && <p className="text-sm text-slate-400 text-center w-full">No delivery data yet</p>}
            </div>
          </div>
        </div>

        {/* ── ROW 3: Action items + Today's route + Recent activity ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Live outstanding attention list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Outstanding Due</h3>
              {attention.length > 0 && (
                <span className="text-xs font-bold text-white bg-red-500 w-5 h-5 rounded-full flex items-center justify-center">{attention.length}</span>
              )}
            </div>
            <ul className="divide-y divide-slate-50">
              {attention.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-slate-400">
                  🎉 All customers are paid up!
                </li>
              )}
              {attention.map((a: any) => (
                <li key={a.customer_id} className="px-5 py-3 flex items-start gap-3">
                  <span className="text-lg mt-0.5">💰</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{a.name} – {fmt(a.amount_due)} due</p>
                    <p className="text-xs text-slate-400">Outstanding balance</p>
                  </div>
                  <Link to="/payments" className="text-xs text-brand-600 font-medium hover:underline flex-shrink-0">Collect →</Link>
                </li>
              ))}
              {deliveries.today_pending > 0 && (
                <li className="px-5 py-3 flex items-start gap-3">
                  <span className="text-lg mt-0.5">⏳</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{deliveries.today_pending} slots still pending</p>
                    <p className="text-xs text-slate-400">Today's route in progress</p>
                  </div>
                  <Link to="/deliveries" className="text-xs text-brand-600 font-medium hover:underline flex-shrink-0">View →</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Today's route summary — live */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Today's Route Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">{todayLabel}</p>
            </div>
            <div className="p-5 space-y-4">
              {/* Single-slot delivery progress */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-slate-700">🚚 Today's Deliveries</span>
                  <span className={`text-xs font-bold ${completionPct === 100 ? 'text-brand-600' : 'text-amber-600'}`}>{completionPct}% {completionPct === 100 ? '✓' : ''}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${completionPct === 100 ? 'bg-brand-500' : 'bg-sky-400'}`} style={{width:`${completionPct}%`}}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>{deliveries.today_total ?? 0} slots scheduled</span>
                  <span>{deliveries.today_done ?? 0} delivered</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-brand-50 rounded-xl p-2.5">
                  <p className="text-lg font-bold text-brand-600">{deliveries.today_done ?? 0}</p>
                  <p className="text-[10px] text-slate-500">Done</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2.5">
                  <p className="text-lg font-bold text-amber-600">{deliveries.today_pending ?? 0}</p>
                  <p className="text-[10px] text-slate-500">Pending</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5">
                  <p className="text-lg font-bold text-slate-500">{deliveries.today_skipped ?? 0}</p>
                  <p className="text-[10px] text-slate-500">Skipped</p>
                </div>
              </div>
              <Link to="/deliveries" className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 py-2.5 rounded-xl transition-colors">View Full Route →</Link>
            </div>
          </div>

          {/* Recent payments — live */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Recent Payments</h3>
              <span className="text-xs text-slate-400">Last 5</span>
            </div>
            <ul className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              {recentPay.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-slate-400">No payments recorded yet</li>
              )}
              {recentPay.map((p: any, i: number) => (
                <li key={i} className="px-5 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-violet-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2M12 8V7m0 9v1"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800"><strong>{p.name}</strong> paid {fmt(p.amount)}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">{p.mode} · {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── ROW 4: Quick actions ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { to: '/customers/new', color: 'brand', icon: 'M12 4v16m8-8H4', label: 'Add Customer' },
              { to: '/deliveries',    color: 'sky',   icon: 'M5 13l4 4L19 7', label: 'Mark Delivered' },
              { to: '/payments',      color: 'violet',icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2M12 8V7m0 9v1', label: 'Record Payment' },
              { to: '/invoices',      color: 'amber', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', label: 'Invoices' },
              { to: '/whatsapp',      color: 'green', icon: '', label: 'WhatsApp', isWA: true },
              { to: '/customers',     color: 'rose',  icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', label: 'Overdue List' },
            ].map(a => (
              <Link key={a.to} to={a.to} className={`flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-${a.color}-300 hover:bg-${a.color}-50 transition-colors text-center group`}>
                <div className={`w-10 h-10 rounded-xl bg-${a.color}-100 group-hover:bg-${a.color}-200 flex items-center justify-center transition-colors`}>
                  {a.isWA ? (
                    <svg className={`w-5 h-5 text-${a.color}-700`} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372C7.687 9.408 7 10.127 7 11.59c0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                  ) : (
                    <svg className={`w-5 h-5 text-${a.color}-700`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d={a.icon}/></svg>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
