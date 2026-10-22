import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import CustomerOnly from '../../components/auth/CustomerOnly';
import AdminOnly from '../../components/auth/AdminOnly';
import ServiceCard from '../../components/customer/ServiceCard';
import BookingModal from '../../components/customer/BookingModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Sparkles, Calendar, ShieldCheck, Heart, ArrowRight, Star, Clock, LayoutDashboard } from 'lucide-react';

const HomePage = () => {
  const { user, isAuthenticated, isAdmin, isCustomer } = useAuth();
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, servRes] = await Promise.all([
          api.get('/categories'),
          api.get('/services')
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
        if (servRes.data.success) {
          setFeaturedServices(servRes.data.services.slice(0, 6) || []);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleBookService = (service) => {
    // Strictly prevent admin from opening booking modal
    if (isAdmin) return;
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-100/50 via-rose-50/30 to-[#FAF7F8] py-20 lg:py-28">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 rounded-full bg-pink-200/40 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-rose-200 text-rose-600 text-xs font-bold tracking-wide">
                <Sparkles className="w-4 h-4 text-rose-500 animate-spin" />
                PREMIUM BEAUTY & WELLNESS EXPERIENCE
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Embrace Your Radiance with{' '}
                <span className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 bg-clip-text text-transparent">
                  Glamora
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Indulge in bespoke haircuts, bridal makeup, revitalizing facials, and calming spa therapies. Reserve appointment time slots seamlessly with real-time availability.
              </p>

              {/* CTAs conditional on role */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {/* 1. If Admin: Show Go to Dashboard (NO Booking CTAs) */}
                <AdminOnly>
                  <Link
                    to="/admin/dashboard"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-xl shadow-slate-300 transition-all hover:scale-102 active:scale-98"
                  >
                    <LayoutDashboard className="w-5 h-5 text-rose-400" />
                    Go to Admin Dashboard
                  </Link>
                  <Link
                    to="/services"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-700 bg-white hover:bg-rose-50/60 border border-rose-200 shadow-sm transition-all hover:scale-102"
                  >
                    View Services Menu
                  </Link>
                </AdminOnly>

                {/* 2. If Customer: Show Book Appointment CTA */}
                <CustomerOnly>
                  <Link
                    to="/book"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-xl shadow-rose-200 transition-all hover:scale-102 active:scale-98"
                  >
                    <Calendar className="w-5 h-5" />
                    Book Appointment Now
                  </Link>
                  <Link
                    to="/services"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-700 bg-white hover:bg-rose-50/60 border border-rose-200 shadow-sm transition-all hover:scale-102"
                  >
                    Explore Services Menu
                  </Link>
                </CustomerOnly>

                {/* 3. If Guest (Unauthenticated): Show Explore and Sign In/Register */}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/services"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-xl shadow-rose-200 transition-all hover:scale-102 active:scale-98"
                    >
                      Explore Services Menu
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/register"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-slate-700 bg-white hover:bg-rose-50/60 border border-rose-200 shadow-sm transition-all hover:scale-102"
                    >
                      Book Appointment
                    </Link>
                  </>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-rose-200/60 max-w-md mx-auto lg:mx-0 text-center">
                <div>
                  <p className="text-2xl font-black text-slate-900">100%</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Certified Pros</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-rose-600">5.0 ★</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Salon Rating</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">0 Conflict</p>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Smart Slots</p>
                </div>
              </div>
            </div>

            {/* Hero Image Collage */}
            <div className="relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/3] lg:aspect-[4/3]">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80"
                    alt="Glamora Salon Studio"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">
                      Sanctuary of Luxury
                    </span>
                    <h3 className="text-xl font-bold mt-2">Personalized Beauty Treatments</h3>
                    <p className="text-xs text-rose-100">Carefully curated for your unique glow.</p>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-rose-100 hidden sm:flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                    ✨
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Slot Guard Technology</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">Zero Double Booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            Signature Departments
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            Browse By Category
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Select a beauty department to discover dedicated services and treatments.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {loading
            ? [1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-44 bg-rose-100/50 rounded-3xl animate-pulse"></div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/services?category=${cat._id}`}
                  className="group relative rounded-3xl overflow-hidden aspect-[4/5] shadow-sm border border-rose-100 card-hover-effect flex flex-col justify-end p-4 text-white"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"></div>
                  <div className="relative z-10">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-rose-300 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-rose-200 line-clamp-1 font-medium">
                      {cat.description || `${cat.name} treatments`}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
              Most Loved
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Popular Services & Treatments
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Top requested beauty services with verified client satisfaction.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700"
          >
            View Full Menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard
                key={service._id}
                service={service}
                onBook={handleBookService}
              />
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Slot Availability & Conflict Detection</h3>
              <p className="text-xs text-rose-100 leading-relaxed">
                Prevents double-booking automatically. Real-time slot locking guarantees your salon chair is ready.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Smart Recommendations</h3>
              <p className="text-xs text-rose-100 leading-relaxed">
                Personalized "For You" curation based on your past appointment categories and favorite styles.
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-rose-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">2-Step Email Verification</h3>
              <p className="text-xs text-rose-100 leading-relaxed">
                Fortified account security with Nodemailer one-time passwords for registration and sign-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal (Only mounted and opened for non-admin customers) */}
      {!isAdmin && selectedService && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedService(null);
          }}
          service={selectedService}
        />
      )}
    </div>
  );
};

export default HomePage;
