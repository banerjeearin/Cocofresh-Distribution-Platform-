export default function Payments() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Payments</h1>
          <p className="text-xs text-slate-500">Outstanding balances and payment history</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Record Payment
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-8">

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-5 mb-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Billed (Apr)</p>
            <p className="text-3xl font-bold text-slate-900">₹1,24,800</p>
            <p className="text-xs text-slate-400 mt-1">Across 124 customers</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Collected</p>
            <p className="text-3xl font-bold text-brand-600">₹1,06,380</p>
            <p className="text-xs text-brand-600 mt-1 font-medium">↑ 85.2% recovery</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Outstanding</p>
            <p className="text-3xl font-bold text-red-500">₹18,420</p>
            <p className="text-xs text-slate-400 mt-1">18 customers</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Advance Credits</p>
            <p className="text-3xl font-bold text-indigo-500">₹4,200</p>
            <p className="text-xs text-slate-400 mt-1">3 customers prepaid</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search customer…" className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <select className="text-sm border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>All Balances</option>
            <option>Cleared</option>
            <option>Low Due (&lt;₹500)</option>
            <option>High Due (≥₹500)</option>
          </select>
          <select className="text-sm border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>April 2026</option>
            <option>March 2026</option>
          </select>
        </div>

        {/* Customers table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Billed</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Payment</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">RA</div>
                    <div><p className="font-medium">Rahul Arora</p><p className="text-xs text-slate-400">CCF-001 · Advance</p></div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">₹5,280</td>
                <td className="px-6 py-4 text-brand-600 font-medium">₹5,280</td>
                <td className="px-6 py-4 text-slate-400">₹0</td>
                <td className="px-6 py-4"><span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">✓ Cleared</span></td>
                <td className="px-6 py-4 text-xs text-slate-500">31 Mar · UPI</td>
                <td className="px-6 py-4 text-right"><button className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:border-brand-400 transition-colors">Record</button></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center">PS</div>
                    <div><p className="font-medium">Priya Sharma</p><p className="text-xs text-slate-400">CCF-002 · COD</p></div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">₹1,920</td>
                <td className="px-6 py-4 text-brand-600 font-medium">₹960</td>
                <td className="px-6 py-4 font-semibold text-red-500">₹960</td>
                <td className="px-6 py-4"><span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">⚠ High Due</span></td>
                <td className="px-6 py-4 text-xs text-slate-500">15 Mar · Cash</td>
                <td className="px-6 py-4 text-right"><button className="text-xs font-medium bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors">Record</button></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center">SG</div>
                    <div><p className="font-medium">Sunita Gupta</p><p className="text-xs text-slate-400">CCF-004 · Advance</p></div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">₹3,600</td>
                <td className="px-6 py-4 text-brand-600 font-medium">₹3,240</td>
                <td className="px-6 py-4 font-semibold text-amber-500">₹360</td>
                <td className="px-6 py-4"><span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">~ Low Due</span></td>
                <td className="px-6 py-4 text-xs text-slate-500">28 Mar · UPI</td>
                <td className="px-6 py-4 text-right"><button className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:border-brand-400 transition-colors">Record</button></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">AM</div>
                    <div><p className="font-medium">Arjun Mehta</p><p className="text-xs text-slate-400">CCF-005 · Advance</p></div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">₹6,300</td>
                <td className="px-6 py-4 text-brand-600 font-medium">₹6,300</td>
                <td className="px-6 py-4 text-slate-400">₹0</td>
                <td className="px-6 py-4"><span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">✓ Cleared</span></td>
                <td className="px-6 py-4 text-xs text-slate-500">1 Apr · Bank</td>
                <td className="px-6 py-4 text-right"><button className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:border-brand-400 transition-colors">Record</button></td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs flex items-center justify-center">NK</div>
                    <div><p className="font-medium">Neha Kapoor</p><p className="text-xs text-slate-400">CCF-006 · COD</p></div>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">₹2,640</td>
                <td className="px-6 py-4 text-brand-600 font-medium">₹0</td>
                <td className="px-6 py-4 font-semibold text-red-500">₹2,640</td>
                <td className="px-6 py-4"><span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">⚠ High Due</span></td>
                <td className="px-6 py-4 text-xs text-slate-400">—</td>
                <td className="px-6 py-4 text-right"><button className="text-xs font-medium bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-colors">Record</button></td>
              </tr>
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
            <p className="text-xs text-slate-500">Showing 5 of 124 customers</p>
            <div className="flex gap-1">
              <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors">← Prev</button>
              <button className="px-3 py-1.5 text-xs rounded-lg bg-brand-600 text-white">1</button>
              <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors">2</button>
              <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition-colors">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
