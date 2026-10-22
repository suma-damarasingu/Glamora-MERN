import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ServiceCard from '../../components/customer/ServiceCard';
import BookingModal from '../../components/customer/BookingModal';
import { CardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import toast from 'react-hot-toast';
import { Heart } from 'lucide-react';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/favorites');
      if (res.data.success) {
        setFavorites(res.data.favorites || []);
      }
    } catch (error) {
      toast.error('Failed to load favorites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleBookService = (service) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  const handleFavoriteChange = (serviceId, isFavorited) => {
    if (!isFavorited) {
      setFavorites((prev) => prev.filter((f) => f.serviceId?._id !== serviceId));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          My Favorite Services
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Quickly access and book your saved treatments anytime.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites saved yet"
          description="Browse our beauty catalog and tap the heart icon on any service to save it here for fast booking."
          actionText="Browse Beauty Catalog"
          actionLink="/services"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const service = fav.serviceId;
            if (!service) return null;
            return (
              <ServiceCard
                key={service._id}
                service={service}
                isFavorited={true}
                onBook={handleBookService}
                onFavoriteChange={handleFavoriteChange}
              />
            );
          })}
        </div>
      )}

      {selectedService && (
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

export default FavoritesPage;
