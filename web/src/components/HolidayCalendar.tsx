import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addHoliday, addHolidayRange, removeHoliday } from '../services/api';

interface Subscription {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  address?: { label: string; address_line: string };
}

interface Holiday {
  id: string;
  date: string;
  reason?: string;
  created_at: string;
  subscription_id: string;
  subscription: { id: string; start_date: string; end_date: string; status: string };
}

interface Props {
  customerId: string;
  subscriptions: Subscription[];
  holidays: Holiday[];
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function subLabel(sub: Subscription) {
  return sub.address?.label
    ? `${sub.address.label} (${fmt(sub.start_date)} – ${fmt(sub.end_date)})`
    : `Sub ${sub.id.slice(0, 6)} · ${fmt(sub.start_date)} – ${fmt(sub.end_date)}`;
}

export default function HolidayCalendar({ customerId, subscriptions, holidays }: Props) {
  const qc = useQueryClient();

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const allSubscriptions = subscriptions;

  // Subscription selection: 'all' or a specific subscription id
  const [selectedSubId, setSelectedSubId] = useState<string>(
    activeSubscriptions.length > 0 ? activeSubscriptions[0].id : (allSubscriptions[0]?.id ?? '')
  );
  const applyToAll = selectedSubId === 'all';

  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
  const showError   = (msg: string) => { setErrorMsg(msg);   setTimeout(() => setErrorMsg(''), 4000); };

  // Helper: which subscription IDs to apply to
  const targetSubIds = applyToAll
    ? activeSubscriptions.map(s => s.id)
    : (selectedSubId ? [selectedSubId] : []);

  /** Run an async action sequentially across multiple subscriptions */
  async function runForAll(fn: (subId: string) => Promise<any>) {
    const results = [];
    for (const subId of targetSubIds) {
      results.push(await fn(subId));
    }
    return results;
  }

  const addSingle = useMutation({
    mutationFn: () => runForAll(subId =>
      addHoliday({ customer_id: customerId, subscription_id: subId, date, reason: reason || undefined })
    ),
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
      const last = results[results.length - 1] as any;
      showSuccess(last?.message ?? `Holiday added to ${results.length} subscription(s)`);
      setDate(''); setReason('');
    },
    onError: (e: any) => showError(e?.response?.data?.error ?? 'Failed to add holiday'),
  });

  const addRange = useMutation({
    mutationFn: () => runForAll(subId =>
      addHolidayRange({ customer_id: customerId, subscription_id: subId, start_date: startDate, end_date: endDate, reason: reason || undefined })
    ),
    onSuccess: (results) => {
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
      const total = (results as any[]).reduce((acc, r) => acc + (r?.added ?? 0), 0);
      showSuccess(`${total} holiday(s) added across ${results.length} subscription(s)`);
      setStartDate(''); setEndDate(''); setReason('');
    },
    onError: (e: any) => showError(e?.response?.data?.error ?? 'Failed to add holiday range'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeHoliday(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
      showSuccess('Holiday removed. Subscription end date shortened by 1 day.');
    },
    onError: (e: any) => showError(e?.response?.data?.error ?? 'Failed to remove holiday'),
  });

  const canSubmit = targetSubIds.length > 0 && (
    mode === 'single' ? !!date : (!!startDate && !!endDate && endDate >= startDate)
  );
  const isPending = addSingle.isPending || addRange.isPending;

  const inp = 'block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all bg-white';

  // Get the selected subscription's current end date for display
  const selectedSub = allSubscriptions.find(s => s.id === selectedSubId);

  // Group holidays by subscription for display
  const holidaysBySubId = holidays.reduce<Record<string, Holiday[]>>((acc, h) => {
    const key = h.subscription_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(h);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Holiday Calendar</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Each holiday day added automatically extends that subscription's end date by 1 day.
            No delivery slot is created on holiday days.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {errorMsg}
        </div>
      )}

      {/* Add Holiday Form */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mark Holiday</p>

        {/* Subscription Selector */}
        {allSubscriptions.length > 0 ? (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Apply To Subscription</label>
            <select
              value={selectedSubId}
              onChange={e => setSelectedSubId(e.target.value)}
              className={inp}
            >
              {activeSubscriptions.length > 1 && (
                <option value="all">⚡ All Active Subscriptions ({activeSubscriptions.length})</option>
              )}
              {allSubscriptions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.status !== 'active' ? '⏸ ' : '✓ '}
                  {subLabel(s)}
                </option>
              ))}
            </select>
            {selectedSub && !applyToAll && (
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <span>Current end date:</span>
                <span className="font-semibold text-brand-700">{fmt(selectedSub.end_date)}</span>
                <span>· +1 day per holiday added</span>
              </p>
            )}
            {applyToAll && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mt-2">
                ⚡ Holiday will be applied to <strong>all {activeSubscriptions.length} active subscriptions</strong> and each end date will be extended accordingly.
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-slate-400 text-center py-4 bg-white rounded-lg border border-dashed border-slate-200">
            No subscriptions found for this customer.
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-1 w-fit">
          {(['single', 'range'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === m ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {m === 'single' ? 'Single Date' : 'Date Range'}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="grid grid-cols-1 gap-3">
          {mode === 'single' ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inp} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">From</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">To</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className={inp} />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Reason <span className="text-slate-400">(optional)</span></label>
            <input type="text" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Travel, Festival, Unwell..." className={inp} />
          </div>
          <button
            onClick={() => mode === 'single' ? addSingle.mutate() : addRange.mutate()}
            disabled={!canSubmit || isPending}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            {isPending ? 'Adding...' : mode === 'single' ? '+ Mark Holiday' : '+ Mark Holiday Range'}
          </button>
        </div>
      </div>

      {/* Holiday History — grouped by subscription */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Holiday History <span className="font-normal text-slate-400">({holidays.length} total)</span>
        </p>

        {holidays.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-2xl mb-1">🌴</p>
            <p className="text-sm text-slate-500">No holidays marked yet</p>
          </div>
        ) : (
          <div className="space-y-5">
            {allSubscriptions.map(sub => {
              const subHolidays = holidaysBySubId[sub.id] ?? [];
              if (subHolidays.length === 0) return null;
              return (
                <div key={sub.id}>
                  {/* Subscription Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.status === 'active' ? 'bg-brand-500' : 'bg-slate-300'}`} />
                    <p className="text-xs font-semibold text-slate-600">{subLabel(sub)}</p>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">End: <span className="font-medium text-brand-600">{fmt(sub.end_date)}</span></span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {subHolidays
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map(h => (
                        <div key={h.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-amber-300 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">🌴</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">{fmt(h.date)}</p>
                              {h.reason && <p className="text-xs text-slate-400 mt-0.5">{h.reason}</p>}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove holiday for ${fmt(h.date)}? The subscription end date will be reduced by 1 day.`)) {
                                remove.mutate(h.id);
                              }
                            }}
                            disabled={remove.isPending}
                            className="text-xs text-slate-400 hover:text-red-500 border border-transparent hover:border-red-200 px-2.5 py-1 rounded-lg transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
