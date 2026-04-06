export default function Deliveries() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Deliveries</h1>
          <p className="text-xs text-slate-500">Track today's routes and manage slot statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">📅 Mon, 6 Apr 2026</span>
          <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            Bulk Deliver All Today
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-900">248</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Slots Today</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-brand-600">186</p>
            <p className="text-xs text-slate-500 mt-0.5">Delivered</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-amber-500">54</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-400">8</p>
            <p className="text-xs text-slate-500 mt-0.5">Skipped</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-red-500">0</p>
            <p className="text-xs text-slate-500 mt-0.5">Missed</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Today's Completion</span>
            <span className="text-sm font-bold text-brand-600">75% (186/248)</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full" style={{width:'75%'}}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>🌅 Morning route: 100% complete</span>
            <span>🌆 Evening route: 50% complete</span>
          </div>
        </div>

        {/* Two panels: Morning & Evening */}
        <div className="grid grid-cols-2 gap-6">

          {/* Morning */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌅</span>
                <h3 className="font-semibold text-slate-900">Morning Route</h3>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">All Delivered</span>
              </div>
              <span className="text-xs text-slate-500">124 slots</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">RA</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Rahul Arora</p>
                    <p className="text-xs text-slate-400">Home · Andheri West · 2 nuts</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Delivered
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center">PS</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Priya Sharma</p>
                    <p className="text-xs text-slate-400">Office · Bandra BKC · 1 nut</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Delivered
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center">SG</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Sunita Gupta</p>
                    <p className="text-xs text-slate-400">Home · Malad West · 2 nuts</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Skipped</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">AM</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Arjun Mehta</p>
                    <p className="text-xs text-slate-400">Home · Goregaon East · 3 nuts</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Delivered
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs flex items-center justify-center">NK</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Neha Kapoor</p>
                    <p className="text-xs text-slate-400">Home · Powai · 2 nuts</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Delivered
                </span>
              </div>
              <div className="px-5 py-3 text-center text-xs text-slate-400">+ 119 more slots ↓ scroll</div>
            </div>
          </div>

          {/* Evening */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌆</span>
                <h3 className="font-semibold text-slate-900">Evening Route</h3>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">In Progress</span>
              </div>
              <span className="text-xs text-slate-500">124 slots</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">RA</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Rahul Arora</p>
                    <p className="text-xs text-slate-400">Home · Andheri West · 2 nuts</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-brand-100 hover:text-brand-700 hover:border-brand-200 transition-colors">⏳ Mark Delivered</button>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-semibold text-xs flex items-center justify-center">MK</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Manoj Kumar</p>
                    <p className="text-xs text-slate-400">Home · Borivali East · 3 nuts</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-brand-100 hover:text-brand-700 hover:border-brand-200 transition-colors">⏳ Mark Delivered</button>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center">SG</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Sunita Gupta</p>
                    <p className="text-xs text-slate-400">Home · Malad West · 2 nuts</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-full hover:bg-brand-100 hover:text-brand-700 hover:border-brand-200 transition-colors">⏳ Mark Delivered</button>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">RA</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Rahul Arora</p>
                    <p className="text-xs text-slate-400">Office · BKC · 2 nuts</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                  Delivered
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs flex items-center justify-center">NK</div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Neha Kapoor</p>
                    <p className="text-xs text-slate-400">Home · Powai · 2 nuts</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">Skipped</span>
              </div>
              <div className="px-5 py-3 text-center text-xs text-slate-400">+ 119 more slots ↓ scroll</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
