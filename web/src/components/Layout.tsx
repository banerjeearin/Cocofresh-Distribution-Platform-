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
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col flex-shrink-0 h-full">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">🥥</div>
          <div>
            <p className="font-semibold text-white leading-tight">CocoFresh</p>
            <p className="text-xs text-slate-400">Distribution Admin</p>
          </div>
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
