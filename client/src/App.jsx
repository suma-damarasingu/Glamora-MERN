import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import CustomerRoute from './routes/CustomerRoute';
import AdminRoute from './routes/AdminRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailsPage from './pages/public/ServiceDetailsPage';
import BookingPage from './pages/public/BookingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import FavoritesPage from './pages/customer/FavoritesPage';
import SettingsPage from './pages/customer/SettingsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import BookingsManagement from './pages/admin/BookingsManagement';
import ServicesManagement from './pages/admin/ServicesManagement';
import CustomersPage from './pages/admin/CustomersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Toast Notifications Provider */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '16px',
              border: '1px solid #ffe4e6',
              boxShadow: '0 10px 25px -5px rgba(225, 29, 72, 0.12)',
              fontSize: '13px',
              fontWeight: 600
            },
            success: {
              iconTheme: {
                primary: '#e11d48',
                secondary: '#ffffff'
              }
            }
          }}
        />

        <Routes>
          {/* Public Routes Wrapped in PublicLayout */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* Customer Only Protected Routes: Booking Flow & Customer Dashboard */}
          <Route element={<CustomerRoute />}>
            <Route element={<PublicLayout />}>
              <Route path="/book" element={<BookingPage />} />
              <Route path="/book/:serviceId" element={<BookingPage />} />
            </Route>
            <Route path="/dashboard" element={<CustomerLayout />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="bookings" element={<MyBookingsPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="/my-appointments" element={<Navigate to="/dashboard/bookings" replace />} />
          </Route>

          {/* Admin Only Protected Routes: Management Only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="appointments" element={<BookingsManagement />} />
              <Route path="bookings" element={<BookingsManagement />} />
              <Route path="services" element={<ServicesManagement />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Convenience Profile & Settings Redirects */}
          <Route path="/profile" element={<Navigate to="/dashboard/settings" replace />} />
          <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
          <Route path="/admin/profile" element={<Navigate to="/admin/settings" replace />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
