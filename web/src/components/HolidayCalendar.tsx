import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addHoliday, addHolidayRange, removeHoliday } from '../services/api';

interface Holiday {
  id: string;
  date: string;
  reason?: string;
  created_at: string;
  subscription: { id: string; start_date: string; end_date: string; status: string };
}

interface Props {
  customerId: string;
  subscriptionId: string;
  subscriptionEndDate: string;
  holidays: Holiday[];
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function HolidayCalendar({ customerId, subscriptionId, subscriptionEndDate, holidays }: Props) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000); };
  const showError   = (msg: string) => { setErrorMsg(msg);   setTimeout(() => setErrorMsg(''), 4000); };

  const addSingle = useMutation({
    mutationFn: () => addHoliday({ customer_id: customerId, subscription_id: subscriptionId, date, reason: reason || undefined }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
      showSuccess(res.message ?? 'Holiday added');
      setDate(''); setReason('');
    },
    onError: (e: any) => showError(e?.response?.data?.error ?? 'Failed to add holiday'),
  });

  const addRange = useMutation({
    mutationFn: () => addHolidayRange({ customer_id: customerId, subscription_id: subscriptionId, start_date: startDate, end_date: endDate, reason: reason || undefined }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
      showSuccess(res.message ?? 'Holidays added');
      setStartDate(''); setEndDate(''); setReason('');
    },
    onError: (e: any) => showError(e?.response?.data?.error ?? 'Failed to add holiday range'),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeHoliday(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customer', customerId] }),
    onError: (e: any) => showError(e?.response?.data?.error ?? 'Failed to remove holiday'),
  });

  const canSubmit = mode === 'single' ? !!date : (!!startDate && !!endDate && endDate >= startDate);
  const isPending = addSingle.isPending || addRange.isPending;

  const inp = 'block w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all bg-white';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">Holiday Calendar</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Subscription end date: <span className="font-semibold text-brand-700">{fmt(subscriptionEndDate)}</span>
            {' '}· Extended +1 day per holiday added
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
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Mark Holiday</p>

        {/* Mode selector */}
        <div className="flex gap-1 bg-white rounded-lg border border-slate-200 p-1 mb-4 w-fit">
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
            {isPending ? 'Adding...' : mode === 'single' ? '+ Mark Holiday' : `+ Mark Holiday Range`}
          </button>
        </div>
      </div>

      {/* Holiday List */}
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
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {holidays.map((h) => (
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
                  onClick={() => { if (window.confirm(`Remove holiday for ${fmt(h.date)}? The subscription end date will be reduced by 1 day.`)) remove.mutate(h.id); }}
                  disabled={remove.isPending}
                  className="text-xs text-slate-400 hover:text-red-500 border border-transparent hover:border-red-200 px-2.5 py-1 rounded-lg transition-all"
                  title="Remove holiday"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
