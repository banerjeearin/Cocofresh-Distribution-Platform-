import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGrades, createGrade, updateGrade, deactivateGrade } from '../services/api';

// ─── Edit Grade Modal ─────────────────────────────────────────────────────────
function GradeModal({ grade, onClose }: { grade?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const isEdit = !!grade;

  const [label, setLabel] = useState(grade?.label ?? '');
  const [price, setPrice] = useState(grade?.price_per_unit?.toString() ?? '');
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      isEdit
        ? updateGrade(grade.id, { label, price_per_unit: parseFloat(price) })
        : createGrade({ label, price_per_unit: parseFloat(price) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] });
      onClose();
    },
  });

  const handleSave = () => {
    if (!label.trim()) { setError('Label is required'); return; }
    if (!price || parseFloat(price) <= 0) { setError('Enter a valid price'); return; }
    setError('');
    mutation.mutate();
  };

  const inp = 'w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600/30 focus:border-brand-600 transition-all';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
        <div className="bg-gradient-to-r from-brand-700 to-brand-600 px-6 py-5 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-white font-bold">{isEdit ? 'Edit Grade' : 'Add New Grade'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Grade Label</label>
            <input value={label} onChange={e => setLabel(e.target.value)} placeholder="e.g. Grade-A" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Price per Coconut (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">Rs.</span>
              <input type="number" min={1} value={price} onChange={e => setPrice(e.target.value)} placeholder="70" className={`${inp} pl-10`} />
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3 border-t border-slate-100 pt-4">
          <button onClick={onClose} className="text-sm text-slate-500 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={mutation.isPending}
            className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Grade' : 'Add Grade'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings page ───────────────────────────────────────────────────────
export default function Settings() {
  const [showModal, setShowModal] = useState(false);
  const [editGrade, setEditGrade] = useState<any>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['grades'], queryFn: () => getGrades(true) });
  const grades: any[] = data?.grades ?? [];
  const active = grades.filter(g => g.is_active);
  const inactive = grades.filter(g => !g.is_active);

  const deactivateMutation = useMutation({
    mutationFn: deactivateGrade,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['grades'] }),
  });

  return (
    <>
      {(showModal || editGrade) && (
        <GradeModal
          grade={editGrade}
          onClose={() => { setShowModal(false); setEditGrade(null); }}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
            <p className="text-xs text-slate-500">Configure coconut grades, pricing and system preferences</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto space-y-8">

            {/* Grade Management */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Coconut Grade Management</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Grades define the coconut quality tier and default price per unit</p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
                  Add Grade
                </button>
              </div>

              {/* Active Grades */}
              <div className="divide-y divide-slate-100">
                {isLoading && (
                  <div className="px-6 py-8 text-center text-slate-400 text-sm">Loading grades...</div>
                )}
                {!isLoading && active.length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <p className="text-2xl mb-2">🥥</p>
                    <p className="text-slate-600 font-medium">No grades configured yet</p>
                    <p className="text-slate-400 text-xs mt-1">Click "Add Grade" to create Grade-A, Grade-B etc.</p>
                  </div>
                )}
                {active.map((g: any) => (
                  <div key={g.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                        <span className="text-brand-700 font-black text-sm">{g.label.split('-')[1] ?? 'G'}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{g.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Created {new Date(g.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xl font-black text-brand-700">Rs. {g.price_per_unit}</p>
                        <p className="text-xs text-slate-400">per coconut</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">Active</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditGrade(g)}
                          className="text-xs font-semibold text-brand-600 border border-brand-200 px-3 py-1.5 rounded-lg hover:border-brand-400 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { if (window.confirm(`Deactivate ${g.label}?`)) deactivateMutation.mutate(g.id); }}
                          className="text-xs font-semibold text-slate-500 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inactive Grades footer */}
              {inactive.length > 0 && (
                <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100">
                  <p className="text-xs text-slate-400">{inactive.length} deactivated grade{inactive.length !== 1 ? 's' : ''}: {inactive.map((g: any) => g.label).join(', ')}</p>
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6">
              <h3 className="font-semibold text-brand-800 mb-2">About Grades</h3>
              <ul className="text-sm text-brand-700 space-y-1.5">
                <li>• Each subscription gets a <strong>default grade</strong> set at creation time</li>
                <li>• Individual delivery slots can have a <strong>grade override</strong> (e.g. day-specific quality)</li>
                <li>• Price changes are logged in the <strong>grade change history</strong> per subscription</li>
                <li>• Billing uses the slot's grade price if set, otherwise the subscription default</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
