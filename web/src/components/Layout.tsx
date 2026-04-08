import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Truck, IndianRupee, FileText, MessageCircle, Settings, Menu, X, LogOut } from 'lucide-react';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Get logged-in user from localStorage
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }
  const navItems = [
    { name: 'Dashboard',    path: '/dashboard',    icon: LayoutDashboard },
    { name: 'Customers',    path: '/customers',    icon: Users },
    { name: 'Deliveries',   path: '/deliveries',   icon: Truck },
    { name: 'Payments',     path: '/payments',     icon: IndianRupee },
    { name: 'Invoices',     path: '/invoices',     icon: FileText },
    { name: 'WhatsApp Hub', path: '/whatsapp-hub', icon: MessageCircle },
    { name: 'Settings',     path: '/settings',     icon: Settings },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="bg-slate-50 text-slate-800 flex h-screen overflow-hidden">
      
      {/* ─── MOBILE BACKDROP ─── */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* ─── SIDEBAR (Desktop Fixed, Mobile Drawer) ─── */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-900 text-slate-100 flex flex-col flex-shrink-0 h-full transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="px-5 py-4 border-b border-brand-800 flex justify-between items-center">
          <div>
            <div className="bg-white rounded-xl p-2 inline-flex">
              <img src="/liimra-logo.png" alt="LIIMRA Naturals" className="h-8 w-auto object-contain" />
            </div>
            <p className="text-[10px] text-brand-500 mt-2 font-medium tracking-wide">Distribution Admin</p>
          </div>
          <button onClick={closeMenu} className="md:hidden text-slate-300 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <p className="px-6 text-[10px] uppercase tracking-widest text-slate-500 mb-2">Main</p>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={closeMenu}
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
        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-brand-500" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
                {(user.name || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Mobile Header */}
        <div className="md:hidden h-14 bg-brand-900 border-b border-brand-800 flex items-center justify-between px-4 flex-shrink-0">
          <div className="bg-white rounded-lg p-1.5 flex items-center">
            <img src="/liimra-logo.png" alt="LIIMRA" className="h-6 w-auto object-contain" />
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-200 hover:text-white p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
