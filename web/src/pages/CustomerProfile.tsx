import { Link } from 'react-router-dom';

export default function CustomerProfile() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/customers" className="hover:text-brand-600 transition-colors">Customers</Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          <span className="text-slate-900 font-medium">Rahul Arora</span>
          <span className="text-slate-400 text-xs ml-1">CCF-001</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 transition-colors flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.134.558 4.133 1.535 5.863L0 24l6.264-1.517A11.944 11.944 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.661-.484-5.197-1.335L3 21.999l1.355-3.72A9.958 9.958 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
            WhatsApp
          </button>
          <button className="text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">Edit Customer</button>
        </div>
      </header>

      {/* Profile hero */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl shadow-sm">RA</div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Rahul Arora</h1>
              <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center gap-5 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                +91 98765 43210
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Joined 1 Apr 2026
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ₹0 outstanding
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                2 addresses
              </span>
            </div>
          </div>
          {/* Quick stats */}
          <div className="flex gap-4">
            <div className="text-center px-5 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-brand-600">22</p>
              <p className="text-xs text-slate-500 mt-0.5">Delivered</p>
            </div>
            <div className="text-center px-5 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-amber-500">2</p>
              <p className="text-xs text-slate-500 mt-0.5">Skipped</p>
            </div>
            <div className="text-center px-5 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-2xl font-bold text-slate-700">6</p>
              <p className="text-xs text-slate-500 mt-0.5">Remaining</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-5 border-t border-slate-100 pt-0 -mb-5">
          <button className="border-b-2 border-brand-600 text-brand-700 font-semibold text-sm py-4 px-1">Subscription & Deliveries</button>
          <button className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 text-sm py-4 px-1 transition-colors">Payments</button>
          <button className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 text-sm py-4 px-1 transition-colors">Addresses</button>
          <button className="border-b-2 border-transparent text-slate-500 hover:text-slate-700 text-sm py-4 px-1 transition-colors">WhatsApp Messages</button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-3 gap-6">

          {/* Subscription card (left 2 cols) */}
          <div className="col-span-2 space-y-5">

            {/* Active plan */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900">Active Plan — Home</h3>
                  <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Andheri West</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">1 Apr – 30 Apr 2026</span>
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 px-3 py-1 rounded-lg">Edit Plan</button>
                </div>
              </div>
              <div className="px-6 py-4 grid grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Morning Qty</p>
                  <p className="text-xl font-bold text-slate-900">2 <span className="text-sm font-normal text-slate-400">nuts</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Evening Qty</p>
                  <p className="text-xl font-bold text-slate-900">2 <span className="text-sm font-normal text-slate-400">nuts</span></p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Price / Nut</p>
                  <p className="text-xl font-bold text-slate-900">₹30</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Payment</p>
                  <p className="text-xl font-bold text-slate-900">Advance</p>
                </div>
              </div>
            </div>

            {/* Delivery calendar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">April 2026 Delivery Calendar</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-200 border border-brand-300 inline-block"></span>Delivered</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300 inline-block"></span>Pending</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300 inline-block"></span>Skipped</span>
                  </div>
                  <button className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 px-3 py-1 rounded-lg">Bulk Deliver Today</button>
                </div>
              </div>
              <div className="p-5">
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1.5 text-xs">
                  {/* Day headers */}
                  <div className="text-center font-semibold text-slate-400 py-1">Mon</div>
                  <div className="text-center font-semibold text-slate-400 py-1">Tue</div>
                  <div className="text-center font-semibold text-slate-400 py-1">Wed</div>
                  <div className="text-center font-semibold text-slate-400 py-1">Thu</div>
                  <div className="text-center font-semibold text-slate-400 py-1">Fri</div>
                  <div className="text-center font-semibold text-slate-400 py-1">Sat</div>
                  <div className="text-center font-semibold text-slate-400 py-1">Sun</div>

                  {/* Week 1 (Apr 1-6, padded from Tue) */}
                  <div></div>
                  {/* Day 1: delivered */}
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">1</div>
                    <div className="text-[9px] leading-tight">AM ✓</div>
                    <div className="text-[9px] leading-tight">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">2</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">3</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">4</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">5</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">6</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM —</div>
                  </div>

                  {/* Week 2 */}
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">7</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-slate-100 text-slate-500 border-slate-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">8</div>
                    <div className="text-[9px]">AM —</div>
                    <div className="text-[9px]">PM Skip</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">9</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">10</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">11</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">12</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">13</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>

                  {/* Week 3+ pending slots */}
                  <div className="bg-brand-100 text-brand-700 border-brand-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">14</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                  </div>
                  {/* TODAY = Apr 15 */}
                  <div className="bg-brand-100 text-brand-700 border-2 border-brand-500 ring-2 ring-brand-200 rounded-lg p-1.5 text-center cursor-pointer relative">
                    <div className="font-bold mb-0.5 text-brand-700">15</div>
                    <div className="text-[9px]">AM ✓</div>
                    <div className="text-[9px]">PM ✓</div>
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] bg-brand-600 text-white px-1.5 rounded-full">Today</span>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 border-yellow-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">16</div>
                    <div className="text-[9px]">AM ◷</div>
                    <div className="text-[9px]">PM ◷</div>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 border-yellow-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">17</div>
                    <div className="text-[9px]">AM ◷</div>
                    <div className="text-[9px]">PM ◷</div>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 border-yellow-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">18</div>
                    <div className="text-[9px]">AM ◷</div>
                    <div className="text-[9px]">PM ◷</div>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 border-yellow-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">19</div>
                    <div className="text-[9px]">AM ◷</div>
                    <div className="text-[9px]">PM ◷</div>
                  </div>
                  <div className="bg-yellow-100 text-yellow-800 border-yellow-200 border rounded-lg p-1.5 text-center cursor-pointer hover:opacity-80">
                    <div className="font-semibold mb-0.5">20</div>
                    <div className="text-[9px]">AM ◷</div>
                    <div className="text-[9px]">PM ◷</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5">

            {/* Payment summary */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">Payment Ledger</h3>
                <button className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1 rounded-lg hover:border-brand-400">Record Payment</button>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Billed</span>
                  <span className="font-semibold text-slate-900">₹5,280</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total Paid</span>
                  <span className="font-semibold text-brand-600">₹5,280</span>
                </div>
                <div className="h-px bg-slate-100"></div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-700">Outstanding</span>
                  <span className="font-bold text-lg text-brand-600">₹0</span>
                </div>
                <div className="mt-2 bg-brand-50 border border-brand-100 rounded-xl p-3 text-center">
                  <p className="text-xs text-brand-700 font-medium">✓ Account Cleared</p>
                </div>
              </div>
              <div className="px-5 pb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Payments</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600"><span>31 Mar 2026</span><span className="font-medium">₹5,280 — UPI</span></div>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">Delivery Addresses</h3>
                <button className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1 rounded-lg hover:border-brand-400">+ Add</button>
              </div>
              <div className="p-4 space-y-3">
                <div className="border border-brand-200 bg-brand-50/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-brand-700">🏠 Home</span>
                    <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Primary</span>
                  </div>
                  <p className="text-xs text-slate-600">Flat 4B, Andheri West, Mumbai – 400053</p>
                </div>
                <div className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700">🏢 Office</span>
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full border border-slate-200">Active</span>
                  </div>
                  <p className="text-xs text-slate-600">BKC, Bandra East, Mumbai – 400051</p>
                </div>
              </div>
            </div>

            {/* WhatsApp quick action */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm">WhatsApp Actions</h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                <button className="text-xs text-center bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl py-3 transition-colors font-medium text-slate-700">
                  📋 Invoice
                </button>
                <button className="text-xs text-center bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl py-3 transition-colors font-medium text-slate-700">
                  ⏭ Skip Ack
                </button>
                <button className="text-xs text-center bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl py-3 transition-colors font-medium text-slate-700">
                  💰 Reminder
                </button>
                <button className="text-xs text-center bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl py-3 transition-colors font-medium text-slate-700">
                  🔄 Renewal
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
