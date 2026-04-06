import { useRef, useState } from 'react';

export default function WhatsAppHub() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (bubbleRef.current) {
      navigator.clipboard.writeText(bubbleRef.current.innerText).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">WhatsApp Hub</h1>
          <p className="text-xs text-slate-500">Generate and copy messages for customers</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
          Manual send mode (Phase 1)
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
            <div className="px-4 py-3 bg-brand-50 border-l-2 border-brand-500 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center">RA</div>
                <div><p className="text-sm font-semibold">Rahul Arora</p><p className="text-xs text-slate-500">+91 98765 43210</p></div>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-xs flex items-center justify-center">PS</div>
                <div><p className="text-sm font-medium">Priya Sharma</p><p className="text-xs text-slate-500">+91 91234 56789</p></div>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 font-semibold text-xs flex items-center justify-center">SG</div>
                <div><p className="text-sm font-medium">Sunita Gupta</p><p className="text-xs text-slate-500">+91 88122 44556</p></div>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">AM</div>
                <div><p className="text-sm font-medium">Arjun Mehta</p><p className="text-xs text-slate-500">+91 99001 55667</p></div>
              </div>
            </div>
            <div className="px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-semibold text-xs flex items-center justify-center">NK</div>
                <div><p className="text-sm font-medium">Neha Kapoor</p><p className="text-xs text-slate-500">+91 77889 00112</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: Template selector */}
        <div className="w-64 border-r border-slate-200 bg-slate-50 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Message Templates</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="border border-brand-300 bg-brand-50 rounded-xl p-3 cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">📋</span>
                <p className="text-sm font-semibold text-slate-800">Monthly Invoice</p>
              </div>
              <p className="text-xs text-slate-500">Full delivery + billing summary</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-3 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">👋</span>
                <p className="text-sm font-medium text-slate-800">Welcome</p>
              </div>
              <p className="text-xs text-slate-500">New customer onboarding</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-3 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">✅</span>
                <p className="text-sm font-medium text-slate-800">Delivery Confirmation</p>
              </div>
              <p className="text-xs text-slate-500">Slot delivered notification</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-3 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">⏭</span>
                <p className="text-sm font-medium text-slate-800">Skip Acknowledgement</p>
              </div>
              <p className="text-xs text-slate-500">Confirm customer skip request</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-3 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">💰</span>
                <p className="text-sm font-medium text-slate-800">Payment Reminder</p>
              </div>
              <p className="text-xs text-slate-500">Outstanding balance alert</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-3 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">📈</span>
                <p className="text-sm font-medium text-slate-800">Price / Qty Change</p>
              </div>
              <p className="text-xs text-slate-500">Mid-cycle plan update notice</p>
            </div>
            <div className="border border-slate-200 bg-white rounded-xl p-3 cursor-pointer hover:border-brand-300 hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">🔄</span>
                <p className="text-sm font-medium text-slate-800">Renewal Reminder</p>
              </div>
              <p className="text-xs text-slate-500">Subscription expiring soon</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Preview & copy */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#e5ddd5]">
          {/* WA header bar */}
          <div className="bg-[#075e54] px-6 py-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">RA</div>
            <div>
              <p className="font-semibold text-white">Rahul Arora</p>
              <p className="text-xs text-green-300">+91 98765 43210</p>
            </div>
            <div className="ml-auto flex gap-3">
              <svg className="w-5 h-5 text-white opacity-80" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
            </div>
          </div>

          {/* Message area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex justify-start mb-4">
              <div ref={bubbleRef} className="bg-green-100 rounded-lg rounded-tl-none max-w-sm p-4 shadow-sm text-sm text-slate-800 leading-relaxed whitespace-pre-line">
{`Dear Rahul Arora,

Here is your CocoFresh invoice for April 2026.

📍 *Delivery Address:* Home, Andheri West

📅 *Period:* 1 Apr – 30 Apr 2026
🥥 *Plan:* 2 nuts/slot · Both slots · ₹30/nut

---
*DELIVERY SUMMARY*

✅ Morning Slots: 27 delivered
✅ Evening Slots: 27 delivered
⏭ Skipped: 2 slots

---
*BILLING*

Total Coconuts: 108
Total Billed: ₹5,280
Advance Paid: ₹5,280
*Balance Due: ₹0* ✓

Thank you for being a CocoFresh customer! 🥥

_CocoFresh Distribution_`}
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
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="bg-[#075e54] hover:bg-[#054d45] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm">
              Open WhatsApp →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
