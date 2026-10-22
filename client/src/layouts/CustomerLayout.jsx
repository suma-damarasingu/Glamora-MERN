import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { Menu, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import CustomerOnly from '../components/auth/CustomerOnly';

const CustomerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#FAF7F8]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen">
        <Sidebar role="customer" />
      </div>

      {/* Mobile Sidebar Modal/Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-64 max-w-xs bg-white h-full z-10 shadow-2xl">
            <Sidebar role="customer" />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-rose-100 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Welcome back, {user?.name?.split(' ')[0]} ✨
              </h2>
              <p className="text-xs text-rose-500 font-medium hidden sm:block">
                Ready for your beauty and pampering appointment?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <CustomerOnly>
              <Link
                to="/services"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Book New Service
              </Link>
            </CustomerOnly>

            {/* Top-Right Clickable Profile Section */}
            <Link
              to="/dashboard/settings"
              className="flex items-center gap-2.5 p-1 rounded-2xl hover:bg-rose-50/80 transition-all cursor-pointer group"
              title="View & Edit Profile Settings"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-rose-600 transition-colors">
                  {user?.name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium truncate max-w-[160px]">
                  {user?.email}
                </p>
                {user?.phone && (
                  <p className="text-[9px] text-slate-400 font-medium truncate max-w-[160px]">
                    {user?.phone}
                  </p>
                )}
              </div>
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-rose-200 shrink-0 group-hover:ring-rose-400 transition-all">
                <img
                  src={user?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Nested Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
