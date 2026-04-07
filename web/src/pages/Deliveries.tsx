import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeliveries, markDeliverySlot, bulkDeliverAll } from '../services/api';

// ─── Status badge ─────────────────────────────────────────────────────────────
const badgeCls = (status: string) => {
  if (status === 'delivered') return 'bg-brand-100 text-brand-700 border border-brand-200';
  if (status === 'pending')   return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (status === 'skipped')   return 'bg-slate-100 text-slate-500 border border-slate-200';
  if (status === 'missed')    return 'bg-red-100 text-red-600 border border-red-200';
  return 'bg-slate-100 text-slate-500';
};

const statusIcon = (status: string) => {
  if (status === 'delivered') return '✅';
  if (status === 'pending')   return '🕐';
  if (status === 'skipped')   return '⏭';
  if (status === 'missed')    return '❌';
  return '•';
};

// ─── Individual Slot Row ──────────────────────────────────────────────────────
function SlotRow({ slot, onMark, isUpdating }: {
  slot: any;
  onMark: (id: string, action: 'delivered' | 'skipped') => void;
  isUpdating: boolean;
}) {
  const [showUndo, setShowUndo] = useState(false);

  const customer   = slot.subscription?.customer;
  const name       = customer?.name ?? '—';
  const initials   = name.substring(0, 2).toUpperCase();
  const plan       = slot.subscription?.plans?.[0];
  const price      = plan?.price_per_unit ?? slot.price_at_delivery ?? 30;
  const lineTotal  = slot.qty_ordered * price;

  const isDelivered = slot.status === 'delivered';
  const isSkipped   = slot.status === 'skipped';
  const isPending   = slot.status === 'pending';

  return (
    <div className={`flex items-center gap-4 px-5 py-4 border-b border-slate-50 last:border-0 transition-all ${
      isDelivered ? 'bg-brand-50/30' : isSkipped ? 'bg-slate-50/60' : 'hover:bg-slate-50'
    }`}>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 ${
        isDelivered ? 'bg-brand-200 text-brand-800' : 'bg-brand-100 text-brand-700'
      }`}>
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isDelivered ? 'text-slate-500' : 'text-slate-800'}`}>
          {name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-slate-400">{slot.address?.label}</span>
          <span className="text-slate-300 text-xs">·</span>
          <span className="text-xs font-medium text-slate-600">
            {slot.qty_ordered} 🥥 {slot.qty_ordered !== 1 ? 'nuts' : 'nut'}
          </span>
          <span className="text-slate-300 text-xs">·</span>
          <span className="text-xs text-slate-400">₹{lineTotal}</span>
          {isDelivered && slot.qty_delivered != null && slot.qty_delivered !== slot.qty_ordered && (
            <span className="text-xs text-amber-600 font-medium">({slot.qty_delivered} delivered)</span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${badgeCls(slot.status)}`}>
        {statusIcon(slot.status)} {slot.status}
      </span>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* PENDING state → Deliver + Skip */}
        {isPending && (
          <>
            <button
              disabled={isUpdating}
              onClick={() => onMark(slot.id, 'delivered')}
              className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-wait text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md"
            >
              {isUpdating ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              )}
              {isUpdating ? 'Saving…' : 'Deliver'}
            </button>

            <button
              disabled={isUpdating}
              onClick={() => onMark(slot.id, 'skipped')}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 px-3 py-2 rounded-xl transition-all"
            >
              Skip
            </button>
          </>
        )}

        {/* SKIPPED state → Restore to delivered */}
        {isSkipped && (
          <button
            disabled={isUpdating}
            onClick={() => onMark(slot.id, 'delivered')}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 border border-brand-200 hover:border-brand-400 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-all"
          >
            {isUpdating ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            ) : '↩'} Restore
          </button>
        )}

        {/* DELIVERED state → Undo (with inline confirm) */}
        {isDelivered && (
          showUndo ? (
            <div className="flex items-center gap-1.5 animate-pulse">
              <span className="text-xs text-red-500 font-medium">Undo?</span>
              <button
                disabled={isUpdating}
                onClick={() => { onMark(slot.id, 'skipped'); setShowUndo(false); }}
                className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowUndo(false)}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowUndo(true)}
              className="text-xs font-medium text-slate-300 hover:text-red-400 border border-slate-100 hover:border-red-200 px-3 py-2 rounded-xl transition-all"
              title="Undo delivery"
            >
              Undo
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Deliveries() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['deliveries'],
    queryFn: getDeliveries,
    refetchInterval: 30_000,
  });

  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Single-slot mutation
  const mutation = useMutation({
    mutationFn: markDeliverySlot,
    onMutate: ({ id }) => setUpdatingIds(prev => new Set(prev).add(id)),
    onSettled: (_data, _err, variables) => {
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(variables.id); return s; });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (_err, variables) => {
      // Ensure cleanup even on error
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(variables.id); return s; });
    }
  });

  // Bulk mutation — separate instance, single transaction
  const bulkMutation = useMutation({
    mutationFn: bulkDeliverAll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleMark = (id: string, action: 'delivered' | 'skipped') => {
    mutation.mutate({ id, action });
  };

  const allPendingIds = [
    ...(data?.morning ?? []),
    ...(data?.evening ?? []),
  ].filter((s: any) => s.status === 'pending').map((s: any) => s.id);

  const handleBulkDeliver = () => {
    if (allPendingIds.length === 0) return;
    bulkMutation.mutate(allPendingIds);
  };

  const stats = data?.stats ?? {};
  const completionPct = stats.completionPct ?? (stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0);
  const hasPending = allPendingIds.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Deliveries</h1>
          <p className="text-xs text-slate-500">Track today's routes · mark individual slots or bulk-deliver all</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={handleBulkDeliver}
            disabled={bulkMutation.isPending || !hasPending}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            {bulkMutation.isPending ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Delivering…</>
            ) : hasPending ? (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Bulk Deliver ({allPendingIds.length})</>
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

        {/* Stat cards */}
        <div className="grid grid-cols-5 gap-4 mb-7">
          {[
            { label: 'Total Slots',  value: stats.total,     color: 'text-slate-900',  bg: 'bg-slate-50'   },
            { label: 'Delivered',    value: stats.delivered, color: 'text-brand-600',  bg: 'bg-brand-50'   },
            { label: 'Pending',      value: stats.pending,   color: 'text-amber-600',  bg: 'bg-amber-50'   },
            { label: 'Skipped',      value: stats.skipped,   color: 'text-slate-500',  bg: 'bg-slate-50'   },
            { label: 'Missed',       value: stats.missed,    color: 'text-red-500',    bg: 'bg-red-50'     },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border border-slate-200 p-4 shadow-sm text-center ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{isLoading ? '…' : (value ?? 0)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Today's Completion</span>
            <span className={`text-sm font-bold ${completionPct === 100 ? 'text-brand-600' : 'text-amber-600'}`}>
              {completionPct}% ({stats.delivered ?? 0}/{stats.total ?? 0})
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${completionPct === 100 ? 'bg-brand-500' : 'bg-gradient-to-r from-amber-400 to-brand-500'}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>🌅 Morning: {data?.morning?.filter((s: any) => s.status === 'delivered').length ?? 0}/{data?.morning?.length ?? 0}</span>
            <span>🌆 Evening: {data?.evening?.filter((s: any) => s.status === 'delivered').length ?? 0}/{data?.evening?.length ?? 0}</span>
          </div>
        </div>

        {/* Slot columns */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { band: 'morning', emoji: '🌅', label: 'Morning Route', slots: data?.morning ?? [] },
            { band: 'evening', emoji: '🌆', label: 'Evening Route', slots: data?.evening ?? [] },
          ].map(({ band, emoji, label, slots }) => {
            const delivered = slots.filter((s: any) => s.status === 'delivered').length;
            const total     = slots.length;
            const pending   = slots.filter((s: any) => s.status === 'pending').length;
            const allDone   = total > 0 && delivered === total;

            return (
              <div key={band} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Column header */}
                <div className={`px-5 py-4 border-b border-slate-100 flex items-center justify-between ${
                  band === 'morning' ? 'bg-amber-50/70' : 'bg-indigo-50/70'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <h3 className="font-semibold text-slate-900 text-sm">{label}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      allDone ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {allDone ? '✓ All Done' : `${pending} pending`}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700">{delivered}/{total}</p>
                    <p className="text-[10px] text-slate-400">delivered</p>
                  </div>
                </div>

                {/* Per-band bulk action */}
                {pending > 0 && (
                  <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500">{pending} slot{pending !== 1 ? 's' : ''} remaining</span>
                    <button
                      disabled={bulkMutation.isPending}
                      onClick={() => {
                        const ids = slots.filter((s: any) => s.status === 'pending').map((s: any) => s.id);
                        bulkMutation.mutate(ids);
                      }}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50 border border-brand-200 hover:border-brand-400 bg-white hover:bg-brand-50 px-3 py-1 rounded-lg transition-all"
                    >
                      {bulkMutation.isPending ? '…' : `✓ Deliver All ${emoji}`}
                    </button>
                  </div>
                )}

                {/* Slot list */}
                <div className="max-h-[480px] overflow-y-auto">
                  {isLoading && (
                    <div className="p-8 text-center text-sm text-slate-400">
                      <svg className="w-5 h-5 animate-spin text-brand-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Loading…
                    </div>
                  )}
                  {!isLoading && slots.length === 0 && (
                    <div className="p-8 text-center text-sm text-slate-400">
                      No {band} slots scheduled today.
                    </div>
                  )}
                  {slots.map((slot: any) => (
                    <SlotRow
                      key={slot.id}
                      slot={slot}
                      onMark={handleMark}
                      isUpdating={updatingIds.has(slot.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
