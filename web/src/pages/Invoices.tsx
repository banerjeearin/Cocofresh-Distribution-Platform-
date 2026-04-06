import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getInvoices } from '../services/api';

export default function Invoices() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices
  });

  const entries = data?.entries ?? [];

  // Group entries by customer
  const customerMap = new Map<string, { customer: any; entries: any[] }>();
  for (const entry of entries) {
    const key = entry.customer_id;
    if (!customerMap.has(key)) {
      customerMap.set(key, { customer: entry.customer, entries: [] });
    }
    customerMap.get(key)!.entries.push(entry);
  }
  const customers = Array.from(customerMap.values());

  const selectedGroup = selectedId
    ? customerMap.get(selectedId)
    : customers[0] ?? null;

  const totalAmount = selectedGroup?.entries.reduce(
    (sum: number, e: any) => sum + (e.line_amount ?? 0), 0
  ) ?? 0;

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
            {isLoading && (
              <div className="p-6 text-center text-sm text-slate-400">Loading customers…</div>
            )}
            {!isLoading && customers.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">No billing entries found.<br/>Add customers to get started.</div>
            )}
            {customers.map(({ customer, entries: cEntries }) => {
              const total = cEntries.reduce((s: number, e: any) => s + (e.line_amount ?? 0), 0);
              const isActive = (selectedId ?? customers[0]?.customer?.id) === customer.id;
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedId(customer.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${isActive ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">
                        {customer.name?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm ${isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-900'}`}>{customer.name}</p>
                        <p className="text-xs text-slate-500">{customer.customer_code}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Invoice preview */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-100">
          {!selectedGroup ? (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center text-slate-400">
              <p className="text-lg">📋</p>
              <p className="text-sm mt-2">Select a customer to preview their invoice</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Action bar */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-600">Invoice Preview — {selectedGroup.customer.name}</h2>
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
                      <p className="text-xl font-bold mt-0.5">INV-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}</p>
                      <p className="text-sm text-slate-300 mt-1">April 2026</p>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6">
                  {/* Customer info */}
                  <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Billed To</p>
                      <p className="font-semibold text-slate-900">{selectedGroup.customer.name}</p>
                      <p className="text-sm text-slate-600">{selectedGroup.customer.phone}</p>
                      <p className="text-sm text-slate-600 mt-1">{selectedGroup.customer.customer_code}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-400 mb-2 font-semibold">Delivery Address</p>
                      <p className="font-semibold text-slate-900">🏠 {selectedGroup.entries[0]?.address?.label ?? '--'}</p>
                      <p className="text-sm text-slate-600">{selectedGroup.entries[0]?.address?.line1 ?? ''}</p>
                      <p className="text-sm text-slate-600">{selectedGroup.entries[0]?.address?.city ?? ''}</p>
                    </div>
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
                      {selectedGroup.entries.map((entry: any) => (
                        <tr key={entry.id}>
                          <td className="py-1.5 text-slate-700">{new Date(entry.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                          <td>{entry.time_band === 'morning' ? '🌅 Morning' : '🌆 Evening'}</td>
                          <td>
                            <span className={`text-xs font-medium ${entry.delivery_status === 'delivered' ? 'text-brand-600' : 'text-slate-400'}`}>
                              {entry.delivery_status === 'delivered' ? 'Delivered' : 'Skipped'}
                            </span>
                          </td>
                          <td className="text-center">{entry.qty_delivered ?? '—'}</td>
                          <td className="text-center">₹{entry.rate_per_unit ?? '—'}</td>
                          <td className="text-right font-medium">₹{entry.line_amount ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="bg-slate-50 rounded-xl p-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total Billing Entries</span>
                      <span className="font-semibold">{selectedGroup.entries.length} slots</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t border-slate-300 pt-2 mt-2">
                      <span>Total Amount</span>
                      <span className="text-brand-600 text-lg">₹{totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <p className="text-center text-xs text-slate-400 mt-6">Thank you for being a CocoFresh customer! 🥥</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
