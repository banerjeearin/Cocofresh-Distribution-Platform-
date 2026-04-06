import { Link } from 'react-router-dom';

export default function CustomersList() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customer Registry</h1>
          <p className="text-xs text-slate-500">Manage all your subscribers</p>
        </div>
        <Link to="/customers/new" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Add Customer
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-slate-900">124</p>
            <p className="text-xs text-brand-600 mt-1 font-medium">↑ 3 this month</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Active</p>
            <p className="text-3xl font-bold text-brand-600">108</p>
            <p className="text-xs text-slate-400 mt-1">87% retention</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Paused</p>
            <p className="text-3xl font-bold text-amber-500">11</p>
            <p className="text-xs text-slate-400 mt-1">Temporary hold</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Outstanding</p>
            <p className="text-3xl font-bold text-slate-900">₹18,420</p>
            <p className="text-xs text-red-500 mt-1 font-medium">6 overdue</p>
          </div>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="text" placeholder="Search by name or mobile…" className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent" />
          </div>
          <select className="text-sm border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>All Status</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Churned</option>
          </select>
          <select className="text-sm border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option>All Payment Modes</option>
            <option>Advance</option>
            <option>COD</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mobile</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Primary Address</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1 */}
              <tr className="row-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">RA</div>
                    <div>
                      <p className="font-medium text-slate-900">Rahul Arora</p>
                      <p className="text-xs text-slate-400">CCF-001</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">+91 98765 43210</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-slate-600">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    Home, Andheri West
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600">2 nuts/slot • ₹30/nut</span><br/>
                  <span className="text-xs text-slate-400">Both slots · Advance</span>
                </td>
                <td className="px-6 py-4"><span className="badge-active text-xs font-semibold px-2.5 py-1 rounded-full">Active</span></td>
                <td className="px-6 py-4 text-slate-400 text-xs">—</td>
                <td className="px-6 py-4 text-right">
                  <Link to="/customers/1" className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors">View</Link>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="row-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm">PS</div>
                    <div>
                      <p className="font-medium text-slate-900">Priya Sharma</p>
                      <p className="text-xs text-slate-400">CCF-002</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">+91 91234 56789</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    Office, Bandra BKC
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600">1 nut/slot • ₹32/nut</span><br/>
                  <span className="text-xs text-slate-400">Morning only · COD</span>
                </td>
                <td className="px-6 py-4"><span className="badge-active text-xs font-semibold px-2.5 py-1 rounded-full">Active</span></td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-red-500">₹960</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to="/customers/1" className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors">View</Link>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="row-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">MK</div>
                    <div>
                      <p className="font-medium text-slate-900">Manoj Kumar</p>
                      <p className="text-xs text-slate-400">CCF-003</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">+91 99001 22334</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    Home, Borivali East
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600">3 nuts/slot • ₹28/nut</span><br/>
                  <span className="text-xs text-slate-400">Evening only · Advance</span>
                </td>
                <td className="px-6 py-4"><span className="badge-paused text-xs font-semibold px-2.5 py-1 rounded-full">Paused</span></td>
                <td className="px-6 py-4 text-slate-400 text-xs">—</td>
                <td className="px-6 py-4 text-right">
                  <Link to="/customers/1" className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors">View</Link>
                </td>
              </tr>
              {/* Row 4 */}
              <tr className="row-hover transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 font-semibold text-sm">SG</div>
                    <div>
                      <p className="font-medium text-slate-900">Sunita Gupta</p>
                      <p className="text-xs text-slate-400">CCF-004</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">+91 88122 44556</td>
                <td className="px-6 py-4 text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                    Home, Malad West + 1 more
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-slate-600">2 nuts/slot • ₹30/nut</span><br/>
                  <span className="text-xs text-slate-400">Both slots · Advance</span>
                </td>
                <td className="px-6 py-4"><span className="badge-active text-xs font-semibold px-2.5 py-1 rounded-full">Active</span></td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-amber-600">₹360</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to="/customers/1" className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors">View</Link>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
            <p className="text-xs text-slate-500">Showing 4 of 124 customers</p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition">← Prev</button>
              <button className="px-3 py-1.5 text-xs rounded-lg bg-brand-600 text-white border border-brand-600">1</button>
              <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition">2</button>
              <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition">3</button>
              <button className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-white transition">Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
