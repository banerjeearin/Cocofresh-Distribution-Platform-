import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, recordPayment, getCustomers } from '../services/api';

// ─── Record Payment Modal ────────────────────────────────────────────────────
function RecordPaymentModal({
  onClose,
  preselectedCustomerId,
}: {
  onClose: () => void;
  preselectedCustomerId?: string;
}) {
  const queryClient = useQueryClient();

  const { data: customersRaw } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const customers: any[] = customersRaw?.customers ?? customersRaw ?? [];

  const [form, setForm] = useState({
    customer_id:  preselectedCustomerId ?? '',
    amount:       '',
    payment_mode: 'upi' as 'upi' | 'cash' | 'bank' | 'advance' | 'cod',
    reference:    '',
    payment_date: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: recordPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      onClose();
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.customer_id) errs.customer_id = 'Select a customer';
    if (!form.amount || parseFloat(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.payment_date) errs.payment_date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      customer_id:  form.customer_id,
      amount:       parseFloat(form.amount),
      payment_mode: form.payment_mode,
      reference:    form.reference || undefined,
      payment_date: form.payment_date,
    });
  };

  const inp = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all";
  const errInp = "w-full px-4 py-2.5 text-sm border border-red-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Record Payment</h2>
              <p className="text-brand-200 text-xs mt-0.5">Log a customer payment against their account</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {mutation.isError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            ❌ {(mutation.error as any)?.response?.data?.message ?? 'Failed to record payment.'}
          </div>
        )}

        {/* Form */}
        <div className="px-6 py-5 space-y-4">

          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Customer</label>
            <select
              value={form.customer_id}
              onChange={e => { setForm(f => ({ ...f, customer_id: e.target.value })); setErrors(er => { const n = {...er}; delete n.customer_id; return n; }); }}
              className={errors.customer_id ? errInp : inp}
            >
              <option value="">— Select customer —</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.customer_code})</option>
              ))}
            </select>
            {errors.customer_id && <p className="text-xs text-red-500 mt-1">{errors.customer_id}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">₹</span>
              <input
                type="number"
                min={1}
                value={form.amount}
                onChange={e => { setForm(f => ({ ...f, amount: e.target.value })); setErrors(er => { const n = {...er}; delete n.amount; return n; }); }}
                placeholder="0.00"
                className={`${errors.amount ? errInp : inp} pl-8`}
              />
            </div>
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
          </div>

          {/* Payment mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Payment Mode</label>
            <div className="grid grid-cols-5 gap-2">
              {(['upi', 'cash', 'bank', 'advance', 'cod'] as const).map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, payment_mode: mode }))}
                  className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all border ${
                    form.payment_mode === mode
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Reference / Transaction ID <span className="text-slate-300 font-normal normal-case">(optional)</span></label>
            <input
              type="text"
              value={form.reference}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
              placeholder="e.g. UPI-TXN-XXXXX or cheque no."
              className={inp}
            />
          </div>

          {/* Payment date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Payment Date</label>
            <input
              type="date"
              value={form.payment_date}
              onChange={e => { setForm(f => ({ ...f, payment_date: e.target.value })); setErrors(er => { const n = {...er}; delete n.payment_date; return n; }); }}
              className={errors.payment_date ? errInp : inp}
            />
            {errors.payment_date && <p className="text-xs text-red-500 mt-1">{errors.payment_date}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={mutation.isPending}
            className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                Saving…
              </>
            ) : '₹ Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Payments page ───────────────────────────────────────────────────────
export default function Payments() {
  const [showModal, setShowModal]       = useState(false);
  const [preselectedId, setPreselected] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: getPayments
  });

  const openModal = (customerId?: string) => {
    setPreselected(customerId);
    setShowModal(true);
  };

  const stats   = data?.stats ?? {};
  const payments: any[] = data?.payments ?? [];

  return (
    <>
      {showModal && (
        <RecordPaymentModal
          onClose={() => setShowModal(false)}
          preselectedCustomerId={preselectedId}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Payments</h1>
            <p className="text-xs text-slate-500">Outstanding balances and payment history</p>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Record Payment
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-5 mb-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Collected</p>
              <p className="text-3xl font-bold text-brand-600">₹{(stats.collected ?? 0).toLocaleString()}</p>
              <p className="text-xs text-brand-600 mt-1 font-medium">Recorded payments</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Outstanding (net)</p>
              <p className={`text-3xl font-bold ${(stats.outstanding ?? 0) > 0 ? 'text-red-500' : 'text-brand-600'}`}>
                ₹{(stats.outstanding ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">{stats.overdue_customers ?? 0} customers with dues</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Payment Records</p>
              <p className="text-3xl font-bold text-slate-700">{isLoading ? '…' : payments.length}</p>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </div>
          </div>

          {/* Payment history table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Payment History</h3>
              <span className="text-xs text-slate-400">{payments.length} records</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mode</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <svg className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      <p className="text-slate-400 text-xs">Loading payments…</p>
                    </td>
                  </tr>
                )}
                {!isLoading && payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-2xl mb-2">💰</p>
                      <p className="text-slate-600 font-medium">No payments recorded yet</p>
                      <p className="text-slate-400 text-xs mt-1">Click "Record Payment" to log the first one.</p>
                    </td>
                  </tr>
                )}
                {payments.map((p: any) => {
                  const name     = p.customer?.name ?? '—';
                  const initials = name.substring(0, 2).toUpperCase();
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{name}</p>
                            <p className="text-xs text-slate-400">{p.customer?.customer_code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-brand-600 text-base">₹{p.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-semibold uppercase tracking-wide bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                          {p.payment_mode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-xs font-mono">{p.reference ?? '—'}</td>
                      <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openModal(p.customer_id)}
                          className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:border-brand-400 transition-colors"
                        >
                          + Another
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
              <p className="text-xs text-slate-500">{payments.length} payment{payments.length !== 1 ? 's' : ''} recorded</p>
              <p className="text-xs font-semibold text-brand-600">
                Total: ₹{payments.reduce((s: number, p: any) => s + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
