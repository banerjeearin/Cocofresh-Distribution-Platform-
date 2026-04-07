import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeliveries, markDeliverySlot, bulkDeliverAll } from '../services/api';

// ─── status badge ─────────────────────────────────────────────────────────────
const badgeCls = (status: string) => {
  if (status === 'delivered') return 'bg-brand-100 text-brand-700';
  if (status === 'pending')   return 'bg-amber-100 text-amber-700';
  if (status === 'skipped')   return 'bg-slate-100 text-slate-500';
  if (status === 'missed')    return 'bg-red-100 text-red-600';
  return 'bg-slate-100 text-slate-500';
};

// ─── Slot row ─────────────────────────────────────────────────────────────────
function SlotRow({ slot, onMark, isUpdating }: {
  slot: any;
  onMark: (id: string, action: 'delivered' | 'skipped') => void;
  isUpdating: boolean;
}) {
  const customer = slot.subscription?.customer;
  const name = customer?.name ?? '—';
  const initials = name.substring(0, 2).toUpperCase();
  const isDelivered = slot.status === 'delivered';
  const isSkipped   = slot.status === 'skipped';
  const isPending   = slot.status === 'pending';

  return (
    <div className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{name}</p>
          <p className="text-xs text-slate-400">
            {slot.address?.label} · {slot.qty_ordered} nut{slot.qty_ordered !== 1 ? 's' : ''}
            {slot.qty_delivered != null && slot.qty_delivered !== slot.qty_ordered
              ? ` (${slot.qty_delivered} delivered)`
              : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Status badge */}
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${badgeCls(slot.status)}`}>
          {slot.status}
        </span>

        {/* Action buttons — only show for pending/skipped */}
        {!isDelivered && (
          <button
            disabled={isUpdating}
            onClick={() => onMark(slot.id, 'delivered')}
            className="text-xs font-semibold bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          >
            {isUpdating ? (
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
            ) : '✓'} Deliver
          </button>
        )}

        {isPending && (
          <button
            disabled={isUpdating}
            onClick={() => onMark(slot.id, 'skipped')}
            className="text-xs font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Skip
          </button>
        )}

        {isSkipped && (
          <button
            disabled={isUpdating}
            onClick={() => onMark(slot.id, 'delivered')}
            className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 border border-brand-200 hover:border-brand-400 px-3 py-1.5 rounded-lg transition-colors"
          >
            Undo → Deliver
          </button>
        )}

        {isDelivered && (
          <button
            disabled={isUpdating}
            onClick={() => onMark(slot.id, 'skipped')}
            className="text-xs font-medium text-slate-400 hover:text-red-500 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
            title="Undo delivery"
          >
            Undo
          </button>
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
    refetchInterval: 30_000, // auto-refresh every 30s
  });

  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // BUG FIX: Separate mutation for single-slot — onSettled must handle undefined data (on error)
  const mutation = useMutation({
    mutationFn: markDeliverySlot,
    onMutate: ({ id }) => setUpdatingIds(prev => new Set(prev).add(id)),
    onSettled: (_data, _err, variables) => {
      // variables is always defined — safe to destructure
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(variables.id); return s; });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  // BUG FIX: Separate mutation for bulk — uses POST /deliveries/bulk (single server transaction)
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

  // BUG FIX: Check ALL slots (morning + evening) for pending, not just morning
  const handleBulkDeliver = () => {
    const allPending = [
      ...(data?.morning ?? []),
      ...(data?.evening ?? []),
    ].filter((s: any) => s.status === 'pending');

    if (allPending.length === 0) return;
    // Pass slot IDs so backend only updates exactly these slots
    bulkMutation.mutate(allPending.map((s: any) => s.id));
  };

  const stats = data?.stats ?? {};
  const completionPct = stats.completionPct ?? (stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Deliveries</h1>
          <p className="text-xs text-slate-500">Track today's routes and mark slot statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            📅 {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <button
            onClick={handleBulkDeliver}
            disabled={bulkMutation.isPending || ![
              ...(data?.morning ?? []),
              ...(data?.evening ?? []),
            ].some((s: any) => s.status === 'pending')}
            className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            {bulkMutation.isPending ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Delivering…</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>Bulk Deliver All Today</>
            )}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">

        {/* Error */}
        {isError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600">
            ❌ Could not load delivery slots. Is the backend running?
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-5 gap-4 mb-7">
          {[
            { label: 'Total Slots', value: stats.total,     color: 'text-slate-900' },
            { label: 'Delivered',   value: stats.delivered, color: 'text-brand-600' },
            { label: 'Pending',     value: stats.pending,   color: 'text-amber-500' },
            { label: 'Skipped',     value: stats.skipped,   color: 'text-slate-400' },
            { label: 'Missed',      value: stats.missed,    color: 'text-red-500'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
              <p className={`text-2xl font-bold ${color}`}>{isLoading ? '…' : (value ?? 0)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Today's Completion</span>
            <span className="text-sm font-bold text-brand-600">
              {completionPct}% ({stats.delivered ?? 0}/{stats.total ?? 0})
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>🌅 Morning: {data?.morning?.filter((s: any) => s.status === 'delivered').length ?? 0}/{data?.morning?.length ?? 0} delivered</span>
            <span>🌆 Evening: {data?.evening?.filter((s: any) => s.status === 'delivered').length ?? 0}/{data?.evening?.length ?? 0} delivered</span>
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
            const allDone   = total > 0 && delivered === total;

            return (
              <div key={band} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${band === 'morning' ? 'bg-amber-50/60' : 'bg-indigo-50/60'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{emoji}</span>
                    <h3 className="font-semibold text-slate-900">{label}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      allDone ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {allDone ? '✓ All Done' : 'In Progress'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{delivered}/{total} delivered</span>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isLoading && (
                    <div className="p-8 text-center text-sm text-slate-400">
                      <svg className="w-5 h-5 animate-spin text-brand-400 mx-auto mb-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
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


