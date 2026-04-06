import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '../services/api';

export default function CustomersList() {
  const { data: customers, isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

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
            <p className="text-3xl font-bold text-slate-900">{customers?.length || 0}</p>
            <p className="text-xs text-brand-600 mt-1 font-medium">Live from DB</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Active</p>
            <p className="text-3xl font-bold text-brand-600">
              {customers?.filter((c: any) => c.status === 'active').length || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Subscribed</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Paused</p>
            <p className="text-3xl font-bold text-amber-500">
              {customers?.filter((c: any) => c.status === 'paused').length || 0}
            </p>
            <p className="text-xs text-slate-400 mt-1">Temporary hold</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Outstanding</p>
            <p className="text-3xl font-bold text-slate-900">₹0</p>
            <p className="text-xs text-red-500 mt-1 font-medium">Requires logic</p>
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
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    Loading customers...
                  </td>
                </tr>
              )}
              
              {isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                    Error loading customers from database.
                  </td>
                </tr>
              )}

              {customers?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No customers found. Click "Add Customer" to create one.
                  </td>
                </tr>
              )}

              {customers?.map((customer: any) => {
                const initials = customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                
                // Colors based on initials string length or random just for UI consistency
                const badgeColors = {
                  'active': 'badge-active text-brand-700 bg-brand-100',
                  'paused': 'badge-paused text-amber-700 bg-amber-100',
                  'churned': 'text-red-700 bg-red-100'
                }[customer.status as string] || 'text-slate-700 bg-slate-100';

                // Get primary address safely
                const addressStr = customer.primary_address ? `${customer.primary_address.label}, ${customer.primary_address.address_line}` : 'No primary address';

                // Get active plan info safely
                const sub = customer.subscriptions && customer.subscriptions[0];
                const plan = sub?.plans && sub.plans[0];
                const totalQty = plan ? (plan.morning_qty + plan.evening_qty) : 0;
                const slotText = plan ? (plan.morning_qty > 0 && plan.evening_qty > 0 ? 'Both slots' : plan.morning_qty > 0 ? 'Morning only' : 'Evening only') : 'No Plan';

                return (
                  <tr key={customer.id} className="row-hover transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold text-sm">{initials}</div>
                        <div>
                          <p className="font-medium text-slate-900">{customer.name}</p>
                          <p className="text-xs text-slate-400">{customer.customer_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{customer.mobile}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        {addressStr}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-600">{totalQty} nuts/slot • ₹{plan?.price_per_unit || 0}/nut</span><br/>
                      <span className="text-xs text-slate-400">{slotText} · {sub?.payment_mode || 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors}`}>{customer.status}</span></td>
                    <td className="px-6 py-4 text-slate-400 text-xs">—</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/customers/${customer.id}`} className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
            <p className="text-xs text-slate-500">Showing all local customers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
