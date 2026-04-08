import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markDeliverySlot, removeHoliday } from '../services/api';

interface Slot {
  id: string;
  status: 'pending' | 'delivered' | 'skipped' | 'holiday';
  scheduled_date: string;
  qty_ordered: number;
  qty_delivered?: number | null;
  price_at_delivery?: number | null;
}

interface Props {
  customerId: string;
  slots: Slot[];
}

function slotIcon(status: string) {
  if (status === 'delivered') return '✓';
  if (status === 'pending')   return '◷';
  if (status === 'skipped')   return '—';
  if (status === 'holiday')   return '🌴';
  return '·';
}

function cellBg(status: string | undefined) {
  if (!status) return 'bg-slate-50 text-slate-300 border-slate-100 cursor-default';
  if (status === 'delivered') return 'bg-brand-100 text-brand-700 border-brand-200 cursor-pointer hover:bg-brand-200 active:scale-95';
  if (status === 'pending')   return 'bg-yellow-50 text-yellow-800 border-yellow-200 cursor-pointer hover:bg-yellow-100 active:scale-95';
  if (status === 'holiday')   return 'bg-amber-100 text-amber-700 border-amber-300 cursor-pointer hover:bg-amber-200 active:scale-95';
  return 'bg-slate-100 text-slate-500 border-slate-200 cursor-pointer hover:bg-slate-200 active:scale-95'; // skipped
}

// Build months that span across the subscription's slot dates
function getMonthsFromSlots(slots: Slot[]): { year: number; month: number }[] {
  const seen = new Set<string>();
  const months: { year: number; month: number }[] = [];
  for (const s of slots) {
    const d = new Date(s.scheduled_date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      months.push({ year: d.getFullYear(), month: d.getMonth() });
    }
  }
  months.sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  return months;
}

export default function DeliveryCalendar({ customerId, slots }: Props) {
  const qc = useQueryClient();

  // Build slot lookup by date key
  const slotsByDate = new Map<string, Slot>();
  for (const s of slots) {
    const d = new Date(s.scheduled_date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    slotsByDate.set(key, s);
  }

  const months = getMonthsFromSlots(slots);

  // Current visible month index
  const todayYear  = new Date().getFullYear();
  const todayMonth = new Date().getMonth();
  const defaultIdx = Math.max(0, months.findIndex(m => m.year === todayYear && m.month === todayMonth));
  const [monthIdx, setMonthIdx] = useState(defaultIdx >= 0 ? defaultIdx : 0);

  // Popover state for Pending → Delivered (qty input)
  const [popover, setPopover] = useState<{ dateKey: string; slot: Slot } | null>(null);
  const [qty, setQty] = useState(1);

  // Holiday remove confirm
  const [holidayConfirm, setHolidayConfirm] = useState<{ dateKey: string; slot: Slot } | null>(null);

  const markSlot = useMutation({
    mutationFn: ({ id, action, qty_delivered }: { id: string; action: 'delivered' | 'skipped' | 'pending'; qty_delivered?: number }) =>
      markDeliverySlot({ id, action, qty_delivered }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
      setPopover(null);
      setHolidayConfirm(null);
    },
  });

  const removeHol = useMutation({
    mutationFn: (id: string) => removeHoliday(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', customerId] });
      setHolidayConfirm(null);
    },
  });

  function handleCellClick(dateKey: string, slot: Slot | undefined) {
    if (!slot) return;
    if (markSlot.isPending || removeHol.isPending) return;

    if (slot.status === 'pending') {
      // Open popover for qty input before marking delivered
      setQty(slot.qty_ordered ?? 1);
      setPopover({ dateKey, slot });
      setHolidayConfirm(null);
    } else if (slot.status === 'delivered') {
      // Toggle to skipped instantly
      markSlot.mutate({ id: slot.id, action: 'skipped' });
    } else if (slot.status === 'skipped') {
      // Single click → revert back to pending
      markSlot.mutate({ id: slot.id, action: 'pending' });
    } else if (slot.status === 'holiday') {
      setHolidayConfirm({ dateKey, slot });
      setPopover(null);
    }
  }

  function confirmDeliver() {
    if (!popover) return;
    markSlot.mutate({ id: popover.slot.id, action: 'delivered', qty_delivered: qty });
  }

  function confirmSkip() {
    if (!popover) return;
    markSlot.mutate({ id: popover.slot.id, action: 'skipped' });
    setPopover(null);
  }

  const curMonth = months[monthIdx];
  if (!curMonth) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center text-slate-400 text-sm">
        No delivery slots found.
      </div>
    );
  }

  const { year, month } = curMonth;
  const monthName = new Date(year, month, 1).toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startPadding = (firstDayOfWeek + 6) % 7; // Mon=0
  const calendarDays: (number | null)[] = [
    ...Array(startPadding).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
            {monthName} {year} — Delivery Calendar
          </h3>
          {/* Month nav */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMonthIdx(i => Math.max(0, i - 1))}
              disabled={monthIdx === 0}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition"
            >‹</button>
            <span className="text-xs text-slate-500 px-2 whitespace-nowrap">{monthIdx + 1} / {months.length}</span>
            <button
              onClick={() => setMonthIdx(i => Math.min(months.length - 1, i + 1))}
              disabled={monthIdx === months.length - 1}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition"
            >›</button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-brand-200 border border-brand-300 inline-block"/><span>Delivered</span></span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-yellow-50 border border-yellow-200 inline-block"/><span>Pending</span></span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block"/><span>Holiday</span></span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300 inline-block"/><span>Skipped</span></span>
          <span className="text-slate-400 ml-1 italic hidden sm:inline">Tap a cell to update status</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-xs">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="text-center font-semibold text-slate-400 py-1">{d}</div>
          ))}
          {calendarDays.map((day, idx) => {
            if (!day) return <div key={`pad-${idx}`} />;
            const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const slot = slotsByDate.get(dateKey);
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isPopover = popover?.dateKey === dateKey;
            const isHolConfirm = holidayConfirm?.dateKey === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => handleCellClick(dateKey, slot)}
                className={`
                  border rounded-lg text-center relative transition-all select-none
                  ${cellBg(slot?.status)}
                  ${isToday ? 'ring-2 ring-brand-500 border-brand-500' : ''}
                  ${isPopover || isHolConfirm ? 'z-10' : ''}
                  p-1 sm:p-1.5
                `}
                style={{ minHeight: '44px' }}
              >
                {isToday && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] bg-brand-600 text-white px-1.5 rounded-full whitespace-nowrap">Today</span>
                )}
                <div className="font-semibold text-xs sm:text-sm">{day}</div>
                {slot && (
                  <div className="text-[10px] sm:text-xs leading-tight">
                    {slot.status === 'delivered' && slot.qty_delivered && slot.qty_delivered !== slot.qty_ordered ? (
                      <span title={`${slot.qty_delivered} delivered`}>{slot.qty_delivered}✓</span>
                    ) : (
                      slotIcon(slot.status)
                    )}
                  </div>
                )}

                {/* Popover: Pending or Skipped → action */}
                {isPopover && (
                  <div
                    className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-left"
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      {new Date(year, month, day).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <label className="text-[10px] text-slate-500 block mb-1">Qty Delivered</label>
                    <div className="flex items-center gap-1.5 mb-2">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition"
                      >−</button>
                      <span className="flex-1 text-center font-bold text-slate-900">{qty}</span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center transition"
                      >+</button>
                    </div>
                    <button
                      onClick={confirmDeliver}
                      disabled={markSlot.isPending}
                      className="w-full text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold py-1.5 rounded-lg mb-1.5 transition disabled:opacity-50"
                    >
                      {markSlot.isPending ? '…' : '✓ Mark Delivered'}
                    </button>
                    <button
                      onClick={confirmSkip}
                      disabled={markSlot.isPending}
                      className="w-full text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-1.5 rounded-lg mb-1.5 transition"
                    >
                      — Mark Skipped
                    </button>
                    <button
                      onClick={() => setPopover(null)}
                      className="w-full text-[10px] text-slate-400 hover:text-slate-600 py-1 transition"
                    >Cancel</button>
                  </div>
                )}

                {/* Holiday remove confirm */}
                {isHolConfirm && (
                  <div
                    className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 w-44 bg-white border border-amber-200 rounded-xl shadow-lg p-3 text-left"
                    onClick={e => e.stopPropagation()}
                  >
                    <p className="text-xs font-semibold text-amber-700 mb-1">🌴 Remove Holiday?</p>
                    <p className="text-[10px] text-slate-500 mb-2">Subscription end date will shorten by 1 day.</p>
                    <button
                      onClick={() => removeHol.mutate(holidayConfirm.slot.id)}
                      disabled={removeHol.isPending}
                      className="w-full text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 rounded-lg mb-1.5 transition disabled:opacity-50"
                    >
                      {removeHol.isPending ? '…' : 'Yes, Remove'}
                    </button>
                    <button
                      onClick={() => setHolidayConfirm(null)}
                      className="w-full text-[10px] text-slate-400 hover:text-slate-600 py-1 transition"
                    >Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile hint */}
        <p className="mt-3 text-xs text-slate-400 text-center sm:hidden">Tap any coloured cell to update delivery status</p>
      </div>
    </div>
  );
}
