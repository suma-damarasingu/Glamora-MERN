import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import CustomerOnly from '../auth/CustomerOnly';
import AdminOnly from '../auth/AdminOnly';
import { Sparkles, Heart, Calendar, LogOut, Menu, X, ShieldAlert, Scissors } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isCustomer, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-pink-400 text-white flex items-center justify-center shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                GLAMORA
              </span>
              <span className="block text-[10px] font-semibold tracking-widest uppercase text-rose-400">
                Luxury Beauty Studio
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-rose-600 font-semibold' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Home
            </Link>
            <Link
              to="/services"
              className={`text-sm font-medium transition-colors ${
                isActive('/services') ? 'text-rose-600 font-semibold' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Services & Menu
            </Link>

            {/* Customer Only Navigation Links */}
            <CustomerOnly>
              <Link
                to="/book"
                className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/book') ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Calendar className="w-4 h-4 text-rose-500" />
                Book Appointment
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-rose-600 font-semibold' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/bookings"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard/bookings') || isActive('/my-appointments')
                    ? 'text-rose-600 font-semibold'
                    : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                My Bookings
              </Link>
              <Link
                to="/dashboard/favorites"
                className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard/favorites') ? 'text-rose-600 font-semibold' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Favorites
              </Link>
            </CustomerOnly>

            {/* Admin Only Navigation Links */}
            <AdminOnly>
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Admin Panel
              </Link>
              <Link
                to="/admin/bookings"
                className={`text-sm font-medium transition-colors ${
                  isActive('/admin/bookings') ? 'text-rose-600 font-semibold' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                Manage Bookings
              </Link>
            </AdminOnly>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to={isAdmin ? '/admin/settings' : '/dashboard/settings'}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100"
                >
                  <img
                    src={user?.profilePic || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
                  />
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 leading-tight">{user?.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-rose-600 font-medium capitalize">{user?.role}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 rounded-xl shadow-md shadow-rose-200 transition-all active:scale-95"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-rose-100 bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            Services & Menu
          </Link>

          {/* Customer only in mobile menu */}
          <CustomerOnly>
            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-bold text-rose-600 bg-rose-50 rounded-lg"
            >
              Book Appointment
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              My Bookings
            </Link>
            <Link
              to="/dashboard/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              Favorites
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              Settings
            </Link>
          </CustomerOnly>

          {/* Admin only in mobile menu */}
          <AdminOnly>
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-semibold text-rose-600 bg-rose-50 rounded-lg"
            >
              Admin Dashboard
            </Link>
            <Link
              to="/admin/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              Manage Bookings
            </Link>
            <Link
              to="/admin/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              Services & Categories
            </Link>
          </AdminOnly>

          <div className="pt-4 border-t border-rose-100">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-base font-medium text-rose-600 bg-rose-50 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 rounded-xl"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
