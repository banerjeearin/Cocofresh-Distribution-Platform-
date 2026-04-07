import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, IndianRupee, FileText, MessageCircle } from 'lucide-react';

export default function Layout() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Deliveries', path: '/deliveries', icon: Truck },
    { name: 'Payments', path: '/payments', icon: IndianRupee },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'WhatsApp Hub', path: '/whatsapp-hub', icon: MessageCircle },
  ];

  return (
    <div className="bg-slate-50 text-slate-800 flex h-screen overflow-hidden">
      {/* ─── SIDEBAR ─── */}
      <aside className="w-64 bg-brand-900 text-slate-100 flex flex-col flex-shrink-0 h-full">
        <div className="px-5 py-4 border-b border-brand-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-400 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-brand-900" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
            </div>
            <div>
              <p className="font-black text-base text-brand-300 leading-none tracking-tight">LIIMRA</p>
              <p className="text-[9px] font-semibold text-brand-500 tracking-[0.2em] leading-tight">NATURALS</p>
            </div>
          </div>
          <p className="text-[10px] text-brand-600 mt-2 font-medium tracking-wide">Distribution Admin</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="px-6 text-[10px] uppercase tracking-widest text-slate-500 mb-2">Main</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-2.5 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'sidebar-link active text-white font-medium bg-white/10 border-l-4 border-brand-400'
                    : 'sidebar-link text-slate-300 hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        {/* User */}
        <div className="px-4 py-4 border-t border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">AD</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">Admin</p>
            <p className="text-[10px] text-slate-400">Owner</p>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
