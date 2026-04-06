import { useQuery } from '@tanstack/react-query';
import { getDeliveries } from '../services/api';

export default function Deliveries() {
  const { data, isLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: getDeliveries
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Deliveries</h1>
          <p className="text-xs text-slate-500">Track today's routes and manage slot statuses</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">📅 Mon, 6 Apr 2026</span>
          <button className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
            Bulk Deliver All Today
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-5 gap-4 mb-7">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-900">{data?.stats?.total ?? '--'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Slots Today</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-brand-600">{data?.stats?.delivered ?? '--'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Delivered</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-amber-500">{data?.stats?.pending ?? '--'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Pending</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-slate-400">{data?.stats?.skipped ?? '--'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Skipped</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-red-500">{data?.stats?.missed ?? '--'}</p>
            <p className="text-xs text-slate-500 mt-0.5">Missed</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-7">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Today's Completion</span>
            <span className="text-sm font-bold text-brand-600">--% ({data?.stats?.delivered ?? 0}/{data?.stats?.total ?? 0})</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full" style={{width:'0%'}}></div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>🌅 Morning route: Pending</span>
            <span>🌆 Evening route: Pending</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌅</span>
                <h3 className="font-semibold text-slate-900">Morning Route</h3>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">All Delivered</span>
              </div>
              <span className="text-xs text-slate-500">{data?.morning?.length ?? 0} slots</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              {!data?.morning?.length && <div className="p-10 text-center text-sm text-slate-400">No morning slots scheduled today.</div>}
              {data?.morning?.map((slot: any) => (
                <div key={slot.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">
                      {slot.customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{slot.customer.name}</p>
                      <p className="text-xs text-slate-400">{slot.address.label} · {slot.qty_ordered} nuts</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">{slot.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
              <div className="flex items-center gap-2">
                <span className="text-lg">🌆</span>
                <h3 className="font-semibold text-slate-900">Evening Route</h3>
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">In Progress</span>
              </div>
              <span className="text-xs text-slate-500">{data?.evening?.length ?? 0} slots</span>
            </div>
            <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
              {!data?.evening?.length && <div className="p-10 text-center text-sm text-slate-400">No evening slots scheduled today.</div>}
              {data?.evening?.map((slot: any) => (
                <div key={slot.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">
                      {slot.customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{slot.customer.name}</p>
                      <p className="text-xs text-slate-400">{slot.address.label} · {slot.qty_ordered} nuts</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-brand-700 bg-brand-100 px-2.5 py-1 rounded-full">{slot.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
