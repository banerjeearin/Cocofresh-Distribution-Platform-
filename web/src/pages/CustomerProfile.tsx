import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, updateSubscriptionEndDate } from '../services/api';
import HolidayCalendar from '../components/HolidayCalendar';
import DeliveryCalendar from '../components/DeliveryCalendar';

// ─── API calls ────────────────────────────────────────────────────────────────
const getCustomerById = async (id: string) => {
  const { data } = await api.get(`/customers/${id}`);
  return data;
};

const updateCustomerStatus = async ({ id, status }: { id: string; status: string }) => {
  const { data } = await api.put(`/customers/${id}`, { status });
  return data;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active:  'bg-brand-100 text-brand-700',
    paused:  'bg-amber-100 text-amber-700',
    churned: 'bg-red-100 text-red-600',
  };
  return map[status] ?? 'bg-slate-100 text-slate-600';
};




// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'subscription' | 'payments' | 'addresses' | 'holidays' | 'whatsapp';

// ─── Main component ───────────────────────────────────────────────────────────
export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('subscription');
  const [editingEndDate, setEditingEndDate] = useState(false);
  const [newEndDate, setNewEndDate] = useState('');
  const [endDateError, setEndDateError] = useState<string | null>(null);

  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => getCustomerById(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: updateCustomerStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const endDateMutation = useMutation({
    mutationFn: ({ subId, date }: { subId: string; date: string }) =>
      updateSubscriptionEndDate(subId, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      setEditingEndDate(false);
      setEndDateError(null);
    },
    onError: (err: any) => {
      setEndDateError(err?.response?.data?.error || 'Failed to update end date.');
    },
  });

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          <p className="text-sm text-slate-500">Loading customer profile…</p>
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-3">😕</p>
          <p className="text-slate-700 font-semibold">Customer not found</p>
          <Link to="/customers" className="text-sm text-brand-600 mt-2 inline-block">← Back to list</Link>
        </div>
      </div>
    );
  }

  // ─── Derived data ─────────────────────────────────────────────────────────
  const initials = customer.name?.substring(0, 2).toUpperCase() ?? '??';
  const activeSub = customer.subscriptions?.find((s: any) => s.status === 'active');
  const activePlan = activeSub?.plans?.[0];

  // Delivery slot stats from active subscription
  const allSlots: any[] = activeSub?.delivery_slots ?? [];
  const deliveredCount = allSlots.filter((s: any) => s.status === 'delivered').length;
  const skippedCount   = allSlots.filter((s: any) => s.status === 'skipped').length;
  const holidayCount   = allSlots.filter((s: any) => s.status === 'holiday').length;
  const pendingCount   = allSlots.filter((s: any) => s.status === 'pending').length;

  // Billing totals
  const totalBilled = customer.billing_entries?.reduce((sum: number, e: any) => sum + (e.line_amount ?? 0), 0) ?? 0;
  const totalPaid   = customer.payments?.reduce((sum: number, p: any) => sum + (p.amount ?? 0), 0) ?? 0;
  const outstanding = Math.max(0, totalBilled - totalPaid);


  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <header className="sm:h-16 py-4 sm:py-0 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-8 gap-4 sm:gap-0 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link to="/customers" className="hover:text-brand-600 transition-colors">Customers</Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          <span className="text-slate-900 font-medium">{customer.name}</span>
          <span className="text-slate-400 text-xs ml-1">{customer.customer_code}</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <a
            href={`https://wa.me/${customer.mobile?.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
            WhatsApp
          </a>

          {/* Status toggle */}
          <select
            value={customer.status}
            disabled={statusMutation.isPending}
            onChange={e => statusMutation.mutate({ id: customer.id, status: e.target.value })}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="churned">Churned</option>
          </select>
        </div>
      </header>

      {/* ── Profile Hero ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-5 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 sm:gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-2xl shadow-sm flex-shrink-0">
                {initials}
              </div>
              <div className="sm:hidden flex flex-col">
                <h1 className="text-xl font-bold text-slate-900 truncate">{customer.name}</h1>
                <span className={`text-xs w-max mt-1 font-semibold px-2.5 py-1 rounded-full capitalize ${statusBadge(customer.status)}`}>
                  {customer.status}
                </span>
              </div>
            </div>
            
            <div className="flex-1 w-full min-w-0 pt-2 sm:pt-0">
              <div className="hidden sm:flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 truncate">{customer.name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusBadge(customer.status)}`}>
                  {customer.status}
                </span>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-5 mt-1 text-xs sm:text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {customer.mobile}
                </span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  Joined {new Date(customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className={`flex items-center gap-1.5 font-medium whitespace-nowrap ${outstanding > 0 ? 'text-red-500' : 'text-brand-600'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  ₹{outstanding.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex gap-3 sm:gap-4 mt-2 sm:mt-0 flex-shrink-0">
            <div className="text-center px-2 sm:px-5 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xl sm:text-2xl font-bold text-brand-600">{deliveredCount}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">Delivered</p>
            </div>
            <div className="text-center px-2 sm:px-5 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xl sm:text-2xl font-bold text-amber-500">{skippedCount}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">Skipped</p>
            </div>
            <div className="text-center px-2 sm:px-5 py-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xl sm:text-2xl font-bold text-slate-700">{pendingCount}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">Pending</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-6 mt-5 border-t border-slate-100 -mb-5 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {([
            ['subscription', 'Subscription & Deliveries'],
            ['payments',     'Payments'],
            ['addresses',    'Addresses'],
            ['holidays',     `Holidays ${customer.holidays?.length ? `(${customer.holidays.length})` : ''}`],
            ['whatsapp',     'WhatsApp Messages'],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`border-b-2 text-sm py-4 px-1 transition-colors ${
                activeTab === key
                  ? 'border-brand-600 text-brand-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">

        {/* ─── Tab: Subscription & Deliveries ─────────────── */}
        {activeTab === 'subscription' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="col-span-1 xl:col-span-2 space-y-5">

              {/* Active plan */}
              {activeSub && activePlan ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">Active Plan — {activeSub.address?.label}</h3>
                      <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        {activeSub.address?.address_line?.split(',')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {editingEndDate ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="date"
                              value={newEndDate}
                              onChange={e => { setNewEndDate(e.target.value); setEndDateError(null); }}
                              className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <button
                              onClick={() => {
                                if (!newEndDate) return;
                                endDateMutation.mutate({ subId: activeSub.id, date: newEndDate });
                              }}
                              disabled={endDateMutation.isPending || !newEndDate}
                              className="text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50"
                            >
                              {endDateMutation.isPending ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => { setEditingEndDate(false); setEndDateError(null); }}
                              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg transition"
                            >
                              Cancel
                            </button>
                          </div>
                          {endDateError && (
                            <p className="text-[10px] text-red-600 max-w-xs text-right leading-tight">{endDateError}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(activeSub.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} –{' '}
                            {new Date(activeSub.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <button
                            onClick={() => {
                              const d = new Date(activeSub.end_date);
                              setNewEndDate(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
                              setEditingEndDate(true);
                              setEndDateError(null);
                            }}
                            title="Edit end date"
                            className="text-slate-400 hover:text-brand-600 transition p-1 rounded"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Qty / Day</p>
                      <p className="text-xl font-bold text-slate-900">{activePlan.qty_per_day ?? 1} <span className="text-sm font-normal text-slate-400">nuts</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Grade</p>
                      <p className="text-xl font-bold text-brand-700">{activePlan.grade?.label ?? <span className="text-slate-400 text-sm font-normal">—</span>}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Price / Nut</p>
                      <p className="text-xl font-bold text-slate-900">Rs.{activePlan.price_per_unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Payment</p>
                      <p className="text-xl font-bold text-slate-900 capitalize">{activeSub.payment_mode}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Holidays</p>
                      <p className="text-xl font-bold text-amber-600">{holidayCount}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
                  No active subscription found.
                </div>
              )}

              {/* Delivery calendar */}
              <DeliveryCalendar
                customerId={customer.id}
                slots={allSlots}
              />
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-5">

              {/* Payment ledger */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm">Payment Ledger</h3>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1 rounded-lg hover:border-brand-400"
                  >
                    View All
                  </button>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Billed</span>
                    <span className="font-semibold text-slate-900">₹{totalBilled.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Paid</span>
                    <span className="font-semibold text-brand-600">₹{totalPaid.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-slate-700">Outstanding</span>
                    <span className={`font-bold text-lg ${outstanding > 0 ? 'text-red-500' : 'text-brand-600'}`}>
                      ₹{outstanding.toLocaleString()}
                    </span>
                  </div>
                  <div className={`mt-2 rounded-xl p-3 text-center ${outstanding > 0 ? 'bg-red-50 border border-red-100' : 'bg-brand-50 border border-brand-100'}`}>
                    <p className={`text-xs font-medium ${outstanding > 0 ? 'text-red-600' : 'text-brand-700'}`}>
                      {outstanding > 0 ? `⚠ ₹${outstanding.toLocaleString()} due` : '✓ Account Cleared'}
                    </p>
                  </div>
                </div>

                {/* Recent payments */}
                {customer.payments?.length > 0 && (
                  <div className="px-5 pb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Payments</p>
                    <div className="space-y-2 text-xs">
                      {customer.payments.slice(0, 3).map((p: any) => (
                        <div key={p.id} className="flex justify-between text-slate-600">
                          <span>{new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span className="font-medium">₹{p.amount.toLocaleString()} — {p.payment_mode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Addresses */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 text-sm">Delivery Addresses</h3>
                </div>
                <div className="p-4 space-y-3">
                  {customer.addresses?.map((addr: any) => {
                    const isPrimary = addr.id === customer.primary_address_id;
                    return (
                      <div
                        key={addr.id}
                        className={`border rounded-xl p-3 ${isPrimary ? 'border-brand-200 bg-brand-50/40' : 'border-slate-200'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-bold ${isPrimary ? 'text-brand-700' : 'text-slate-700'}`}>
                            🏠 {addr.label}
                          </span>
                          {isPrimary && (
                            <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-medium">Primary</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">{addr.address_line}</p>
                        {addr.landmark && <p className="text-xs text-slate-400">Near {addr.landmark}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* WhatsApp quick actions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm">WhatsApp Quick Send</h3>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                  {[['📋','Invoice'],['⏭','Skip Ack'],['💰','Reminder'],['🔄','Renewal']].map(([icon, label]) => (
                    <button
                      key={label}
                      onClick={() => navigate('/whatsapp-hub')}
                      className="text-xs text-center bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-xl py-3 transition-colors font-medium text-slate-700"
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: Payments ───────────────────────────────── */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!customer.payments?.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400">No payments recorded yet.</td>
                  </tr>
                ) : customer.payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">{new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td className="px-6 py-4 font-semibold text-brand-600">₹{p.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 capitalize">{p.payment_mode}</td>
                    <td className="px-6 py-4 text-slate-500">{p.reference ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{p.recorded_by ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Tab: Addresses ──────────────────────────────── */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customer.addresses?.map((addr: any) => {
              const isPrimary = addr.id === customer.primary_address_id;
              return (
                <div key={addr.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${isPrimary ? 'border-brand-300 ring-1 ring-brand-200' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏠</span>
                      <h3 className="font-semibold text-slate-900">{addr.label}</h3>
                    </div>
                    {isPrimary && (
                      <span className="text-xs font-bold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">Primary</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700">{addr.address_line}</p>
                  {addr.landmark && <p className="text-xs text-slate-400 mt-1">Near {addr.landmark}</p>}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${addr.status === 'active' ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                      {addr.status}
                    </span>
                    <span className="text-xs text-slate-400">Added {new Date(addr.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              );
            })}
            {!customer.addresses?.length && (
              <p className="text-slate-400 text-sm col-span-2 text-center py-8">No addresses on record.</p>
            )}
          </div>
        )}

        {/* ─── Tab: Holidays ───────────────────────────────── */}
        {activeTab === 'holidays' && (
          <div className="max-w-xl">
            {customer.subscriptions?.length > 0 ? (
              <HolidayCalendar
                customerId={customer.id}
                subscriptions={customer.subscriptions ?? []}
                holidays={customer.holidays ?? []}
              />
            ) : (
              <div className="text-sm text-slate-400 text-center py-12">No subscriptions found. Holidays can only be marked against a subscription.</div>
            )}
          </div>
        )}

        {/* ─── Tab: WhatsApp Messages ──────────────────────── */}
        {activeTab === 'whatsapp' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Template</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sent At</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!customer.wa_messages?.length ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400">No WhatsApp messages sent yet.</td>
                  </tr>
                ) : customer.wa_messages.map((msg: any) => (
                  <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 capitalize font-medium">{msg.template_type}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${msg.delivery_status === 'delivered' ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'}`}>
                        {msg.delivery_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{msg.sent_at ? new Date(msg.sent_at).toLocaleString('en-IN') : '—'}</td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{msg.message_body}</td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
