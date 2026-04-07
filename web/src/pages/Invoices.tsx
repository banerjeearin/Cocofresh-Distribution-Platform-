import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../services/api';

// Generate last 12 months for the selector
function getMonthOptions() {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      label: d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      year:  d.getFullYear(),
      month: d.getMonth() + 1,
    });
  }
  return options;
}

// Invoice PDF printer
function printInvoice(customer: any, entries: any[], paymentInfo: any, period: { year: number; month: number }) {
  const logoUrl = `${window.location.origin}/liimra-logo.png`;
  const monthLabel = new Date(period.year, period.month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const totalBilled = entries.reduce((s: number, e: any) => s + (e.line_amount ?? 0), 0);
  const invoiceNo = `INV-${period.year}-${String(period.month).padStart(2, '0')}-${customer.customer_code}`;
  const outstanding = Math.max(0, (paymentInfo?.total_billed ?? 0) - (paymentInfo?.total_paid ?? 0));

  const rows = entries.map((e: any) => `
    <tr>
      <td>${new Date(e.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
      <td style="text-align:center">${e.qty_delivered ?? 0}</td>
      <td style="text-align:right">Rs.${e.price_per_unit}</td>
      <td style="text-align:right">Rs.${(e.line_amount ?? 0).toLocaleString()}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>LIIMRA Naturals Invoice - ${customer.name} - ${monthLabel}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; color:#1e293b; background:#fff; padding:40px; font-size:13px; }
    .header { background:linear-gradient(135deg,#2d5016,#3d7a18); color:white; padding:28px 32px; border-radius:12px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-start; }
    .brand { font-size:22px; font-weight:900; letter-spacing:-0.5px; }
    .brand span { color:#96cc52; }
    .brand-sub { font-size:11px; color:#c0e094; margin-top:3px; }
    .brand-addr { font-size:10px; color:#c0e094; margin-top:5px; line-height:1.5; max-width:280px; }
    .brand-gst  { font-size:10px; color:#96cc52; margin-top:3px; font-weight:600; }
    .inv-no h2 { font-size:13px; font-weight:700; text-align:right; }
    .inv-no p  { font-size:11px; color:#c0e094; text-align:right; margin-top:3px; }
    .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
    .box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; }
    .box h4 { font-size:10px; text-transform:uppercase; letter-spacing:.5px; color:#64748b; font-weight:600; margin-bottom:8px; }
    .box p  { font-size:13px; font-weight:600; color:#0f172a; }
    .box .sub { font-size:11px; color:#64748b; font-weight:400; margin-top:2px; }
    table { width:100%; border-collapse:collapse; margin-bottom:20px; }
    th { text-align:left; padding:10px 12px; font-size:10px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:.5px; background:#f1f5f9; }
    td { padding:9px 12px; border-bottom:1px solid #f1f5f9; font-size:12px; }
    .totals { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px 20px; }
    .row { display:flex; justify-content:space-between; padding:5px 0; font-size:13px; }
    .row.grand { border-top:2px solid #e2e8f0; margin-top:8px; padding-top:10px; font-weight:800; font-size:16px; }
    .outstanding { color:${outstanding > 0 ? '#dc2626' : '#2d5016'}; }
    .footer { margin-top:32px; text-align:center; color:#94a3b8; font-size:11px; border-top:1px solid #e2e8f0; padding-top:16px; }
    @media print { body { padding:20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div style="display:flex;align-items:center;gap:14px">
      <div style="background:white;border-radius:10px;padding:6px 10px;display:inline-flex;align-items:center;">
        <img src="${logoUrl}" style="height:44px;width:auto;object-fit:contain;" />
      </div>
      <div>
        <div class="brand-sub">Pure Hydration. Naturally Delivered.</div>
        <div class="brand-addr">314, Niharika Miraje, Plot No 274, Kharghar,<br>Sector-10, Navi Mumbai, Maharashtra - 410210</div>
        <div class="brand-gst">GSTIN: 27AAIFL8311R1ZO</div>
      </div>
    </div>
    <div class="inv-no">
      <h2>TAX INVOICE</h2>
      <p>${invoiceNo}</p>
      <p>${monthLabel}</p>
    </div>
  </div>

  <div class="grid2">
    <div class="box">
      <h4>Billed To</h4>
      <p>${customer.name}</p>
      <p class="sub">${customer.customer_code} &middot; ${customer.mobile ?? ''}</p>
      <p class="sub">${entries[0]?.address?.address_line ?? ''}</p>
    </div>
    <div class="box">
      <h4>Invoice Summary</h4>
      <p>Period: ${monthLabel}</p>
      <p class="sub">${entries.length} delivery entries</p>
      <p class="sub">Generated: ${new Date().toLocaleDateString('en-IN')}</p>
    </div>
  </div>

  <h4 style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">Delivery Log</h4>
  <table>
    <thead><tr>
      <th>Date</th>
      <th style="text-align:center">Qty</th>
      <th style="text-align:right">Rate</th>
      <th style="text-align:right">Amount</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="row"><span>Total Deliveries</span><span>${entries.length} slots</span></div>
    <div class="row"><span>Total Billed (this month)</span><span>Rs. ${totalBilled.toLocaleString()}</span></div>
    <div class="row"><span>Total Paid (all time)</span><span style="color:#2d5016">Rs. ${(paymentInfo?.total_paid ?? 0).toLocaleString()}</span></div>
    <div class="row grand">
      <span>Net Outstanding</span>
      <span class="outstanding">Rs. ${outstanding.toLocaleString()}</span>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for choosing LIIMRA Naturals! Pure Hydration. Naturally Delivered.</p>
    <p style="margin-top:4px">This is a computer-generated invoice. For queries contact us on WhatsApp: 9321731372</p>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=950');
  if (!win) { alert('Pop-up blocked — please allow pop-ups for this site.'); return; }
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.focus(); win.print(); };
}

// WhatsApp share
function whatsappShare(customer: any, totalBilled: number, outstanding: number, period: { year: number; month: number }) {
  const monthLabel = new Date(period.year, period.month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const msg = encodeURIComponent(
    `*LIIMRA Naturals Invoice - ${monthLabel}*\n\n` +
    `Dear ${customer.name},\n\n` +
    `Your LIIMRA Naturals invoice for *${monthLabel}* is ready.\n\n` +
    `Total Billed: *Rs. ${totalBilled.toLocaleString()}*\n` +
    `Outstanding: *Rs. ${outstanding.toLocaleString()}*\n\n` +
    `Please pay at your earliest convenience.\n\n` +
    `_Pure Hydration. Naturally Delivered._\n` +
    `LIIMRA Naturals | WhatsApp: 9321731372`
  );
  const mobile = (customer.mobile ?? '').replace(/\D/g, '');
  const url = mobile
    ? `https://wa.me/91${mobile}?text=${msg}`
    : `https://wa.me/?text=${msg}`;
  window.open(url, '_blank');
}

// Main Invoices page
export default function Invoices() {
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { year, month } = monthOptions[selectedMonth];

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', year, month],
    queryFn: () => getInvoices(year, month),
  });

  const entries:    any[]  = data?.entries    ?? [];
  const paymentMap: any    = data?.paymentMap ?? {};
  const period             = data?.period     ?? { year, month };

  const customerMap = useMemo(() => {
    const map = new Map<string, { customer: any; entries: any[] }>();
    for (const e of entries) {
      if (!map.has(e.customer_id)) map.set(e.customer_id, { customer: e.customer, entries: [] });
      map.get(e.customer_id)!.entries.push(e);
    }
    return map;
  }, [entries]);

  const allCustomers = Array.from(customerMap.values());
  const filtered = allCustomers.filter(({ customer }) =>
    !search ||
    customer.name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.customer_code?.toLowerCase().includes(search.toLowerCase())
  );

  const activeId = selectedCustomerId ?? filtered[0]?.customer?.id ?? null;
  const selectedGroup = activeId ? customerMap.get(activeId) : null;

  const totalBilled = selectedGroup?.entries.reduce((s: number, e: any) => s + (e.line_amount ?? 0), 0) ?? 0;
  const payInfo     = activeId ? paymentMap[activeId] : null;
  const outstanding = Math.max(0, (payInfo?.total_billed ?? 0) - (payInfo?.total_paid ?? 0));
  const invoiceNo   = selectedGroup
    ? `INV-${period.year}-${String(period.month).padStart(2, '0')}-${selectedGroup.customer.customer_code}`
    : '';

  const handleExportAll = () => {
    filtered.forEach(({ customer, entries: cEntries }, i) => {
      setTimeout(() => {
        const pInfo = paymentMap[customer.id];
        printInvoice(customer, cEntries, pInfo, period);
      }, i * 800);
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Invoices</h1>
          <p className="text-xs text-slate-500">Generate, preview and share monthly invoices</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={selectedMonth}
            onChange={e => { setSelectedMonth(Number(e.target.value)); setSelectedCustomerId(null); }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-600"
          >
            {monthOptions.map((o, i) => (
              <option key={i} value={i}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={handleExportAll}
            disabled={filtered.length === 0 || isLoading}
            className="bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            Export All ({filtered.length})
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Customer list */}
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                type="text"
                placeholder="Search customer..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {isLoading && <div className="p-6 text-center text-sm text-slate-400">Loading...</div>}
            {!isLoading && filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                No billing entries for this month.<br />Deliver some slots first!
              </div>
            )}
            {filtered.map(({ customer, entries: cEntries }) => {
              const total = cEntries.reduce((s: number, e: any) => s + (e.line_amount ?? 0), 0);
              const pInfo  = paymentMap[customer.id];
              const bal    = Math.max(0, (pInfo?.total_billed ?? 0) - (pInfo?.total_paid ?? 0));
              const isActive = (activeId === customer.id);
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${isActive ? 'bg-brand-50 border-l-2 border-brand-600' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {customer.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm ${isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-800'}`}>{customer.name}</p>
                        <p className="text-xs text-slate-400">{customer.customer_code} · {cEntries.length} entries</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-brand-700">Rs. {total.toLocaleString()}</p>
                      {bal > 0 && <p className="text-[10px] text-red-500 font-medium">Rs. {bal.toLocaleString()} due</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/40">
              <p className="text-xs text-slate-500">
                {filtered.length} customer{filtered.length !== 1 ? 's' : ''} · Rs. {filtered.reduce((s, { entries: e }) => s + e.reduce((ss: number, x: any) => ss + (x.line_amount ?? 0), 0), 0).toLocaleString()} total
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Invoice preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
          {!selectedGroup ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center text-slate-400">
              <p className="text-3xl mb-3">📋</p>
              <p className="font-medium text-slate-600">Select a customer to preview their invoice</p>
              <p className="text-sm mt-1">Or use "Export All" to generate all at once</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Action bar */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-700">Invoice Preview — {selectedGroup.customer.name}</h2>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{invoiceNo}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => whatsappShare(selectedGroup.customer, totalBilled, outstanding, period)}
                    className="text-sm font-medium text-slate-700 border border-slate-300 bg-white px-4 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372C7.687 9.408 7 10.127 7 11.59c0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                    Share via WhatsApp
                  </button>
                  <button
                    onClick={() => printInvoice(selectedGroup.customer, selectedGroup.entries, payInfo, period)}
                    className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-2 transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Invoice document */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-800 to-brand-700 px-8 py-6 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-9 h-9 rounded-full bg-brand-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-brand-900 font-black text-sm">LN</span>
                        </div>
                        <div>
                          <p className="font-black text-xl text-white leading-none tracking-tight">LIIMRA</p>
                          <p className="text-[9px] font-bold text-brand-300 tracking-[0.25em] leading-tight">NATURALS</p>
                        </div>
                      </div>
                      <p className="text-brand-200 text-xs">Pure Hydration. Naturally Delivered.</p>
                      <p className="text-brand-300 text-[10px] mt-1.5 leading-relaxed">
                        314, Niharika Miraje, Plot No 274, Kharghar,<br />
                        Sector-10, Navi Mumbai, Maharashtra - 410210
                      </p>
                      <p className="text-brand-400 text-[10px] mt-1 font-semibold">GSTIN: 27AAIFL8311R1ZO</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-brand-300 uppercase tracking-widest">Tax Invoice</p>
                      <p className="text-base font-bold mt-1 font-mono">{invoiceNo}</p>
                      <p className="text-sm text-brand-200 mt-1">
                        {new Date(period.year, period.month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6">
                  {/* Customer + address */}
                  <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Billed To</p>
                      <p className="font-semibold text-slate-900">{selectedGroup.customer.name}</p>
                      <p className="text-sm text-slate-500 mt-1">{selectedGroup.customer.mobile}</p>
                      <p className="text-sm text-slate-500">{selectedGroup.customer.customer_code}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Delivery Address</p>
                      <p className="font-semibold text-slate-900">🏠 {selectedGroup.entries[0]?.address?.label ?? '—'}</p>
                      <p className="text-sm text-slate-500 mt-1">{selectedGroup.entries[0]?.address?.address_line ?? ''}</p>
                    </div>
                  </div>

                  {/* Delivery log */}
                  <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 font-semibold">Delivery Log</p>
                  <table className="w-full text-sm mb-6">
                    <thead>
                      <tr className="text-left border-b border-slate-100 bg-slate-50/60">
                        <th className="py-2 px-1 text-xs text-slate-500 font-semibold">Date</th>
                        <th className="py-2 px-1 text-xs text-slate-500 font-semibold text-center">Qty</th>
                        <th className="py-2 px-1 text-xs text-slate-500 font-semibold text-center">Rate</th>
                        <th className="py-2 px-1 text-xs text-slate-500 font-semibold text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedGroup.entries.map((e: any) => (
                        <tr key={e.id} className="hover:bg-slate-50/60">
                          <td className="py-2 px-1 text-slate-700">
                            {new Date(e.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-2 px-1 text-center font-medium">{e.qty_delivered ?? 0}</td>
                          <td className="py-2 px-1 text-center text-slate-500">Rs. {e.price_per_unit}</td>
                          <td className="py-2 px-1 text-right font-semibold text-brand-700">Rs. {(e.line_amount ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-xl p-5 space-y-2">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Total Deliveries</span>
                      <span className="font-medium">{selectedGroup.entries.length} slots</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Total Paid (all time)</span>
                      <span className="font-medium text-brand-700">Rs. {(payInfo?.total_paid ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-slate-200 pt-3 mt-2">
                      <span>Total This Month</span>
                      <span className="text-brand-700 text-lg">Rs. {totalBilled.toLocaleString()}</span>
                    </div>
                    {outstanding > 0 && (
                      <div className="flex justify-between text-sm font-bold text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-2">
                        <span>Outstanding Balance</span>
                        <span>Rs. {outstanding.toLocaleString()}</span>
                      </div>
                    )}
                    {outstanding === 0 && (payInfo?.total_paid ?? 0) > 0 && (
                      <div className="flex justify-between text-sm font-bold text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mt-2">
                        <span>Fully Paid Up</span>
                        <span>No outstanding balance</span>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-xs text-slate-400 mt-6">
                    Thank you for choosing LIIMRA Naturals! Pure Hydration. Naturally Delivered.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
