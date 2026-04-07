import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeliveries, markDeliverySlot, bulkDeliverAll } from '../services/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const toDateStr = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"
const todayStr  = () => toDateStr(new Date());

// ─── Status badge ─────────────────────────────────────────────────────────────
const badgeCls = (status: string) => {
  if (status === 'delivered') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (status === 'pending')   return 'bg-amber-100  text-amber-700  border border-amber-200';
  if (status === 'skipped')   return 'bg-slate-100  text-slate-500  border border-slate-200';
  if (status === 'missed')    return 'bg-red-100    text-red-600    border border-red-200';
  return 'bg-slate-100 text-slate-500';
};

// ─── Individual Slot Row ──────────────────────────────────────────────────────
function SlotRow({ slot, onMark, isUpdating }: {
  slot: any;
  onMark: (id: string, action: 'delivered' | 'skipped', qty?: number) => void;
  isUpdating: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [qty, setQty] = useState<number>(slot.qty_ordered);
  const [undoing, setUndoing] = useState(false);

  const customer  = slot.subscription?.customer;
  const name      = customer?.name ?? '—';
  const initials  = name.substring(0, 2).toUpperCase();

  // Grade: slot override → subscription plan grade → subscription plan price
  const effectiveGrade = slot.grade ?? slot.subscription?.plans?.[0]?.grade ?? null;
  const price = effectiveGrade?.price_per_unit
    ?? slot.subscription?.plans?.[0]?.price_per_unit
    ?? slot.price_at_delivery
    ?? 70;
  const gradeLabel = effectiveGrade?.label ?? null;

  const isDelivered = slot.status === 'delivered';
  const isSkipped   = slot.status === 'skipped';
  const isPending   = slot.status === 'pending';

  const handleConfirmDeliver = () => {
    onMark(slot.id, 'delivered', qty);
    setConfirming(false);
  };

  return (
    <div className={`border-b border-slate-50 last:border-0 transition-all ${
      isDelivered ? 'bg-emerald-50/40' : isSkipped ? 'bg-slate-50/60' : 'bg-white hover:bg-amber-50/20'
    }`}>

      {/* ── Top row: Avatar + Name + Grade badge + Qty badge ── */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-1">

        {/* Avatar */}
        <div className={`w-9 h-9 rounded-full font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-sm ${
          isDelivered ? 'bg-emerald-200 text-emerald-800' :
          isSkipped   ? 'bg-slate-200 text-slate-600'    :
                        'bg-brand-100 text-brand-700'
        }`}>
          {initials}
        </div>

        {/* Name + address */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold leading-tight ${isDelivered ? 'text-slate-500 line-through decoration-slate-300' : isSkipped ? 'text-slate-400' : 'text-slate-900'}`}>
              {name}
            </p>
            {/* Grade badge */}
            {gradeLabel && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 border border-brand-200 flex-shrink-0">
                {gradeLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{slot.address?.label ?? 'Home'}</p>
        </div>

        {/* Qty pill */}
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-black text-base flex-shrink-0 ${
          isDelivered ? 'bg-emerald-100 text-emerald-700' :
          isSkipped   ? 'bg-slate-100 text-slate-400'    :
                        'bg-amber-100 text-amber-700'
        }`}>
          {isDelivered ? (slot.qty_delivered ?? slot.qty_ordered) : slot.qty_ordered}
          <span className="text-sm">🥥</span>
        </div>
      </div>

      {/* ── Bottom row: amount + status + actions ── */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-1">

        {/* Amount */}
        <span className={`text-xs font-semibold mr-auto ${isDelivered ? 'text-emerald-600' : 'text-slate-500'}`}>
          Rs. {(isDelivered ? (slot.qty_delivered ?? slot.qty_ordered) : slot.qty_ordered) * price}
          <span className="font-normal text-slate-400"> @Rs. {price}</span>
        </span>

        {/* Status badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${badgeCls(slot.status)}`}>
          {slot.status}
        </span>

        {/* Action buttons */}
        {isPending && !confirming && (
          <>
            <button
              disabled={isUpdating}
              onClick={() => { setQty(slot.qty_ordered); setConfirming(true); }}
              className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 active:scale-95 disabled:opacity-50 disabled:cursor-wait text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              Deliver
            </button>
            <button
              disabled={isUpdating}
              onClick={() => onMark(slot.id, 'skipped')}
              className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-all"
            >
              Skip
            </button>
          </>
        )}

        {isSkipped && (
          <button
            disabled={isUpdating}
            onClick={() => { setQty(slot.qty_ordered); setConfirming(true); }}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 border border-brand-200 bg-brand-50 px-3 py-1.5 rounded-lg transition-all"
          >
            ↩ Restore
          </button>
        )}

        {isDelivered && !undoing && (
          <button
            onClick={() => setUndoing(true)}
            className="text-[11px] text-slate-300 hover:text-red-400 border border-slate-100 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-all"
            title="Undo"
          >
            Undo
          </button>
        )}

        {isDelivered && undoing && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-red-500">Undo?</span>
            <button
              disabled={isUpdating}
              onClick={() => { onMark(slot.id, 'skipped'); setUndoing(false); }}
              className="text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2 py-1 rounded-md"
            >Yes</button>
            <button onClick={() => setUndoing(false)} className="text-[11px] text-slate-500 border border-slate-200 px-2 py-1 rounded-md">No</button>
          </div>
        )}
      </div>

      {/* ── Inline quantity confirm panel ── */}
      {confirming && (
        <div className="mx-5 mb-4 bg-gradient-to-r from-brand-50 to-emerald-50 border border-brand-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-600 mb-3">
            Confirm delivery for <strong>{name}</strong>
            {gradeLabel && <span className="ml-2 text-brand-600">· {gradeLabel} @ Rs. {price}</span>}
          </p>

          <div className="flex items-center gap-4">
            {/* Qty stepper */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-slate-500 font-medium">Qty Delivered</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(q => Math.max(0, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-brand-400 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                >−</button>
                <input
                  type="number" min={0} max={slot.qty_ordered + 5} value={qty}
                  onChange={e => setQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-14 text-center text-xl font-black text-brand-700 bg-white border-2 border-brand-300 rounded-xl py-1 focus:outline-none focus:border-brand-500"
                />
                <button
                  onClick={() => setQty(q => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-brand-400 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                >+</button>
                <span className="text-xs text-slate-400">of {slot.qty_ordered} ordered</span>
              </div>
            </div>

            {/* Line total preview */}
            <div className="bg-white border border-emerald-200 rounded-xl px-4 py-2 text-center">
              <p className="text-xs text-slate-400">Amount</p>
              <p className="text-lg font-black text-emerald-700">Rs. {qty * price}</p>
            </div>

            {/* Confirm / Cancel */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setConfirming(false)}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 bg-white px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isUpdating || qty === 0}
                onClick={handleConfirmDeliver}
                className="flex items-center gap-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 disabled:cursor-wait px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
                {isUpdating ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                )}
                Confirm {qty} 🥥 Delivered
              </button>
            </div>
          </div>

          {qty < slot.qty_ordered && qty > 0 && (
            <p className="text-xs text-amber-600 mt-2 font-medium">
              ⚠ Partial delivery — {slot.qty_ordered - qty} nut{slot.qty_ordered - qty !== 1 ? 's' : ''} short. Billing will reflect {qty} nut{qty !== 1 ? 's' : ''}.
            </p>
          )}
          {qty === 0 && (
            <p className="text-xs text-red-500 mt-2 font-medium">
              ⚠ Qty cannot be 0 — use Skip instead if nothing was delivered.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Deliveries() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered' | 'skipped'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr());
  const isToday = selectedDate === todayStr();

  const prevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(toDateStr(d));
    setFilter('all');
  };
  const nextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    if (toDateStr(d) <= todayStr()) { setSelectedDate(toDateStr(d)); setFilter('all'); }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['deliveries', selectedDate],
    queryFn: () => getDeliveries(selectedDate),
    // Only auto-refetch when viewing today
    refetchInterval: isToday ? 30_000 : false,
  });

  const typedData = data as { stats: any; slots: any[] } | undefined;

  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const mutation = useMutation({
    mutationFn: markDeliverySlot,
    onMutate: ({ id }) => setUpdatingIds(prev => new Set(prev).add(id)),
    onSettled: (_data, _err, variables) => {
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(variables.id); return s; });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const bulkMutation = useMutation({
    mutationFn: bulkDeliverAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries', selectedDate] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleMark = (id: string, action: 'delivered' | 'skipped', qty?: number) => {
    mutation.mutate({ id, action, qty_delivered: qty });
  };

  const allSlots: any[] = typedData?.slots ?? [];
  const pendingSlots = allSlots.filter((s: any) => s.status === 'pending');

  const filteredSlots = filter === 'all' ? allSlots
    : allSlots.filter((s: any) => s.status === filter);

  const stats = typedData?.stats ?? {} as any;
  const completionPct = stats.completionPct ?? 0;

  // Human-readable date label
  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            Deliveries
            {!isToday && (
              <span className="text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full">
                📅 Retrospective
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500">Single slot per customer per day — confirm each delivery with actual qty</p>
        </div>
        <div className="flex items-center gap-2">

          {/* ── Date Navigator ── */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-1 py-1">
            {/* Prev day */}
            <button
              onClick={prevDay}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600"
              title="Previous day"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
            </button>

            {/* Date display / picker */}
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                max={todayStr()}
                onChange={e => { if (e.target.value) { setSelectedDate(e.target.value); setFilter('all'); }}}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <span className="text-sm font-semibold text-slate-700 px-3 whitespace-nowrap">
                {isToday ? `📅 Today — ${displayDate}` : `📅 ${displayDate}`}
              </span>
            </div>

            {/* Next day (disabled if today) */}
            <button
              onClick={nextDay}
              disabled={isToday}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next day"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Jump to today */}
          {!isToday && (
            <button
              onClick={() => { setSelectedDate(todayStr()); setFilter('all'); }}
              className="text-xs font-semibold text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors"
            >
              ↩ Today
            </button>
          )}

          {/* Bulk deliver */}
          <button
            onClick={() => bulkMutation.mutate(pendingSlots.map((s: any) => s.id))}
            disabled={bulkMutation.isPending || pendingSlots.length === 0}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2 ${
              pendingSlots.length > 0
                ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-md'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {bulkMutation.isPending ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Delivering…</>
            ) : pendingSlots.length > 0 ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Bulk Deliver All ({pendingSlots.length})</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>All Done ✓</>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">

        {isError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600">
            ❌ Could not load delivery slots. Is the backend running?
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-5 gap-4 mb-7">
          {([
            { label: 'Total Slots', value: stats.total,     color: 'text-slate-800',  bg: 'bg-white' },
            { label: 'Delivered',   value: stats.delivered, color: 'text-emerald-700', bg: 'bg-emerald-50' },
            { label: 'Pending',     value: stats.pending,   color: 'text-amber-600',  bg: 'bg-amber-50'   },
            { label: 'Skipped',     value: stats.skipped,   color: 'text-slate-500',  bg: 'bg-slate-50'   },
            { label: 'Missed',      value: stats.missed,    color: 'text-red-500',    bg: 'bg-red-50'     },
          ] as const).map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border border-slate-200 p-4 shadow-sm text-center ${bg}`}>
              <p className={`text-3xl font-black ${color}`}>{isLoading ? '…' : (value ?? 0)}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-7">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Today's Completion</span>
            <span className={`text-sm font-bold ${completionPct === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {completionPct}% &nbsp;({stats.delivered ?? 0} / {stats.total ?? 0} slots)
            </span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                completionPct === 100
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-amber-400 via-brand-500 to-emerald-500'
              }`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Filter tabs + Slot list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Filter row */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">
              🚚 Today's Delivery List
            </h3>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
              {(['all', 'pending', 'delivered', 'skipped'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all capitalize ${
                    filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f} {f !== 'all' && `(${allSlots.filter((s: any) => s.status === f).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Slot list */}
          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-50">
            {isLoading && (
              <div className="p-10 text-center text-sm text-slate-400">
                <svg className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Loading slots…
              </div>
            )}
            {!isLoading && filteredSlots.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-3xl mb-2">🎉</p>
                <p className="text-sm text-slate-500 font-medium">
                  {filter === 'all' ? 'No deliveries scheduled for today' : `No ${filter} slots`}
                </p>
              </div>
            )}
            {filteredSlots.map((slot: any) => (
              <SlotRow
                key={slot.id}
                slot={slot}
                onMark={handleMark}
                isUpdating={updatingIds.has(slot.id)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
