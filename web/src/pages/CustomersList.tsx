import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, api } from '../services/api';

// ─── Status update mutation ───────────────────────────────────────────────────
const updateStatus = async ({ id, status }: { id: string; status: string }) => {
  const { data } = await api.put(`/customers/${id}`, { status });
  return data;
};

// ─── Badge styles ─────────────────────────────────────────────────────────────
const statusBadge: Record<string, string> = {
  active:  'text-brand-700 bg-brand-100',
  paused:  'text-amber-700 bg-amber-100',
  churned: 'text-red-700 bg-red-100',
};

const avatarColors = [
  'bg-brand-100 text-brand-700',
  'bg-purple-100 text-purple-700',
  'bg-rose-100 text-rose-700',
  'bg-blue-100 text-blue-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
  'bg-indigo-100 text-indigo-700',
  'bg-green-100 text-green-700',
];

const colorFor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

// ─── Main component ───────────────────────────────────────────────────────────
export default function CustomersList() {
  const queryClient = useQueryClient();

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [paymentFilter, setPaymentFilter]   = useState('all');
  const [updatingId, setUpdatingId]         = useState<string | null>(null);

  // ── Data ────────────────────────────────────────────────────────────────────
  const { data: rawCustomers, isLoading, isError } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers,
  });

  const customers: any[] = rawCustomers?.customers ?? rawCustomers ?? [];

  const statusMutation = useMutation({
    mutationFn: updateStatus,
    onMutate: ({ id }) => setUpdatingId(id),
    onSettled: () => setUpdatingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // ── Filtered list ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter((c: any) => {
      const matchSearch  = !q || c.name.toLowerCase().includes(q) || c.mobile?.includes(q) || c.customer_code?.toLowerCase().includes(q);
      const matchStatus  = statusFilter  === 'all' || c.status === statusFilter;
      const sub          = c.subscriptions?.[0];
      const matchPayment = paymentFilter === 'all' || sub?.payment_mode === paymentFilter;
      return matchSearch && matchStatus && matchPayment;
    });
  }, [customers, search, statusFilter, paymentFilter]);

  // ── Aggregate stats ─────────────────────────────────────────────────────────
  const totalActive  = customers.filter((c: any) => c.status === 'active').length;
  const totalPaused  = customers.filter((c: any) => c.status === 'paused').length;

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Top bar */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customer Registry</h1>
          <p className="text-xs text-slate-500">Manage all your subscribers</p>
        </div>
        <Link
          to="/customers/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
          Add Customer
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto p-8">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-slate-900">{customers.length}</p>
            <p className="text-xs text-brand-600 mt-1 font-medium">Live from DB</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Active</p>
            <p className="text-3xl font-bold text-brand-600">{totalActive}</p>
            <p className="text-xs text-slate-400 mt-1">Subscribed</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Paused</p>
            <p className="text-3xl font-bold text-amber-500">{totalPaused}</p>
            <p className="text-xs text-slate-400 mt-1">Temporary hold</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Showing</p>
            <p className="text-3xl font-bold text-slate-700">{filtered.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              {search || statusFilter !== 'all' || paymentFilter !== 'all' ? 'Filtered results' : 'All customers'}
            </p>
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, mobile or code…"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>

          <select
            value={paymentFilter}
            onChange={e => setPaymentFilter(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">All Payment Modes</option>
            <option value="advance">Advance</option>
            <option value="cod">COD</option>
          </select>

          {/* Clear filters */}
          {(search || statusFilter !== 'all' || paymentFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setPaymentFilter('all'); }}
              className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-2.5 rounded-lg transition-colors"
            >
              Clear filters
            </button>
          )}
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
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">

              {/* Loading */}
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <svg className="w-6 h-6 animate-spin text-brand-500 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    <p className="text-slate-400 text-xs">Loading customers…</p>
                  </td>
                </tr>
              )}

              {/* Error */}
              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-red-500 text-sm">
                    ❌ Error loading customers. Is the backend running?
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!isLoading && !isError && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-2xl mb-2">🔍</p>
                    <p className="text-slate-600 font-medium">
                      {customers.length === 0 ? 'No customers yet' : 'No results match your filters'}
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      {customers.length === 0
                        ? 'Click "Add Customer" to create your first one.'
                        : 'Try adjusting your search or filters.'}
                    </p>
                  </td>
                </tr>
              )}

              {/* Customer rows */}
              {filtered.map((customer: any) => {
                const initials = customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                const color    = colorFor(customer.name);
                const sub      = customer.subscriptions?.[0];
                const plan     = sub?.plans?.[0];
                const totalQty = plan ? (plan.morning_qty + plan.evening_qty) : 0;
                const slotText = plan
                  ? (plan.morning_qty > 0 && plan.evening_qty > 0 ? 'Both slots'
                    : plan.morning_qty > 0 ? 'Morning only' : 'Evening only')
                  : 'No plan';
                const addressStr = customer.primary_address
                  ? `${customer.primary_address.label} · ${customer.primary_address.address_line.split(',')[0]}`
                  : '—';
                const isUpdating = updatingId === customer.id;

                return (
                  <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">

                    {/* Name + code */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${color}`}>
                          {initials}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{customer.name}</p>
                          <p className="text-xs text-slate-400">{customer.customer_code}</p>
                        </div>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="px-6 py-4">
                      <a
                        href={`https://wa.me/${customer.mobile?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 hover:text-green-600 transition-colors flex items-center gap-1.5"
                      >
                        {customer.mobile}
                        <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                      </a>
                    </td>

                    {/* Address */}
                    <td className="px-6 py-4 text-slate-600 text-xs max-w-[200px]">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        <span className="truncate">{addressStr}</span>
                      </span>
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-700 font-medium">{totalQty} nuts/slot</span>
                      <br/>
                      <span className="text-xs text-slate-400">{slotText} · ₹{plan?.price_per_unit ?? '—'}/nut</span>
                      <br/>
                      <span className="text-xs text-slate-400 capitalize">{sub?.payment_mode ?? 'N/A'}</span>
                    </td>

                    {/* Status — inline toggle */}
                    <td className="px-6 py-4">
                      <select
                        value={customer.status}
                        disabled={isUpdating}
                        onChange={e => statusMutation.mutate({ id: customer.id, status: e.target.value })}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 transition-opacity ${
                          isUpdating ? 'opacity-50' : ''
                        } ${statusBadge[customer.status] ?? 'text-slate-700 bg-slate-100'}`}
                      >
                        <option value="active">active</option>
                        <option value="paused">paused</option>
                        <option value="churned">churned</option>
                      </select>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/customers/${customer.id}`}
                          className="text-xs font-medium text-brand-600 hover:text-brand-700 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          View →
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
            <p className="text-xs text-slate-500">
              {filtered.length === customers.length
                ? `${customers.length} customer${customers.length !== 1 ? 's' : ''} total`
                : `${filtered.length} of ${customers.length} customers`}
            </p>
            {(search || statusFilter !== 'all' || paymentFilter !== 'all') && (
              <button
                onClick={() => { setSearch(''); setStatusFilter('all'); setPaymentFilter('all'); }}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
