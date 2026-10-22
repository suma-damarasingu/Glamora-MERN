import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import CustomerOnly from '../../components/auth/CustomerOnly';
import AdminOnly from '../../components/auth/AdminOnly';
import ServiceCard from '../../components/customer/ServiceCard';
import BookingModal from '../../components/customer/BookingModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import { Search, Scissors, Sparkles, Plus, Settings } from 'lucide-react';

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [selectedService, setSelectedService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const { isAuthenticated, isCustomer, isAdmin } = useAuth();

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  // Fetch categories, services & user favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, servRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/services?category=${selectedCategory}&search=${encodeURIComponent(searchTerm)}`)
        ]);

        if (catRes.data.success) {
          setCategories(catRes.data.categories || []);
        }
        if (servRes.data.success) {
          setServices(servRes.data.services || []);
        }

        // If authenticated customer, fetch favorites to highlight heart icons
        if (isAuthenticated && isCustomer) {
          const favRes = await api.get('/favorites');
          if (favRes.data.success) {
            setFavorites(favRes.data.favorites || []);
          }
        }
      } catch (error) {
        console.error('Failed to load services data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, searchTerm, isAuthenticated, isCustomer]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const handleBookService = (service) => {
    // Admins do not book
    if (isAdmin) return;
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleFavoriteChange = (serviceId, isFavorited) => {
    if (isFavorited) {
      setFavorites((prev) => [...prev, { serviceId: { _id: serviceId } }]);
    } else {
      setFavorites((prev) => prev.filter((f) => f.serviceId?._id !== serviceId && f._id !== serviceId));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Beauty Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Our Services & Beauty Treatments
          </h1>
          <p className="text-sm text-rose-100 font-normal">
            {isAdmin
              ? 'Catalog preview mode. As an administrator, you manage pricing, service availability, and categories in the Admin Panel.'
              : 'Choose from our specialized hair, makeup, skincare, nail artistry, and soothing spa treatments. Select a slot and reserve your chair in seconds.'}
          </p>

          <AdminOnly>
            <div className="pt-2">
              <Link
                to="/admin/services"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all"
              >
                <Settings className="w-4 h-4 text-rose-400" />
                Go to Services & Categories Manager
              </Link>
            </div>
          </AdminOnly>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none flex-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
            }`}
          >
            All Departments
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => handleCategoryChange(cat._id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat._id
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search treatments..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-rose-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          />
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="No services found"
          description="We couldn't find any services matching your selection. Try browsing all departments or clearing your search."
          actionText="View All Services"
          onAction={() => {
            setSelectedCategory('all');
            setSearchTerm('');
            searchParams.delete('category');
            setSearchParams(searchParams);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard
              key={service._id}
              service={service}
              onBook={handleBookService}
              isFavorited={favorites.some(
                (f) => (f.serviceId?._id || f.serviceId) === service._id || f._id === service._id
              )}
              onFavoriteChange={handleFavoriteChange}
            />
          ))}
        </div>
      )}

      {/* Booking Modal (Customer Only) */}
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

export default ServicesPage;
