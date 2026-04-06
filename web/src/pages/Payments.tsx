import { useQuery } from '@tanstack/react-query';
import { getPayments } from '../services/api';

export default function Payments() {
  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments
  });

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
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Billed</p>
            <p className="text-3xl font-bold text-slate-900">₹{data?.stats?.outstanding + data?.stats?.collected || '--'}</p>
            <p className="text-xs text-slate-400 mt-1">Overall</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Collected</p>
            <p className="text-3xl font-bold text-brand-600">₹{data?.stats?.collected ?? '--'}</p>
            <p className="text-xs text-brand-600 mt-1 font-medium">Recorded Payments</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Outstanding</p>
            <p className="text-3xl font-bold text-red-500">₹{data?.stats?.outstanding ?? '--'}</p>
            <p className="text-xs text-slate-400 mt-1">{data?.stats?.overdue_customers ?? 0} customers</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Advance Credits</p>
            <p className="text-3xl font-bold text-indigo-500">₹--</p>
            <p className="text-xs text-slate-400 mt-1">Prepaid unused limits</p>
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
        </div>

        {/* Customers table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount Paid</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">Loading payments...</td>
                </tr>
              ) : !data?.payments?.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">No recent payments recorded.</td>
                </tr>
              ) : (
                data.payments.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">
                          {payment.customer?.name?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{payment.customer?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-600">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-slate-600">{payment.mode}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold bg-brand-100 text-brand-700 px-2.5 py-1 rounded-full">✓ Verified</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{payment.reference_id || '--'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(payment.created_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
            <p className="text-xs text-slate-500">Showing {data?.payments?.length ?? 0} records</p>
          </div>
        </div>
      </div>
    </div>
  );
}
