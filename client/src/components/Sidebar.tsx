import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, Settings, Zap } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/listings', icon: List, label: 'Listings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  return (
    <aside className="w-[220px] min-h-screen bg-sidebar flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-tight">eBay Hunter</p>
          <p className="text-white/40 text-[11px] leading-tight">Misspelling Finder</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 mb-1">
          Menu
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors duration-100 ${
                isActive
                  ? 'bg-sidebarActive text-white'
                  : 'text-white/60 hover:bg-sidebarHover hover:text-white'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-white/25 text-[11px]">v1.0.0</p>
      </div>
    </aside>
  );
}
