import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  name: string;
  mobile: string;
  start_date: string;
  payment_mode: 'advance' | 'cod';
  address: {
    label: string;
    address_line: string;
    landmark: string;
  };
  plan: {
    slots: 'morning' | 'evening' | 'both';
    morning_qty: number;
    evening_qty: number;
    price_per_unit: number;
  };
}

// ─── API call ─────────────────────────────────────────────────────────────────
const createCustomer = async (data: FormData) => {
  const morning_qty = data.plan.slots === 'evening' ? 0 : data.plan.morning_qty;
  const evening_qty = data.plan.slots === 'morning' ? 0 : data.plan.evening_qty;

  const payload = {
    name: data.name,
    mobile: data.mobile,
    start_date: data.start_date,
    payment_mode: data.payment_mode,
    address: {
      label: data.address.label,
      address_line: data.address.address_line,
      landmark: data.address.landmark || undefined,
    },
    plan: {
      morning_qty,
      evening_qty,
      price_per_unit: data.plan.price_per_unit,
    },
  };

  const { data: res } = await api.post('/customers', payload);
  return res;
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const Steps = ({ current }: { current: number }) => {
  const steps = ['Personal Details', 'Delivery Address', 'Subscription Plan', 'Review & Save'];
  return (
    <div className="bg-white border-b border-slate-100 px-8 py-4 flex-shrink-0">
      <div className="flex items-center gap-0 max-w-2xl">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const done = stepNum < current;
          const active = stepNum === current;
          return (
            <div key={idx} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${done   ? 'bg-brand-600 text-white' :
                    active ? 'bg-brand-600 text-white ring-4 ring-brand-600/20' :
                             'bg-slate-200 text-slate-400'}`}>
                  {done ? '✓' : stepNum}
                </div>
                <span className={`text-sm ${active ? 'font-semibold text-slate-900' : done ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`mx-4 h-0.5 max-w-16 w-16 transition-all ${done ? 'bg-brand-500' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Input helper ─────────────────────────────────────────────────────────────
const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const inputCls = "w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all";
const errInputCls = "w-full px-4 py-2.5 text-sm border border-red-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-all";

// ─── Main component ───────────────────────────────────────────────────────────
export default function NewCustomer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormData>({
    name: '',
    mobile: '',
    start_date: new Date().toISOString().slice(0, 10),
    payment_mode: 'advance',
    address: { label: 'Home', address_line: '', landmark: '' },
    plan: { slots: 'both', morning_qty: 2, evening_qty: 2, price_per_unit: 30 },
  });

  const mutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/customers');
    },
  });

  // ─── Set helpers ─────────────────────────────────────────────────────────
  const set = (key: keyof FormData, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };
  const setAddr = (key: keyof FormData['address'], value: string) => {
    setForm(f => ({ ...f, address: { ...f.address, [key]: value } }));
    setErrors(e => { const n = { ...e }; delete n[`addr_${key}`]; return n; });
  };
  const setPlan = (key: keyof FormData['plan'], value: any) => {
    setForm(f => ({ ...f, plan: { ...f.plan, [key]: value } }));
    setErrors(e => { const n = { ...e }; delete n[`plan_${key}`]; return n; });
  };

  // ─── Validation ──────────────────────────────────────────────────────────
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim())   errs.name   = 'Name is required';
      if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
      else if (!/^\+?[\d\s-]{10,14}$/.test(form.mobile)) errs.mobile = 'Enter a valid 10-digit mobile number';
      if (!form.start_date)    errs.start_date = 'Start date is required';
    }
    if (s === 2) {
      if (!form.address.label.trim())        errs.addr_label        = 'Label is required';
      if (!form.address.address_line.trim()) errs.addr_address_line = 'Full address is required';
    }
    if (s === 3) {
      if (form.plan.slots !== 'evening' && form.plan.morning_qty < 1) errs.plan_morning_qty = 'At least 1 coconut required';
      if (form.plan.slots !== 'morning' && form.plan.evening_qty < 1) errs.plan_evening_qty = 'At least 1 coconut required';
      if (form.plan.price_per_unit <= 0) errs.plan_price_per_unit = 'Price must be greater than 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const morningQty = form.plan.slots === 'evening' ? 0 : form.plan.morning_qty;
  const eveningQty = form.plan.slots === 'morning' ? 0 : form.plan.evening_qty;
  const totalPerDay = morningQty + eveningQty;
  const estimatedMonthly = totalPerDay * 30 * form.plan.price_per_unit;

  // ─── JSX ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/customers" className="hover:text-brand-600 transition-colors">Customers</Link>
          <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          <span className="text-slate-900 font-medium">New Customer</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/customers" className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg border border-slate-200 transition-colors">
            Cancel
          </Link>
          {step === 4 && (
            <button
              onClick={() => mutation.mutate(form)}
              disabled={mutation.isPending}
              className="text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white px-5 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                  Saving…
                </>
              ) : '✓ Save Customer'}
            </button>
          )}
        </div>
      </header>

      <Steps current={step} />

      {/* Error banner */}
      {mutation.isError && (
        <div className="mx-8 mt-4 bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600">
          ❌ {(mutation.error as any)?.response?.data?.message ?? 'Failed to save customer. Please check all fields and try again.'}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* ── STEP 1: Personal Details ─────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded-2xl border border-brand-300 shadow-md ring-1 ring-brand-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <h2 className="text-base font-semibold">Personal Details</h2>
              </div>
              <div className="px-6 py-5 grid grid-cols-2 gap-5">
                <Field label="Full Name" error={errors.name}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Rahul Arora"
                    className={errors.name ? errInputCls : inputCls}
                  />
                </Field>
                <Field label="WhatsApp Mobile" error={errors.mobile}>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={e => set('mobile', e.target.value)}
                    placeholder="+91 98765 43210"
                    className={errors.mobile ? errInputCls : inputCls}
                  />
                </Field>
                <Field label="Subscription Start Date" error={errors.start_date}>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => set('start_date', e.target.value)}
                    className={errors.start_date ? errInputCls : inputCls}
                  />
                </Field>
                <Field label="Payment Mode">
                  <select
                    value={form.payment_mode}
                    onChange={e => set('payment_mode', e.target.value as 'advance' | 'cod')}
                    className={inputCls}
                  >
                    <option value="advance">Advance</option>
                    <option value="cod">COD / Credit</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 2: Delivery Address ──────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded-2xl border border-brand-300 shadow-md ring-1 ring-brand-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h2 className="text-base font-semibold">Delivery Address</h2>
              </div>
              <div className="px-6 py-5 space-y-5">
                <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white bg-brand-600 px-2 py-0.5 rounded-full">Primary</span>
                    <span className="text-sm font-semibold text-slate-700">Address 1</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Address Label" error={errors.addr_label}>
                      <input
                        type="text"
                        value={form.address.label}
                        onChange={e => setAddr('label', e.target.value)}
                        placeholder="e.g. Home, Office"
                        className={errors.addr_label ? errInputCls : inputCls}
                      />
                    </Field>
                    <Field label="Landmark (optional)">
                      <input
                        type="text"
                        value={form.address.landmark}
                        onChange={e => setAddr('landmark', e.target.value)}
                        placeholder="Near landmark"
                        className={inputCls}
                      />
                    </Field>
                  </div>
                  <Field label="Full Address" error={errors.addr_address_line}>
                    <input
                      type="text"
                      value={form.address.address_line}
                      onChange={e => setAddr('address_line', e.target.value)}
                      placeholder="Flat / Building / Street / Area / City – PIN"
                      className={errors.addr_address_line ? errInputCls : inputCls}
                    />
                  </Field>
                </div>
                <p className="text-xs text-slate-400 text-center">Additional delivery addresses can be added later from the customer profile.</p>
              </div>
            </div>
          )}

          {/* ── STEP 3: Subscription Plan ──────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded-2xl border border-brand-300 shadow-md ring-1 ring-brand-200">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
                </div>
                <h2 className="text-base font-semibold">Subscription Plan</h2>
              </div>
              <div className="px-6 py-5 space-y-5">
                {/* Delivery slots */}
                <Field label="Delivery Slots">
                  <div className="flex gap-2 mt-1">
                    {(['morning', 'evening', 'both'] as const).map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setPlan('slots', slot)}
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all border ${
                          form.plan.slots === slot
                            ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400'
                        }`}
                      >
                        {slot === 'morning' ? '🌅 Morning' : slot === 'evening' ? '🌆 Evening' : '🌅🌆 Both'}
                      </button>
                    ))}
                  </div>
                </Field>

                <div className="grid grid-cols-3 gap-4">
                  {form.plan.slots !== 'evening' && (
                    <Field label="Morning Qty (nuts)" error={errors.plan_morning_qty}>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={form.plan.morning_qty}
                        onChange={e => setPlan('morning_qty', parseInt(e.target.value) || 0)}
                        className={errors.plan_morning_qty ? errInputCls : inputCls}
                      />
                    </Field>
                  )}
                  {form.plan.slots !== 'morning' && (
                    <Field label="Evening Qty (nuts)" error={errors.plan_evening_qty}>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={form.plan.evening_qty}
                        onChange={e => setPlan('evening_qty', parseInt(e.target.value) || 0)}
                        className={errors.plan_evening_qty ? errInputCls : inputCls}
                      />
                    </Field>
                  )}
                  <Field label="Price per Coconut (₹)" error={errors.plan_price_per_unit}>
                    <input
                      type="number"
                      min={1}
                      value={form.plan.price_per_unit}
                      onChange={e => setPlan('price_per_unit', parseFloat(e.target.value) || 0)}
                      className={errors.plan_price_per_unit ? errInputCls : inputCls}
                    />
                  </Field>
                </div>

                {/* Estimated monthly */}
                <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Estimated Monthly Billing</p>
                    <p className="text-2xl font-bold text-brand-700 mt-0.5">₹{estimatedMonthly.toLocaleString()}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 space-y-0.5">
                    <p>{totalPerDay} nuts/day × 30 days</p>
                    <p>₹{form.plan.price_per_unit}/nut</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review ─────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5 text-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 text-white font-bold flex items-center justify-center text-lg">
                      {form.name.substring(0, 2).toUpperCase() || '??'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{form.name || '—'}</h3>
                      <p className="text-brand-200 text-sm">{form.mobile}</p>
                    </div>
                    <span className="ml-auto text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">New Customer</span>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Start Date</p>
                      <p className="font-medium text-slate-800">{new Date(form.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Payment Mode</p>
                      <p className="font-medium text-slate-800 capitalize">{form.payment_mode}</p>
                    </div>
                  </div>
                  <div className="px-6 py-4 text-sm">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-1">Primary Address</p>
                    <p className="font-medium text-slate-800">🏠 {form.address.label}</p>
                    <p className="text-slate-500 mt-0.5">{form.address.address_line}</p>
                    {form.address.landmark && <p className="text-slate-400 text-xs mt-0.5">Near {form.address.landmark}</p>}
                  </div>
                  <div className="px-6 py-4 text-sm">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-2">Subscription Plan</p>
                    <div className="flex gap-4">
                      {morningQty > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-amber-600">🌅 Morning</p>
                          <p className="font-bold text-slate-800">{morningQty} nuts</p>
                        </div>
                      )}
                      {eveningQty > 0 && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-indigo-600">🌆 Evening</p>
                          <p className="font-bold text-slate-800">{eveningQty} nuts</p>
                        </div>
                      )}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center">
                        <p className="text-xs text-slate-500">₹/nut</p>
                        <p className="font-bold text-slate-800">₹{form.plan.price_per_unit}</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between bg-brand-50/60">
                    <span className="text-sm font-semibold text-slate-700">Estimated Monthly Billing</span>
                    <span className="text-xl font-bold text-brand-700">₹{estimatedMonthly.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-700 flex items-center gap-2">
                <span>💬</span>
                A WhatsApp welcome message will be auto-generated for <strong>{form.name || 'this customer'}</strong> after saving.
              </div>
            </div>
          )}

          {/* ── Navigation buttons ─────────────────────────────────────────── */}
          <div className="flex justify-between pt-2 pb-8">
            <button
              onClick={step === 1 ? () => navigate('/customers') : back}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
              {step === 1 ? 'Back to list' : 'Back'}
            </button>
            {step < 4 && (
              <button
                onClick={next}
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                {step === 3 ? 'Review' : 'Continue'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
              </button>
            )}
            {step === 4 && (
              <button
                onClick={() => mutation.mutate(form)}
                disabled={mutation.isPending}
                className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors shadow-sm flex items-center gap-2"
              >
                {mutation.isPending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                    Saving…
                  </>
                ) : (
                  <>✓ Save Customer</>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
