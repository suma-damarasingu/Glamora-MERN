import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Scissors,
  Users,
  Heart,
  Settings,
  LogOut,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ role = 'customer' }) => {
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin menu: Strictly management only — NO "Book Appointment" or "My Appointments"
  const adminNavItems = [
    { name: 'Overview & Analytics', path: '/admin', icon: LayoutDashboard },
    { name: 'Appointments Management', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Categories & Services', path: '/admin/services', icon: Scissors },
    { name: 'Registered Customers', path: '/admin/customers', icon: Users },
    { name: 'Admin Settings', path: '/admin/settings', icon: Settings },
  ];

  // Customer menu: Includes Book Appointment and My Appointments
  const customerNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Services', path: '/services', icon: Scissors },
    { name: 'Book Appointment', path: '/book', icon: Calendar },
    { name: 'My Appointments', path: '/dashboard/bookings', icon: CalendarCheck },
    { name: 'My Favorites', path: '/dashboard/favorites', icon: Heart },
    { name: 'Account Settings', path: '/dashboard/settings', icon: Settings },
  ];

  // Determine active menu based on effective role
  const isActualAdmin = isAdmin || role === 'admin';
  const navItems = isActualAdmin ? adminNavItems : customerNavItems;

  return (
    <aside className="w-64 bg-white border-r border-rose-100 flex flex-col min-h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-rose-100">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-400 text-white flex items-center justify-center shadow-md shadow-rose-200">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">
              GLAMORA
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              {isActualAdmin ? 'Admin Portal' : 'Client Studio'}
            </span>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/dashboard'}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md shadow-rose-200'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile card & Logout */}
      <div className="p-4 border-t border-rose-100 bg-rose-50/30">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-rose-100 shadow-sm mb-3">
          <img
            src={user?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt={user?.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-200"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-rose-600 font-medium truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-700 bg-rose-100/60 hover:bg-rose-200/70 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
