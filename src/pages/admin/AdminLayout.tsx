import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, FileText, Users, Image, Info,
  Settings, LogOut, Building2, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

const adminNav = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { label: 'Village Info', path: '/admin/village-info', icon: Info },
  { label: 'Schemes', path: '/admin/schemes', icon: FileText },
  { label: 'Gallery', path: '/admin/gallery', icon: Image },
  { label: 'Notices', path: '/admin/notices', icon: FileText },
  { label: 'Members', path: '/admin/members', icon: Users },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-primary-800 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white">
          <Building2 size={20} />
        </div>
        <div>
          <span className="block text-sm font-semibold leading-tight text-white">Admin Panel</span>
          <span className="block text-xs text-primary-400 leading-tight">Gram Panchayat</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {adminNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-primary-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-primary-800 p-3 shrink-0">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-primary-400 hover:bg-white/5 hover:text-white transition-colors w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Desktop sidebar */}
      <aside className="w-64 bg-primary-900 text-primary-300 flex flex-col fixed inset-y-0 left-0 z-30 hidden lg:flex">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-primary-950/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-primary-900 flex flex-col animate-slide-in-right" style={{ animationName: 'slideInLeft' }}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-primary-400 hover:text-white">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <div className="bg-white border-b border-primary-100 h-14 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-primary-600 hover:bg-primary-100"
            >
              <Menu size={20} />
            </button>
            <span className="text-sm font-medium text-primary-600">
              Logged in as <span className="text-primary-900 font-semibold">{user?.email}</span>
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-500 hover:bg-error-50 hover:text-error-600 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

        <div className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
