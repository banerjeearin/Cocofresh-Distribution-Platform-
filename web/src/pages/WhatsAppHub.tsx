import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWhatsApp } from '../services/api';
import { getCustomers } from '../services/api';

export default function WhatsAppHub() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('invoice');

  const { data: waData, isLoading: waLoading } = useQuery({
    queryKey: ['whatsapp'],
    queryFn: getWhatsApp
  });

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: getCustomers
  });

  const customers = customersData?.customers ?? [];
  const messages = waData?.messages ?? [];

  const selectedCustomer = customers.find((c: any) => c.id === selectedCustomerId) ?? customers[0] ?? null;

  const templateMessages: Record<string, string> = {
    invoice: selectedCustomer
      ? `Dear ${selectedCustomer.name},\n\nHere is your CocoFresh invoice for April 2026.\n\n📍 *Delivery Address:* Home\n\n📅 *Period:* 1 Apr – 30 Apr 2026\n🥥 *Plan:* Subscription active\n\n---\n*BILLING*\n\nThank you for being a CocoFresh customer! 🥥\n\n_CocoFresh Distribution_`
      : 'Select a customer to generate a message.',
    welcome: selectedCustomer
      ? `Welcome to CocoFresh, ${selectedCustomer.name}! 👋\n\nYour subscription has been activated. We look forward to delivering fresh coconuts to your doorstep every day!\n\nFor any queries, feel free to reach out.\n\n_CocoFresh Distribution_`
      : 'Select a customer to generate a message.',
    delivery: selectedCustomer
      ? `Hi ${selectedCustomer.name}, ✅\n\nYour CocoFresh delivery has been completed successfully for today.\n\nThank you!\n_CocoFresh Distribution_`
      : 'Select a customer to generate a message.',
    skip: selectedCustomer
      ? `Hi ${selectedCustomer.name}, ⏭\n\nWe have acknowledged your skip request for today's delivery slot. Your subscription continues as normal from tomorrow.\n\n_CocoFresh Distribution_`
      : 'Select a customer to generate a message.',
    payment: selectedCustomer
      ? `Dear ${selectedCustomer.name}, 💰\n\nThis is a gentle reminder that you have an outstanding balance on your CocoFresh account. Kindly clear the dues at your earliest convenience.\n\nThank you!\n_CocoFresh Distribution_`
      : 'Select a customer to generate a message.',
    renewal: selectedCustomer
      ? `Hi ${selectedCustomer.name}, 🔄\n\nYour CocoFresh subscription is expiring soon. Please renew to continue enjoying fresh coconut deliveries without interruption.\n\n_CocoFresh Distribution_`
      : 'Select a customer to generate a message.',
  };

  const currentMessage = templateMessages[selectedTemplate] ?? '';

  const handleCopy = () => {
    if (bubbleRef.current) {
      navigator.clipboard.writeText(bubbleRef.current.innerText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const templates = [
    { id: 'invoice', icon: '📋', label: 'Monthly Invoice', desc: 'Full delivery + billing summary' },
    { id: 'welcome', icon: '👋', label: 'Welcome', desc: 'New customer onboarding' },
    { id: 'delivery', icon: '✅', label: 'Delivery Confirmation', desc: 'Slot delivered notification' },
    { id: 'skip', icon: '⏭', label: 'Skip Acknowledgement', desc: 'Confirm customer skip request' },
    { id: 'payment', icon: '💰', label: 'Payment Reminder', desc: 'Outstanding balance alert' },
    { id: 'renewal', icon: '🔄', label: 'Renewal Reminder', desc: 'Subscription expiring soon' },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">WhatsApp Hub</h1>
          <p className="text-xs text-slate-500">Generate and copy messages for customers</p>
        </div>
        <div className="flex items-center gap-4">
          {waData && (
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg text-green-700 font-medium">
                ✓ {waData.stats?.sentCount ?? 0} sent
              </span>
              <span className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-700 font-medium">
                ⏳ {waData.stats?.pendingCount ?? 0} pending
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
            Manual send mode (Phase 1)
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Select customer */}
        <div className="w-72 border-r border-slate-200 bg-white flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Select Customer</p>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input type="text" placeholder="Search…" className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {customersLoading && (
              <div className="p-6 text-center text-sm text-slate-400">Loading customers…</div>
            )}
            {!customersLoading && customers.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">No customers yet.<br/>Add one to get started.</div>
            )}
            {customers.map((customer: any) => {
              const isActive = (selectedCustomerId ?? customers[0]?.id) === customer.id;
              return (
                <div
                  key={customer.id}
                  onClick={() => setSelectedCustomerId(customer.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${isActive ? 'bg-brand-50 border-l-2 border-brand-500' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">
                      {customer.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.phone}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER: Template selector */}
        <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message Templates</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`rounded-xl p-3 cursor-pointer transition-colors ${selectedTemplate === t.id ? 'border border-brand-300 bg-brand-50' : 'border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{t.icon}</span>
                  <p className={`text-sm ${selectedTemplate === t.id ? 'font-semibold text-slate-800' : 'font-medium text-slate-800'}`}>{t.label}</p>
                </div>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Message Log */}
          {messages.length > 0 && (
            <div className="border-t border-slate-200 p-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recent Log</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {messages.slice(0, 5).map((msg: any) => (
                  <div key={msg.id} className="text-xs text-slate-600 bg-white border border-slate-100 rounded-lg px-2 py-1.5">
                    <p className="font-medium truncate">{msg.customer?.name}</p>
                    <p className="text-slate-400">{msg.template_type} · {msg.delivery_status}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Preview & copy */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#e5ddd5]">
          {/* WA header bar */}
          <div className="bg-[#075e54] px-6 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
              {selectedCustomer?.name?.substring(0, 2).toUpperCase() ?? '?'}
            </div>
            <div>
              <p className="font-semibold text-white">{selectedCustomer?.name ?? 'Select a customer'}</p>
              <p className="text-xs text-green-300">{selectedCustomer?.phone ?? ''}</p>
            </div>
            <div className="ml-auto flex gap-3">
              <svg className="w-5 h-5 text-white opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
          </div>

          {/* Message area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-start mb-4">
              <div ref={bubbleRef} className="bg-green-100 rounded-lg rounded-tl-none max-w-sm p-4 shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                {currentMessage}
              </div>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-400">Message ready to copy…</div>
            <button onClick={handleCopy} className="bg-[#25d366] hover:bg-[#20c25a] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>
            {selectedCustomer?.phone && (
              <a
                href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#075e54] hover:bg-[#054d45] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                Open WhatsApp →
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
