import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const CustomerRoute = () => {
  const { isAuthenticated, isCustomer, isLoading } = useAuth();

  // Instant fallback check with localStorage to prevent transit bounce
  const token = localStorage.getItem('glamora_token');
  const storedUser = localStorage.getItem('glamora_user')
    ? JSON.parse(localStorage.getItem('glamora_user'))
    : null;

  const authed = isAuthenticated || Boolean(token && storedUser);
  const customer = isCustomer || storedUser?.role === 'customer';

  if (isLoading && !authed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50/50">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-rose-800 tracking-wide">Loading Glamora...</p>
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  if (!customer) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
};

export default CustomerRoute;
