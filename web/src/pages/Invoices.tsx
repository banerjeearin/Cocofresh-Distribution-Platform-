export default function Invoices() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-xs text-slate-500">Generate and share monthly invoices</p>
        </div>
        <div className="flex gap-2">
          <select className="text-sm border border-slate-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>April 2026</option>
            <option>March 2026</option>
          </select>
          <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export All PDFs
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Customer list */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Search customer…" className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {/* Active */}
            <div className="px-4 py-3 bg-brand-50 border-l-2 border-brand-500 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">RA</div>
                  <div><p className="text-sm font-semibold text-slate-900">Rahul Arora</p><p className="text-xs text-slate-500">CCF-001 · Home</p></div>
                </div>
                <span className="text-xs font-bold text-brand-600">₹5,280</span>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center">PS</div>
                  <div><p className="text-sm font-medium text-slate-900">Priya Sharma</p><p className="text-xs text-slate-500">CCF-002 · Office</p></div>
                </div>
                <span className="text-xs font-bold text-red-500">₹960 due</span>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center">SG</div>
                  <div><p className="text-sm font-medium text-slate-900">Sunita Gupta</p><p className="text-xs text-slate-500">CCF-004 · Home</p></div>
                </div>
                <span className="text-xs font-bold text-slate-400">₹0</span>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">AM</div>
                  <div><p className="text-sm font-medium text-slate-900">Arjun Mehta</p><p className="text-xs text-slate-500">CCF-005 · Home</p></div>
                </div>
                <span className="text-xs font-bold text-slate-400">₹0</span>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs flex items-center justify-center">NK</div>
                  <div><p className="text-sm font-medium text-slate-900">Neha Kapoor</p><p className="text-xs text-slate-500">CCF-006 · Home</p></div>
                </div>
                <span className="text-xs font-bold text-red-500">₹2,640 due</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Invoice preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
          <div className="max-w-2xl mx-auto">
            {/* Action bar */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-600">Invoice Preview — Rahul Arora</h2>
              <div className="flex gap-2">
                <button className="text-sm font-medium text-slate-700 border border-slate-300 bg-white px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  Share via WhatsApp
                </button>
                <button className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                  Download PDF
                </button>
              </div>
            </div>

            {/* Invoice document */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">🥥</span>
                      <span className="text-xl font-bold">CocoFresh</span>
                    </div>
                    <p className="text-slate-400 text-sm">Coconut Subscription Distribution</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-widest">Invoice</p>
                    <p className="text-xl font-bold mt-0.5">INV-2026-04-001</p>
                    <p className="text-sm text-slate-300 mt-1">April 2026</p>
                  </div>
                </div>
              </div>

              <div className="px-8 py-6">
                {/* Customer + address */}
                <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Billed To</p>
                    <p className="font-semibold text-slate-900">Rahul Arora</p>
                    <p className="text-sm text-slate-600">+91 98765 43210</p>
                    <p className="text-sm text-slate-600 mt-1">CCF-001</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Delivery Address</p>
                    <p className="font-semibold text-slate-900">🏠 Home</p>
                    <p className="text-sm text-slate-600">Flat 4B, Andheri West</p>
                    <p className="text-sm text-slate-600">Mumbai – 400053</p>
                  </div>
                </div>

                {/* Period */}
                <div className="flex gap-6 text-sm mb-6 pb-6 border-b border-slate-100">
                  <div><span className="text-slate-500">Period:</span> <span className="font-semibold">1 Apr – 30 Apr 2026</span></div>
                  <div><span className="text-slate-500">Plan:</span> <span className="font-semibold">2 nuts/slot · Both slots · ₹30/nut</span></div>
                  <div><span className="text-slate-500">Mode:</span> <span className="font-semibold">Advance</span></div>
                </div>

                {/* Delivery log table */}
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 font-semibold">Delivery Log</p>
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="pb-2 text-xs text-slate-500 font-semibold">Date</th>
                      <th className="pb-2 text-xs text-slate-500 font-semibold">Slot</th>
                      <th className="pb-2 text-xs text-slate-500 font-semibold">Status</th>
                      <th className="pb-2 text-xs text-slate-500 font-semibold text-center">Qty</th>
                      <th className="pb-2 text-xs text-slate-500 font-semibold text-center">Rate</th>
                      <th className="pb-2 text-xs text-slate-500 font-semibold text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr><td className="py-1.5 text-slate-700">1 Apr</td><td>🌅 Morning</td><td><span className="text-xs text-brand-600 font-medium">Delivered</span></td><td className="text-center">2</td><td className="text-center">₹30</td><td className="text-right font-medium">₹60</td></tr>
                    <tr><td className="py-1.5 text-slate-700">1 Apr</td><td>🌆 Evening</td><td><span className="text-xs text-brand-600 font-medium">Delivered</span></td><td className="text-center">2</td><td className="text-center">₹30</td><td className="text-right font-medium">₹60</td></tr>
                    <tr><td className="py-1.5 text-slate-700">2 Apr</td><td>🌅 Morning</td><td><span className="text-xs text-brand-600 font-medium">Delivered</span></td><td className="text-center">2</td><td className="text-center">₹30</td><td className="text-right font-medium">₹60</td></tr>
                    <tr><td className="py-1.5 text-slate-700">2 Apr</td><td>🌆 Evening</td><td><span className="text-xs text-brand-600 font-medium">Delivered</span></td><td className="text-center">2</td><td className="text-center">₹30</td><td className="text-right font-medium">₹60</td></tr>
                    <tr><td className="py-1.5 text-slate-500 italic" colSpan={6}>… 52 more delivered slots …</td></tr>
                    <tr><td className="py-1.5 text-slate-700">8 Apr</td><td>🌆 Evening</td><td><span className="text-xs text-slate-400">Skipped</span></td><td className="text-center text-slate-400">—</td><td className="text-center text-slate-400">—</td><td className="text-right text-slate-400">₹0</td></tr>
                  </tbody>
                </table>

                {/* Totals */}
                <div className="bg-slate-50 rounded-xl p-5 space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Total Delivered Slots</span><span className="font-semibold">54 slots · 108 coconuts</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Skipped / Holiday</span><span>2 slots</span></div>
                  <div className="flex justify-between text-sm border-t border-slate-200 pt-2 mt-2"><span className="text-slate-600">Gross Amount</span><span className="font-semibold">₹5,280</span></div>
                  <div className="flex justify-between text-sm"><span className="text-slate-600">Advance Credits Applied</span><span className="text-brand-600 font-semibold">− ₹5,280</span></div>
                  <div className="flex justify-between text-base font-bold border-t border-slate-300 pt-2 mt-2"><span>Balance Due</span><span className="text-brand-600 text-lg">₹0</span></div>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">Thank you for being a CocoFresh customer! 🥥</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
