import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import CustomerOnly from '../../components/auth/CustomerOnly';
import AdminOnly from '../../components/auth/AdminOnly';
import BookingModal from '../../components/customer/BookingModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import {
  Clock,
  Heart,
  Sparkles,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Edit,
  Power
} from 'lucide-react';

const ServiceDetailsPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isAdmin, isCustomer } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  useEffect(() => {
    const fetchServiceAndFavorites = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/services/${id}`);
        if (res.data.success) {
          setService(res.data.service);
        }

        if (isAuthenticated && isCustomer) {
          const favRes = await api.get('/favorites');
          if (favRes.data.success) {
            const hasFav = favRes.data.favorites?.some(
              (f) => (f.serviceId?._id || f.serviceId) === id
            );
            setIsFavorited(hasFav);
          }
        }
      } catch (error) {
        toast.error('Failed to load service details.');
      } finally {
        setLoading(false);
      }
    };
    fetchServiceAndFavorites();
  }, [id, isAuthenticated, isCustomer]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast('Please sign in to favorite this service.', { icon: '🌸' });
      navigate('/login');
      return;
    }
    try {
      setFavLoading(true);
      const res = await api.post(`/favorites/${id}`);
      if (res.data.success) {
        setIsFavorited(res.data.isFavorited);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error('Could not update favorites.');
    } finally {
      setFavLoading(false);
    }
  };

  const handleToggleActiveStatus = async () => {
    if (!isAdmin || !service) return;
    try {
      setTogglingActive(true);
      const res = await api.put(`/services/${service._id}`, {
        isActive: !service.isActive
      });
      if (res.data.success) {
        setService(res.data.service);
        toast.success(
          `Service is now ${res.data.service.isActive ? 'Active (Visible)' : 'Deactivated (Hidden)'}`
        );
      }
    } catch (error) {
      toast.error('Failed to update service status.');
    } finally {
      setTogglingActive(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <CardSkeleton />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <p className="text-slate-500">Service not found.</p>
        <Link to="/services" className="text-rose-600 font-bold mt-2 inline-block">
          Return to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services Menu
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Service Image */}
        <div className="relative rounded-3xl overflow-hidden aspect-[4/3] bg-rose-50 border border-rose-100 shadow-lg">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/90 backdrop-blur-md text-rose-700 shadow-sm">
            {service.categoryId?.name || 'Treatment'}
          </span>

          {/* Favorite Heart for both roles */}
          <button
            onClick={handleToggleFavorite}
            disabled={favLoading}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:scale-110 active:scale-95 transition-all shadow-md"
            aria-label="Add to favorites"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`}
            />
          </button>
        </div>

        {/* Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
                {service.categoryId?.name} Department
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  service.isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {service.isActive ? 'Available' : 'Deactivated'}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {service.name}
            </h1>

            <div className="flex items-center gap-4 mt-3">
              <span className="text-3xl font-black text-rose-600">
                ${service.price}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-rose-50 px-3 py-1 rounded-xl">
                <Clock className="w-4 h-4 text-rose-500" />
                {service.duration} Session
              </span>
            </div>
          </div>

          <div className="border-t border-b border-rose-100 py-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Treatment Description
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {service.description || 'Enjoy our tailored salon care delivered by certified beauty specialists.'}
            </p>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-rose-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Certified Stylist</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-rose-100">
              <ShieldCheck className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Conflict-Free Booking</span>
            </div>
          </div>

          {/* Role-Specific Actions */}
          <div className="pt-2">
            {/* Customer Only: Book Button */}
            <CustomerOnly>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="flex-1 py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-98 text-center"
                >
                  Book Appointment Now
                </button>
                <Link
                  to={`/book/${service._id}`}
                  className="px-5 py-3.5 rounded-2xl text-sm font-bold text-slate-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  Full Booking Form
                </Link>
              </div>
            </CustomerOnly>

            {/* Guest (Unauthenticated): Sign in to Book */}
            {!isAuthenticated && (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block w-full py-3.5 px-6 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-200 transition-all text-center"
                >
                  Sign In to Book Appointment
                </Link>
                <p className="text-[11px] text-slate-400 text-center">
                  Only verified customer accounts can reserve appointment time slots.
                </p>
              </div>
            )}

            {/* Admin Only: Management Actions (Never Book!) */}
            <AdminOnly>
              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Admin Management Controls</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  As an administrator, you manage this service. Booking on your own behalf is disabled.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    to="/admin/services"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit in Services Manager
                  </Link>
                  <button
                    onClick={handleToggleActiveStatus}
                    disabled={togglingActive}
                    className="inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-amber-100 border border-amber-300 transition-colors disabled:opacity-50"
                  >
                    <Power className="w-3.5 h-3.5 text-amber-600" />
                    {service.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </AdminOnly>
          </div>
        </div>
      </div>

      {/* Booking Modal (Only used if customer) */}
      {isCustomer && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          service={service}
          onSuccess={() => navigate('/dashboard/bookings')}
        />
      )}
    </div>
  );
};

export default ServiceDetailsPage;
