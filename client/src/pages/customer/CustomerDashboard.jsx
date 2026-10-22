import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import RecommendedSection from '../../components/customer/RecommendedSection';
import BookingModal from '../../components/customer/BookingModal';
import StatusBadge from '../../components/common/StatusBadge';
import { Calendar, Heart, Sparkles, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [catRes, bookRes, favRes] = await Promise.all([
        api.get('/categories'),
        api.get('/bookings/my'),
        api.get('/favorites')
      ]);

      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (bookRes.data.success) setRecentBookings(bookRes.data.bookings || []);
      if (favRes.data.success) setFavorites(favRes.data.favorites || []);
    } catch (error) {
      console.error('Failed to load customer dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookService = (service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchDashboardData();
  };

  const activeBookingsCount = recentBookings.filter(
    (b) => b.status === 'pending' || b.status === 'accepted'
  ).length;

  const completedCount = recentBookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 p-6 sm:p-8 text-white shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Client Sanctuary
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hello, {user?.name}! Ready to look glamorous?
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 max-w-lg">
              Explore your personalized beauty recommendations below or pick from your favorite salon treatments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-rose-600 hover:bg-rose-50 shadow-md transition-all active:scale-95 text-center"
            >
              Browse Full Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Appointments
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{activeBookingsCount}</h3>
            <span className="text-[11px] text-amber-600 font-semibold">Pending & Accepted</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Visits
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{completedCount}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">Fulfilled</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Favorites
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{favorites.length}</h3>
            <span className="text-[11px] text-rose-600 font-semibold">Quick Access</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
        </div>
      </div>

      {/* ⭐ FEATURE #3: SMART RECOMMENDATIONS ("For You" SECTION) */}
      <RecommendedSection
        onBookService={handleBookService}
        favorites={favorites}
        onFavoriteChange={() => fetchDashboardData()}
      />

      {/* Recent Bookings Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Upcoming & Recent Bookings</h3>
            <p className="text-xs text-slate-500">Live status of your reserved salon visits</p>
          </div>
          <Link
            to="/dashboard/bookings"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            View All ({recentBookings.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            You don't have any appointments booked yet. Browse services above to reserve your chair!
          </div>
        ) : (
          <div className="divide-y divide-rose-50">
            {recentBookings.slice(0, 4).map((booking) => (
              <div key={booking._id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <img
                    src={booking.serviceId?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'}
                    alt={booking.serviceId?.name}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-rose-100"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {booking.serviceId?.name || 'Beauty Treatment'}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-rose-500" /> {booking.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-rose-500" /> {booking.timeSlot}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-sm font-extrabold text-slate-900">${booking.price}</span>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
