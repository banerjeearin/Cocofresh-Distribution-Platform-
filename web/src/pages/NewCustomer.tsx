import { Link } from 'react-router-dom';

export default function NewCustomer() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header with breadcrumb */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/customers" className="hover:text-brand-600 transition-colors">Customers</Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          <span className="text-slate-900 font-medium">New Customer</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/customers" className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg border border-slate-200 transition-colors">Cancel</Link>
          <button className="text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded-lg transition-colors shadow-sm">Save Customer</button>
        </div>
      </header>

      {/* Steps indicator */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex-shrink-0">
        <div className="flex items-center gap-0 max-w-2xl">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">✓</div>
            <span className="text-sm font-medium text-slate-700">Personal Details</span>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-brand-500 max-w-16"></div>
          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white ring-4 ring-brand-600/20 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-sm font-semibold text-slate-900">Delivery Address</span>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-slate-200 max-w-16"></div>
          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-200 text-slate-400 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-sm text-slate-400">Subscription Plan</span>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-slate-200 max-w-16"></div>
          {/* Step 4 */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-200 text-slate-400 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <span className="text-sm text-slate-400">Review</span>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Section: Personal Details (filled in) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <h2 className="text-base font-semibold">Personal Details</h2>
              </div>
              <span className="text-xs text-brand-600 font-medium bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">✓ Complete</span>
            </div>
            <div className="px-6 py-5 grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <input type="text" defaultValue="Rahul Arora" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">WhatsApp Mobile</label>
                <input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Subscription Start Date</label>
                <input type="date" defaultValue="2026-04-07" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Payment Mode</label>
                <select className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all">
                  <option defaultValue="Advance">Advance</option>
                  <option>COD / Credit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Delivery Address (ACTIVE) */}
          <div className="bg-white rounded-2xl border border-brand-300 shadow-md ring-1 ring-brand-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <h2 className="text-base font-semibold">Delivery Address</h2>
            </div>
            <div className="px-6 py-5 space-y-5">
              {/* Address 1 */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4 relative">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white bg-brand-600 px-2 py-0.5 rounded-full">Primary</span>
                    <span className="text-sm font-semibold text-slate-700">Address 1</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Address Label</label>
                    <input type="text" placeholder="e.g. Home, Office" defaultValue="Home" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Landmark (optional)</label>
                    <input type="text" placeholder="Near landmark" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Full Address</label>
                  <input type="text" placeholder="Flat / Building / Street / Area" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
                </div>
              </div>

              {/* Add another address */}
              <button className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-medium border border-dashed border-brand-300 hover:border-brand-400 rounded-xl px-5 py-3 w-full justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
                Add another delivery address
              </button>
              <p className="text-xs text-slate-400 text-center">Each address can have its own independent subscription plan</p>
            </div>
          </div>

          {/* Section: Subscription Plan (locked/dimmed) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm opacity-50 pointer-events-none">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
              </div>
              <h2 className="text-base font-semibold text-slate-400">Subscription Plan</h2>
              <span className="text-xs text-slate-400 ml-auto">Complete address first</span>
            </div>
            <div className="px-6 py-5 grid grid-cols-3 gap-4">
              <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Delivery Slots</label>
                <div className="flex gap-2">
                  <button className="border border-brand-600 bg-brand-50 text-brand-700 rounded-lg px-3 py-2 text-xs transition-all">AM</button>
                  <button className="border border-slate-200 rounded-lg px-3 py-2 text-xs transition-all">PM</button>
                  <button className="border border-slate-200 rounded-lg px-3 py-2 text-xs transition-all">Both</button>
                </div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Morning Qty</label>
                <input type="number" placeholder="0" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
              </div>
              <div><label className="block text-xs font-semibold text-slate-400 mb-1.5">Price per Coconut (₹)</label>
                <input type="number" placeholder="0.00" className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Bottom nav */}
          <div className="flex justify-between pt-2 pb-8">
            <Link to="/customers" className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              Back to list
            </Link>
            <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2">
              Continue to Plan
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
