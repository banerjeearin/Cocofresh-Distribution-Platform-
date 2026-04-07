import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayments, recordPayment, getCustomers, getPaymentReceipt } from '../services/api';

// â”€â”€â”€ PDF Receipt printer (no library needed â€” browser print API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function printReceipt(receipt: any) {
  const { payment, billing_this_month, summary } = receipt;
  const c = payment.customer;
  const addr = c.addresses?.[0]?.address_line ?? '';
  const date = new Date(payment.payment_date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const monthLabel = new Date(payment.payment_date).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric'
  });
  const modeLabel: Record<string,string> = {
    upi: 'UPI', cash: 'Cash', bank: 'Bank Transfer', advance: 'Advance', cod: 'COD'
  };

  const billingRows = billing_this_month.map((b: any) => `
    <tr>
      <td>${new Date(b.delivery_date).toLocaleDateString('en-IN', { day:'numeric',month:'short' })}</td>
      <td>${b.time_band === 'morning' ? 'ðŸŒ… Morning' : 'ðŸŒ† Evening'}</td>
      <td style="text-align:center">${b.qty_delivered}</td>
      <td style="text-align:right">â‚¹${b.price_per_unit}</td>
      <td style="text-align:right">â‚¹${b.line_amount.toLocaleString()}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>LIIMRA Naturals Receipt â€“ ${c.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; color:#1e293b; background:#fff; padding:40px; font-size:13px; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #2d5016; padding-bottom:20px; margin-bottom:24px; }
    .brand { font-size:18px; font-weight:900; color:#2d5016; letter-spacing:-0.5px; }
    .brand span { color:#6abf30; }
    .brand-sub { font-size:11px; color:#64748b; margin-top:2px; }
    .receipt-no { text-align:right; }
    .receipt-no h2 { font-size:18px; font-weight:700; color:#1e293b; }
    .receipt-no p { color:#64748b; font-size:11px; margin-top:2px; }
    .customer-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; }
    .customer-box h3 { font-size:15px; font-weight:700; color:#0f172a; }
    .customer-box p { font-size:12px; color:#64748b; margin-top:3px; }
    .payment-highlight { background:linear-gradient(135deg,#2d5016,#3d7a18); color:white; border-radius:12px; padding:20px 24px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center; }
    .payment-highlight .amount { font-size:32px; font-weight:900; }
    .payment-highlight .label { font-size:12px; opacity:0.85; margin-bottom:4px; }
    .payment-highlight .meta { text-align:right; }
    .payment-highlight .meta p { font-size:12px; opacity:0.85; }
    .payment-highlight .meta strong { font-size:14px; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    thead tr { background:#f1f5f9; }
    th { text-align:left; padding:10px 12px; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.5px; }
    td { padding:9px 12px; border-bottom:1px solid #f1f5f9; font-size:12px; color:#374151; }
    .summary-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; }
    .summary-row { display:flex; justify-content:space-between; padding:6px 0; font-size:13px; }
    .summary-row.total { border-top:2px solid #e2e8f0; margin-top:8px; padding-top:10px; font-weight:700; font-size:15px; }
    .outstanding { color:${summary.net_outstanding > 0 ? '#dc2626' : '#2d5016'}; }
    .footer { margin-top:32px; border-top:1px solid #e2e8f0; padding-top:16px; text-align:center; color:#94a3b8; font-size:11px; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">LIIMRA <span>Naturals</span></div>
      <div class="brand-sub">Pure Hydration. Naturally Delivered.</div>
      <p style="margin-top:8px;font-size:11px;color:#64748b;">Mumbai, Maharashtra Â· +91 XXXXX XXXXX</p>
    </div>
    <div class="receipt-no">
      <h2>Payment Receipt</h2>
      <p>Receipt No: RCP-${payment.id.substring(0,8).toUpperCase()}</p>
      <p>Date: ${date}</p>
    </div>
  </div>

  <div class="customer-box">
    <div>
      <h3>${c.name}</h3>
      <p>${c.customer_code} Â· ${c.mobile ?? ''}</p>
      ${addr ? `<p style="margin-top:4px">${addr}</p>` : ''}
    </div>
    <div style="text-align:right">
      <p style="font-size:11px;color:#64748b">Billing Period</p>
      <p style="font-weight:600;font-size:13px">${monthLabel}</p>
    </div>
  </div>

  <div class="payment-highlight">
    <div>
      <div class="label">Amount Received</div>
      <div class="amount">â‚¹${payment.amount.toLocaleString()}</div>
    </div>
    <div class="meta">
      <p>Mode: <strong>${modeLabel[payment.payment_mode] ?? payment.payment_mode}</strong></p>
      ${payment.reference ? `<p>Ref: <strong>${payment.reference}</strong></p>` : ''}
      <p>Recorded by: Admin</p>
    </div>
  </div>

  ${billing_this_month.length > 0 ? `
  <h4 style="font-size:13px;font-weight:600;color:#374151;margin-bottom:10px">Delivery Breakdown â€” ${monthLabel}</h4>
  <table>
    <thead><tr><th>Date</th><th>Slot</th><th style="text-align:center">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${billingRows}</tbody>
  </table>` : '<p style="color:#94a3b8;font-size:12px;margin-bottom:20px">No delivery billing entries for this month yet.</p>'}

  <div class="summary-box">
    <div class="summary-row"><span>Total Billed (${monthLabel})</span><span>â‚¹${summary.month_billed.toLocaleString()}</span></div>
    <div class="summary-row"><span>Payment Received</span><span style="color:#16a34a">âˆ’â‚¹${payment.amount.toLocaleString()}</span></div>
    <div class="summary-row total">
      <span>Net Outstanding Balance</span>
      <span class="outstanding">â‚¹${summary.net_outstanding.toLocaleString()}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for choosing LIIMRA Naturals! Pure Hydration. Naturally Delivered. 🥥</p>
    <p style="margin-top:4px">This is a computer-generated receipt and does not require a signature.</p>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) { alert('Pop-up blocked â€” please allow pop-ups for this site.'); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
}

// â”€â”€â”€ Record Payment Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function RecordPaymentModal({ onClose, preselectedCustomerId }: {
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

  const inp    = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all";
  const errInp = "w-full px-4 py-2.5 text-sm border border-red-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
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

        {mutation.isError && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            âŒ {(mutation.error as any)?.response?.data?.message ?? 'Failed to record payment.'}
          </div>
        )}

        <div className="px-6 py-5 space-y-4">
          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Customer</label>
            <select
              value={form.customer_id}
              onChange={e => { setForm(f => ({ ...f, customer_id: e.target.value })); setErrors(er => { const n = {...er}; delete n.customer_id; return n; }); }}
              className={errors.customer_id ? errInp : inp}
            >
              <option value="">â€” Select customer â€”</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} ({c.customer_code})</option>
              ))}
            </select>
            {errors.customer_id && <p className="text-xs text-red-500 mt-1">{errors.customer_id}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Amount (â‚¹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">â‚¹</span>
              <input
                type="number" min={1} value={form.amount}
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
                <button key={mode} type="button"
                  onClick={() => setForm(f => ({ ...f, payment_mode: mode }))}
                  className={`py-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all border ${
                    form.payment_mode === mode
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'
                  }`}
                >{mode}</button>
              ))}
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Reference / Transaction ID <span className="text-slate-300 font-normal normal-case">(optional)</span>
            </label>
            <input type="text" value={form.reference}
              onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
              placeholder="e.g. UPI-TXN-XXXXX or cheque no."
              className={inp}
            />
          </div>

          {/* Payment date */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Payment Date</label>
            <input type="date" value={form.payment_date}
              onChange={e => { setForm(f => ({ ...f, payment_date: e.target.value })); setErrors(er => { const n = {...er}; delete n.payment_date; return n; }); }}
              className={errors.payment_date ? errInp : inp}
            />
            {errors.payment_date && <p className="text-xs text-red-500 mt-1">{errors.payment_date}</p>}
          </div>
        </div>

        <div className="px-6 pb-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 px-4 py-2 rounded-xl transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={mutation.isPending}
            className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            {mutation.isPending ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Savingâ€¦</>
            ) : 'â‚¹ Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Payment Row with PDF download â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PaymentRow({ p, onAddAnother }: { p: any; onAddAnother: () => void }) {
  const [downloading, setDownloading] = useState(false);
  const name     = p.customer?.name ?? 'â€”';
  const initials = name.substring(0, 2).toUpperCase();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const receipt = await getPaymentReceipt(p.id);
      printReceipt(receipt);
    } catch (e) {
      alert('Could not load receipt data. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const modeColor: Record<string, string> = {
    upi: 'bg-violet-100 text-violet-700',
    cash: 'bg-emerald-100 text-emerald-700',
    bank: 'bg-sky-100 text-sky-700',
    advance: 'bg-amber-100 text-amber-700',
    cod: 'bg-rose-100 text-rose-700',
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{name}</p>
            <p className="text-xs text-slate-400">{p.customer?.customer_code}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-bold text-brand-600 text-base">â‚¹{p.amount.toLocaleString()}</td>
      <td className="px-6 py-4">
        <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${modeColor[p.payment_mode] ?? 'bg-slate-100 text-slate-600'}`}>
          {p.payment_mode}
        </span>
      </td>
      <td className="px-6 py-4 text-slate-600 text-sm">
        {new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-6 py-4 text-slate-400 text-xs font-mono">{p.reference ?? 'â€”'}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Download PDF */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            title="Download PDF Receipt"
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
          >
            {downloading ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3"/></svg>
            )}
            Receipt
          </button>
          {/* Add another */}
          <button onClick={onAddAnother}
            className="text-xs font-medium text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:border-brand-400 transition-colors"
          >
            + Another
          </button>
        </div>
      </td>
    </tr>
  );
}

// â”€â”€â”€ Main Payments page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function Payments() {
  const [showModal, setShowModal]       = useState(false);
  const [preselectedId, setPreselected] = useState<string | undefined>();
  const [tab, setTab]                   = useState<'history' | 'outstanding'>('history');

  const { data, isLoading } = useQuery({ queryKey: ['payments'], queryFn: getPayments });

  const openModal = (customerId?: string) => {
    setPreselected(customerId);
    setShowModal(true);
  };

  const stats:   any   = data?.stats             ?? {};
  const payments: any[] = data?.payments          ?? [];
  const balances: any[] = data?.customer_balances ?? [];
  const overdue   = balances.filter((b: any) => b.balance > 0).sort((a: any, b: any) => b.balance - a.balance);
  const clear     = balances.filter((b: any) => b.balance <= 0);

  return (
    <>
      {showModal && (
        <RecordPaymentModal onClose={() => setShowModal(false)} preselectedCustomerId={preselectedId} />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Payments</h1>
            <p className="text-xs text-slate-500">Outstanding balances Â· payment history Â· download receipts</p>
          </div>
          <button onClick={() => openModal()}
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
            Record Payment
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">

          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-5 mb-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Collected</p>
              <p className="text-3xl font-black text-brand-600">â‚¹{(stats.collected ?? 0).toLocaleString()}</p>
              <p className="text-xs text-brand-600 mt-1 font-medium">All recorded payments</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Billed</p>
              <p className="text-3xl font-black text-slate-700">â‚¹{(stats.total_billed ?? 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-1">Based on delivered slots</p>
            </div>
            <div className={`rounded-2xl border p-5 shadow-sm ${(stats.outstanding ?? 0) > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Outstanding (net)</p>
              <p className={`text-3xl font-black ${(stats.outstanding ?? 0) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                â‚¹{(stats.outstanding ?? 0).toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">{stats.overdue_customers ?? 0} customers with dues</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Payment Records</p>
              <p className="text-3xl font-black text-slate-700">{isLoading ? 'â€¦' : payments.length}</p>
              <p className="text-xs text-slate-400 mt-1">All time</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
            {([
              { id: 'history',     label: `Payment History (${payments.length})` },
              { id: 'outstanding', label: `Outstanding (${overdue.length})` },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >{t.label}</button>
            ))}
          </div>

          {/* â”€â”€ Payment History tab â”€â”€ */}
          {tab === 'history' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <h3 className="font-semibold text-slate-900">Payment History</h3>
                <span className="text-xs text-slate-400">Hover a row to download receipt</span>
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
                    <tr><td colSpan={6} className="px-6 py-10 text-center">
                      <svg className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                      <p className="text-slate-400 text-xs">Loading paymentsâ€¦</p>
                    </td></tr>
                  )}
                  {!isLoading && payments.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-2xl mb-2">ðŸ’°</p>
                      <p className="text-slate-600 font-medium">No payments recorded yet</p>
                      <p className="text-slate-400 text-xs mt-1">Click "Record Payment" to log the first one.</p>
                    </td></tr>
                  )}
                  {payments.map((p: any) => (
                    <PaymentRow key={p.id} p={p} onAddAnother={() => openModal(p.customer_id)} />
                  ))}
                </tbody>
              </table>
              {payments.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
                  <p className="text-xs text-slate-500">{payments.length} payment{payments.length !== 1 ? 's' : ''} recorded</p>
                  <p className="text-xs font-bold text-brand-600">
                    Total: â‚¹{payments.reduce((s: number, p: any) => s + p.amount, 0).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* â”€â”€ Outstanding tab â”€â”€ */}
          {tab === 'outstanding' && (
            <div className="space-y-4">
              {overdue.length === 0 && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                  <p className="text-3xl mb-2">ðŸŽ‰</p>
                  <p className="font-semibold text-emerald-700">All customers are fully paid up!</p>
                  <p className="text-xs text-emerald-500 mt-1">No outstanding balances.</p>
                </div>
              )}

              {overdue.length > 0 && (
                <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-red-100 bg-red-50/60 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">{overdue.length}</span>
                    <h3 className="font-semibold text-red-700">Customers with Outstanding Dues</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/60">
                        <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Billed</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</th>
                        <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Balance Due</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {overdue.map((b: any) => (
                        <tr key={b.id} className="hover:bg-red-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-900">{b.name}</p>
                            <p className="text-xs text-slate-400">{b.code} Â· {b.status}</p>
                          </td>
                          <td className="px-6 py-4 text-right text-slate-600">â‚¹{b.billed.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right text-brand-600 font-medium">â‚¹{b.paid.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right font-black text-red-600 text-base">â‚¹{b.balance.toLocaleString()}</td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => openModal(b.id)}
                              className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Collect â‚¹
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-6 py-4 border-t border-red-100 bg-red-50/40 flex justify-between">
                    <span className="text-xs font-semibold text-red-700">{overdue.length} customer{overdue.length !== 1 ? 's' : ''} overdue</span>
                    <span className="text-xs font-black text-red-600">
                      Total: â‚¹{overdue.reduce((s: number, b: any) => s + b.balance, 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {clear.length > 0 && (
                <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/60">
                    <h3 className="font-semibold text-emerald-700">âœ… Fully Paid Customers ({clear.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {clear.map((b: any) => (
                      <div key={b.id} className="px-6 py-3 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-slate-700">{b.name}</p>
                          <p className="text-xs text-slate-400">{b.code}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">â‚¹{b.paid.toLocaleString()} paid</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

