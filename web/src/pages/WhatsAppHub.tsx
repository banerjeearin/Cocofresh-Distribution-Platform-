import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCustomers, getWhatsApp, logWhatsAppMessage, markWhatsAppSent } from '../services/api';

// ─── Template definitions ─────────────────────────────────────────────────────
const TEMPLATES = [
  { id: 'invoice',  emoji: '📋', label: 'Invoice',          desc: 'Monthly billing summary' },
  { id: 'welcome',  emoji: '👋', label: 'Welcome',          desc: 'New subscriber onboarding' },
  { id: 'delivery', emoji: '✅', label: 'Delivery Confirm', desc: 'Today\'s delivery done' },
  { id: 'skip',     emoji: '⏭', label: 'Skip Ack',         desc: 'Delivery skipped today' },
  { id: 'payment',  emoji: '💰', label: 'Payment Reminder', desc: 'Outstanding balance alert' },
  { id: 'renewal',  emoji: '🔄', label: 'Renewal',          desc: 'Subscription expiry soon' },
];

function buildPreview(template: string, customer: any): string {
  const name = customer?.name ?? 'Customer';
  switch (template) {
    case 'invoice':
      return `Dear ${name},\n\nHere is your LIIMRA Naturals invoice for this month.\n\n🥥 Your subscription is active.\n💰 Kindly check your outstanding balance, if any.\n\nThank you for being a LIIMRA Naturals customer! 🥥\n\n_LIIMRA Naturals Distribution_`;
    case 'welcome':
      return `Welcome to LIIMRA Naturals, ${name}! 👋\n\nYour subscription has been activated. We look forward to delivering fresh coconuts to your doorstep every day!\n\nFor any queries, feel free to reach out.\n\n_LIIMRA Naturals Distribution_`;
    case 'delivery':
      return `Hi ${name}, ✅\n\nYour LIIMRA Naturals delivery for today has been completed successfully.\n\nThank you!\n_LIIMRA Naturals Distribution_`;
    case 'skip':
      return `Hi ${name}, ⏭\n\nWe have acknowledged your skip request for today's delivery slot. Your subscription continues as normal from tomorrow.\n\n_LIIMRA Naturals Distribution_`;
    case 'payment':
      return `Dear ${name}, 💰\n\nThis is a gentle reminder that you have an outstanding balance on your LIIMRA Naturals account. Kindly clear the dues at your earliest convenience.\n\nThank you!\n_LIIMRA Naturals Distribution_`;
    case 'renewal':
      return `Hi ${name}, 🔄\n\nYour LIIMRA Naturals subscription is expiring soon. Please renew to continue enjoying fresh coconuts without interruption.\n\n_LIIMRA Naturals Distribution_`;
    default:
      return `Dear ${name},\n\nA message from LIIMRA Naturals Distribution.`;
  }
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const statusBadge = (s: string) =>
  s === 'delivered' ? 'bg-brand-100 text-brand-700' : 'bg-amber-100 text-amber-700';

// ─── Main component ───────────────────────────────────────────────────────────
export default function WhatsAppHub() {
  const queryClient = useQueryClient();

  const [selectedCustomerId, setSelectedCustomerId]   = useState('');
  const [selectedTemplate, setSelectedTemplate]       = useState('invoice');
  const [customMessage, setCustomMessage]             = useState('');
  const [useCustom, setUseCustom]                     = useState(false);
  const [successId, setSuccessId]                     = useState<string | null>(null);

  // ── Queries ─────────────────────────────────────────────────────────────────
  const { data: customersRaw } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const customers: any[] = customersRaw?.customers ?? customersRaw ?? [];

  const { data: waData, isLoading: logsLoading } = useQuery({
    queryKey: ['whatsapp'],
    queryFn: getWhatsApp,
  });
  const logs: any[] = waData?.messages ?? [];

  // ── Mutations ────────────────────────────────────────────────────────────────
  const logMutation = useMutation({
    mutationFn: logWhatsAppMessage,
    onSuccess: (data) => {
      setSuccessId(data.id);
      queryClient.invalidateQueries({ queryKey: ['whatsapp'] });
      setTimeout(() => setSuccessId(null), 4000);
    },
  });

  const sentMutation = useMutation({
    mutationFn: markWhatsAppSent,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whatsapp'] }),
  });

  // ── Derived values ───────────────────────────────────────────────────────────
  const selectedCustomer = customers.find((c: any) => c.id === selectedCustomerId);
  const messageBody      = useCustom ? customMessage : buildPreview(selectedTemplate, selectedCustomer);
  const waPhoneNumber    = selectedCustomer?.mobile?.replace(/\D/g, '') ?? '';
  const waLink           = `https://wa.me/${waPhoneNumber}?text=${encodeURIComponent(messageBody)}`;

  const handleCopyAndLog = async () => {
    if (!selectedCustomerId) return;
    await navigator.clipboard.writeText(messageBody).catch(() => {});
    logMutation.mutate({
      customer_id:   selectedCustomerId,
      template_type: useCustom ? 'custom' : selectedTemplate,
      message_body:  messageBody,
    });
  };

  const handleOpenWA = (logId?: string) => {
    if (logId) sentMutation.mutate(logId);
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">WhatsApp Hub</h1>
          <p className="text-xs text-slate-500">Compose, log and send messages to customers</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-brand-50 border border-brand-200 text-brand-700 font-medium px-3 py-1.5 rounded-lg">
            {waData?.stats?.sentCount ?? 0} sent
          </span>
          <span className="bg-amber-50 border border-amber-200 text-amber-700 font-medium px-3 py-1.5 rounded-lg">
            {waData?.stats?.pendingCount ?? 0} generated
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-3 gap-6">

          {/* ── LEFT COLUMN: Composer ──────────────────────────────── */}
          <div className="col-span-2 space-y-5">

            {/* Success toast */}
            {successId && (
              <div className="bg-brand-50 border border-brand-200 text-brand-700 rounded-xl px-5 py-3 text-sm flex items-center gap-2 animate-pulse">
                ✅ Message logged! Click "Open WhatsApp →" to send it.
              </div>
            )}
            {logMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-5 py-3 text-sm">
                ❌ {(logMutation.error as any)?.response?.data?.message ?? 'Failed to log message.'}
              </div>
            )}

            {/* Customer picker */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={e => setSelectedCustomerId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
              >
                <option value="">— Choose a customer —</option>
                {customers.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.customer_code}) — {c.mobile}
                  </option>
                ))}
              </select>

              {/* Customer info pill */}
              {selectedCustomer && (
                <div className="mt-3 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                    {selectedCustomer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">{selectedCustomer.name}</p>
                    <p className="text-xs text-slate-400">{selectedCustomer.mobile} · {selectedCustomer.customer_code}</p>
                  </div>
                  <a
                    href={`https://wa.me/${waPhoneNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Open WA Chat →
                  </a>
                </div>
              )}
            </div>

            {/* Template selector */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message Template</label>
                <button
                  onClick={() => setUseCustom(v => !v)}
                  className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
                    useCustom ? 'bg-brand-600 text-white border-brand-600' : 'text-slate-500 border-slate-200 hover:border-brand-400'
                  }`}
                >
                  {useCustom ? '✓ Custom Mode' : 'Write Custom'}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    disabled={useCustom}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`border rounded-xl p-3 text-left transition-all ${
                      useCustom
                        ? 'opacity-40 cursor-not-allowed border-slate-100'
                        : selectedTemplate === t.id
                          ? 'border-brand-400 bg-brand-50 ring-1 ring-brand-300'
                          : 'border-slate-200 hover:border-brand-300'
                    }`}
                  >
                    <div className="text-xl mb-1">{t.emoji}</div>
                    <div className="text-xs font-semibold text-slate-800">{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Message preview / editor */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {useCustom ? 'Custom Message' : 'Message Preview'}
                </label>
                {!useCustom && (
                  <span className="text-xs text-slate-400">Auto-generated from template</span>
                )}
              </div>

              {useCustom ? (
                <textarea
                  rows={8}
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  placeholder="Type your custom message here…"
                  className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all font-mono"
                />
              ) : (
                <div className="bg-[#e8fdd8] rounded-xl p-4 border border-[#c6f0a8] min-h-[180px]">
                  {!selectedCustomerId ? (
                    <p className="text-slate-400 text-sm text-center mt-8">← Select a customer to preview the message</p>
                  ) : (
                    <pre className="text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {messageBody}
                    </pre>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 flex gap-3">
                <button
                  disabled={!selectedCustomerId || logMutation.isPending}
                  onClick={handleCopyAndLog}
                  className="flex-1 border border-slate-300 hover:border-brand-400 disabled:opacity-50 text-slate-700 hover:text-brand-700 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {logMutation.isPending ? (
                    <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Logging…</>
                  ) : (
                    <><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>Copy & Log</>
                  )}
                </button>
                <button
                  disabled={!selectedCustomerId}
                  onClick={() => handleOpenWA(successId ?? undefined)}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  Open WhatsApp →
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Message Log ──────────────────────── */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 text-sm">Message Log</h3>
                <span className="text-xs text-slate-400">{logs.length} entries</span>
              </div>

              <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-50">
                {logsLoading && (
                  <div className="p-6 text-center text-xs text-slate-400">Loading…</div>
                )}
                {!logsLoading && logs.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No messages sent yet. Use the composer to send the first one.
                  </div>
                )}
                {logs.map((msg: any) => {
                  const t = TEMPLATES.find(t => t.id === msg.template_type) ?? { emoji: '💬', label: msg.template_type };
                  const isSending = sentMutation.isPending && sentMutation.variables === msg.id;
                  return (
                    <div key={msg.id} className="px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="text-base flex-shrink-0">{t.emoji}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-800 truncate">{msg.customer?.name ?? '—'}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{t.label}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {msg.sent_at
                                ? new Date(msg.sent_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                                : 'Not sent yet'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusBadge(msg.delivery_status)}`}>
                            {msg.delivery_status}
                          </span>
                          {msg.delivery_status === 'generated' && (
                            <button
                              disabled={isSending}
                              onClick={() => {
                                const phone = msg.customer?.mobile?.replace(/\D/g, '') ?? '';
                                sentMutation.mutate(msg.id);
                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg.message_body)}`, '_blank');
                              }}
                              className="text-[10px] font-medium text-green-600 hover:text-green-700 border border-green-200 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {isSending ? '…' : 'Send →'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
