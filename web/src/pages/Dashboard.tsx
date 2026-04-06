import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardStats,
  });
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Good morning, Admin 👋</h1>
          <p className="text-xs text-slate-500">Monday, 6 April 2026 · Here's your business snapshot</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-brand-700 bg-brand-50 border border-brand-200 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-brand-500 pulse inline-block"></span>
            Live data
          </div>
          <Link to="/customers/new" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Add Customer
          </Link>
        </div>
      </header>

      {/* Dashboard body */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">

        {/* ── ROW 1: KPI cards ── */}
        <div className="grid grid-cols-4 gap-5">
          {/* Total Customers */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
              </div>
              <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">Live from DB</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.customers?.total ?? '--'}</p>
            <p className="text-sm text-slate-500 mt-0.5">Total Customers</p>
            <div className="mt-3 flex items-end gap-0.5 h-8">
              <span className="bar" style={{height:'40%'}}></span>
              <span className="bar" style={{height:'55%'}}></span>
              <span className="bar" style={{height:'50%'}}></span>
              <span className="bar" style={{height:'70%'}}></span>
              <span className="bar" style={{height:'65%'}}></span>
              <span className="bar" style={{height:'80%'}}></span>
              <span className="bar" style={{height:'100%'}}></span>
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
                Pending Data
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.deliveries?.today_done ?? '--'}<span className="text-xl text-slate-400 font-medium">/{stats?.deliveries?.today_total ?? '--'}</span></p>
            <p className="text-sm text-slate-500 mt-0.5">Slots Delivered Today</p>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-sky-400 to-sky-600 rounded-full" style={{width:'75%'}}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                <span>🌅 AM: 124/124</span>
                <span>🌆 PM: 62/124</span>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">Apr 2026</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹1,06,380</p>
            <p className="text-sm text-slate-500 mt-0.5">Collected this month</p>
            <div className="mt-3 flex items-end gap-0.5 h-8">
              <span className="bar" style={{background:'#a78bfa',height:'60%'}}></span>
              <span className="bar" style={{background:'#a78bfa',height:'75%'}}></span>
              <span className="bar" style={{background:'#a78bfa',height:'55%'}}></span>
              <span className="bar" style={{background:'#a78bfa',height:'90%'}}></span>
              <span className="bar" style={{background:'#a78bfa',height:'80%'}}></span>
              <span className="bar" style={{background:'#a78bfa',height:'100%'}}></span>
              <span className="bar" style={{background:'#a78bfa',height:'85%'}}></span>
            </div>
          </div>

          {/* Outstanding */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">18 customers</span>
            </div>
            <p className="text-3xl font-bold text-red-600">₹18,420</p>
            <p className="text-sm text-slate-500 mt-0.5">Total Outstanding</p>
            <div className="mt-3">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full" style={{width:'14.7%'}}></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">14.7% of total billed · 6 overdue &gt;30 days</p>
            </div>
          </div>
        </div>

        {/* ── ROW 2: Charts row ── */}
        <div className="grid grid-cols-3 gap-5">
          {/* Customer status donut */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-1">Customer Health</h3>
            <p className="text-xs text-slate-400 mb-5">Active · Paused · Churned</p>
            <div className="flex items-center justify-center mb-5">
              <div className="relative">
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="52" fill="none" stroke="#f1f5f9" strokeWidth="16"/>
                  <circle cx="70" cy="70" r="52" fill="none" stroke="#16a34a" strokeWidth="16"
                    strokeDasharray="283 44" strokeLinecap="round"
                    style={{transform:'rotate(-90deg)',transformOrigin:'70px 70px'}}/>
                  <circle cx="70" cy="70" r="52" fill="none" stroke="#f59e0b" strokeWidth="16"
                    strokeDasharray="29 298" strokeLinecap="round"
                    style={{transform:'rotate(246deg)',transformOrigin:'70px 70px'}}/>
                  <circle cx="70" cy="70" r="52" fill="none" stroke="#f87171" strokeWidth="16"
                    strokeDasharray="13 314" strokeLinecap="round"
                    style={{transform:'rotate(275deg)',transformOrigin:'70px 70px'}}/>
                  <text x="70" y="66" textAnchor="middle" className="text-2xl font-bold" fontSize="22" fontWeight="700" fill="#0f172a">87%</text>
                  <text x="70" y="82" textAnchor="middle" fontSize="10" fill="#94a3b8">Active</text>
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-600 inline-block"></span>Active</div>
                <span className="font-semibold text-slate-800">{stats?.customers?.active ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>Paused</div>
                <span className="font-semibold text-slate-800">{stats?.customers?.paused ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Churned</div>
                <span className="font-semibold text-slate-800">{stats?.customers?.churned ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Monthly coconuts bar chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-slate-800">Coconuts Delivered</h3>
                <p className="text-xs text-slate-400">Last 7 days · Morning & Evening</p>
              </div>
              <span className="text-2xl font-bold text-slate-900">1,428 <span className="text-sm font-normal text-brand-600">this week</span></span>
            </div>
            <div className="flex items-end justify-between gap-2 h-32">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{height:'100px'}}>
                  <div className="w-full rounded-t-md" style={{height:'55%',background:'#4ade80'}}></div>
                  <div className="w-full rounded-b-md" style={{height:'40%',background:'#bbf7d0'}}></div>
                </div>
                <span className="text-[10px] text-slate-400">Mon</span>
                <span className="text-[10px] font-semibold text-slate-600">218</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{height:'100px'}}>
                  <div className="w-full rounded-t-md" style={{height:'60%',background:'#4ade80'}}></div>
                  <div className="w-full rounded-b-md" style={{height:'38%',background:'#bbf7d0'}}></div>
                </div>
                <span className="text-[10px] text-slate-400">Tue</span>
                <span className="text-[10px] font-semibold text-slate-600">224</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{height:'100px'}}>
                  <div className="w-full rounded-t-md" style={{height:'50%',background:'#4ade80'}}></div>
                  <div className="w-full rounded-b-md" style={{height:'30%',background:'#bbf7d0'}}></div>
                </div>
                <span className="text-[10px] text-slate-400">Wed</span>
                <span className="text-[10px] font-semibold text-slate-600">192</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{height:'100px'}}>
                  <div className="w-full rounded-t-md" style={{height:'62%',background:'#4ade80'}}></div>
                  <div className="w-full rounded-b-md" style={{height:'36%',background:'#bbf7d0'}}></div>
                </div>
                <span className="text-[10px] text-slate-400">Thu</span>
                <span className="text-[10px] font-semibold text-slate-600">228</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{height:'100px'}}>
                  <div className="w-full rounded-t-md" style={{height:'58%',background:'#4ade80'}}></div>
                  <div className="w-full rounded-b-md" style={{height:'35%',background:'#bbf7d0'}}></div>
                </div>
                <span className="text-[10px] text-slate-400">Fri</span>
                <span className="text-[10px] font-semibold text-slate-600">214</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{height:'100px'}}>
                  <div className="w-full rounded-t-md" style={{height:'45%',background:'#4ade80'}}></div>
                  <div className="w-full rounded-b-md" style={{height:'28%',background:'#bbf7d0'}}></div>
                </div>
                <span className="text-[10px] text-slate-400">Sat</span>
                <span className="text-[10px] font-semibold text-slate-600">176</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5 items-center" style={{height:'100px'}}>
                  <div className="w-full rounded-t-md" style={{height:'48%',background:'#16a34a'}}></div>
                  <div className="w-full rounded-b-md" style={{height:'25%',background:'#4ade80'}}></div>
                </div>
                <span className="text-[10px] font-bold text-brand-600">Today</span>
                <span className="text-[10px] font-semibold text-brand-700">172*</span>
              </div>
            </div>
            <div className="flex gap-4 mt-3 justify-end text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-500 inline-block"></span>Morning</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-brand-200 inline-block"></span>Evening</span>
            </div>
          </div>
        </div>

        {/* ── ROW 3: Action items + Recent activity ── */}
        <div className="grid grid-cols-3 gap-5">
          {/* Urgent action items */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Needs Attention</h3>
              <span className="text-xs font-bold text-white bg-red-500 w-5 h-5 rounded-full flex items-center justify-center">4</span>
            </div>
            <ul className="divide-y divide-slate-50">
              <li className="px-5 py-3 flex items-start gap-3">
                <span className="text-lg mt-0.5">💰</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Neha Kapoor – ₹2,640 due</p>
                  <p className="text-xs text-slate-400">COD · No payment recorded yet</p>
                </div>
                <Link to="/payments" className="text-xs text-brand-600 font-medium hover:underline flex-shrink-0">Collect →</Link>
              </li>
              <li className="px-5 py-3 flex items-start gap-3">
                <span className="text-lg mt-0.5">💰</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Priya Sharma – ₹960 due</p>
                  <p className="text-xs text-slate-400">COD · Last paid 15 Mar</p>
                </div>
                <Link to="/payments" className="text-xs text-brand-600 font-medium hover:underline flex-shrink-0">Collect →</Link>
              </li>
              <li className="px-5 py-3 flex items-start gap-3">
                <span className="text-lg mt-0.5">🔄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">3 subscriptions expiring in 5 days</p>
                  <p className="text-xs text-slate-400">Send renewal reminders</p>
                </div>
                <Link to="/whatsapp-hub" className="text-xs text-brand-600 font-medium hover:underline flex-shrink-0">Send →</Link>
              </li>
              <li className="px-5 py-3 flex items-start gap-3">
                <span className="text-lg mt-0.5">⏳</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">54 evening slots still pending</p>
                  <p className="text-xs text-slate-400">Evening route in progress</p>
                </div>
                <Link to="/deliveries" className="text-xs text-brand-600 font-medium hover:underline flex-shrink-0">View →</Link>
              </li>
            </ul>
          </div>

          {/* Today's schedule summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Today's Route Summary</h3>
              <p className="text-xs text-slate-400 mt-0.5">Mon, 6 Apr 2026</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-slate-700">🌅 Morning</span>
                  <span className="text-xs font-bold text-brand-600">100% ✓</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{width:'100%'}}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>124 slots · 248 coconuts</span>
                  <span>Done</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-slate-700">🌆 Evening</span>
                  <span className="text-xs font-bold text-amber-600">50%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{width:'50%'}}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>62/124 slots done</span>
                  <span>In progress</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                <div className="bg-brand-50 rounded-xl p-2.5">
                  <p className="text-lg font-bold text-brand-600">186</p>
                  <p className="text-[10px] text-slate-500">Done</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-2.5">
                  <p className="text-lg font-bold text-amber-600">54</p>
                  <p className="text-[10px] text-slate-500">Pending</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5">
                  <p className="text-lg font-bold text-slate-500">8</p>
                  <p className="text-[10px] text-slate-500">Skipped</p>
                </div>
              </div>
              <Link to="/deliveries" className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 py-2.5 rounded-xl transition-colors">View Full Route →</Link>
            </div>
          </div>

          {/* Recent activity feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Recent Activity</h3>
              <span className="text-xs text-slate-400">Last 24h</span>
            </div>
            <ul className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
              <li className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800"><strong>Morning route</strong> completed</p>
                  <p className="text-xs text-slate-400">124/124 slots · 9:42 AM</p>
                </div>
              </li>
              <li className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800">New customer <strong>Arjun Mehta</strong> added</p>
                  <p className="text-xs text-slate-400">CCF-124 · 8:15 AM</p>
                </div>
              </li>
              <li className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-violet-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2M12 8V7m0 9v1"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800"><strong>Rahul Arora</strong> paid ₹5,280</p>
                  <p className="text-xs text-slate-400">UPI · Yesterday 10:22 PM</p>
                </div>
              </li>
              <li className="px-5 py-3 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-800"><strong>Sunita Gupta</strong> skip request</p>
                  <p className="text-xs text-slate-400">Evening slot · Yesterday 6:10 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ── ROW 4: Quick actions ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-6 gap-3">
            <Link to="/customers" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors text-center group">
              <div className="w-10 h-10 rounded-xl bg-brand-100 group-hover:bg-brand-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
              </div>
              <span className="text-xs font-medium text-slate-700">Add Customer</span>
            </Link>
            <Link to="/deliveries" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-colors text-center group">
              <div className="w-10 h-10 rounded-xl bg-sky-100 group-hover:bg-sky-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-sky-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              </div>
              <span className="text-xs font-medium text-slate-700">Mark All Delivered</span>
            </Link>
            <Link to="/payments" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50 transition-colors text-center group">
              <div className="w-10 h-10 rounded-xl bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-violet-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2M12 8V7m0 9v1"/></svg>
              </div>
              <span className="text-xs font-medium text-slate-700">Record Payment</span>
            </Link>
            <Link to="/invoices" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-colors text-center group">
              <div className="w-10 h-10 rounded-xl bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              </div>
              <span className="text-xs font-medium text-slate-700">Generate Invoices</span>
            </Link>
            <Link to="/whatsapp-hub" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors text-center group">
              <div className="w-10 h-10 rounded-xl bg-green-100 group-hover:bg-green-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372C7.687 9.408 7 10.127 7 11.59c0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
              </div>
              <span className="text-xs font-medium text-slate-700">WhatsApp Blast</span>
            </Link>
            <Link to="/customers" className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-colors text-center group">
              <div className="w-10 h-10 rounded-xl bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center transition-colors">
                <svg className="w-5 h-5 text-rose-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
              <span className="text-xs font-medium text-slate-700">Overdue List</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
