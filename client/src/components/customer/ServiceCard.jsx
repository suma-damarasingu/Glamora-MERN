import React, { useState } from 'react';
import { Heart, Clock, Sparkles, Edit, Eye } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import CustomerOnly from '../auth/CustomerOnly';
import AdminOnly from '../auth/AdminOnly';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';

const ServiceCard = ({
  service,
  onBook,
  isFavorited = false,
  onFavoriteChange
}) => {
  const { isAuthenticated, isCustomer, isAdmin } = useAuth();
  const [favorited, setFavorited] = useState(isFavorited);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please sign in to save services to your favorites.');
      navigate('/login');
      return;
    }

    try {
      setFavoriteLoading(true);
      const res = await api.post(`/favorites/${service._id}`);
      if (res.data.success) {
        setFavorited(res.data.isFavorited);
        toast.success(res.data.message);
        if (onFavoriteChange) onFavoriteChange(service._id, res.data.isFavorited);
      }
    } catch (error) {
      toast.error('Could not update favorite.');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleBookClick = (e) => {
    e.stopPropagation();
    // Safety check: Admins cannot book
    if (isAdmin) {
      toast.error('Admins cannot book services. Please use the Admin Panel to manage appointments.');
      return;
    }
    if (!isAuthenticated) {
      toast('Please sign in to book an appointment.', { icon: '🌸' });
      navigate('/login');
      return;
    }
    if (onBook) onBook(service);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-rose-100 shadow-sm card-hover-effect flex flex-col justify-between">
      {/* Top Image & Favorite Heart */}
      <div className="relative h-52 w-full overflow-hidden bg-rose-50">
        <Link to={`/services/${service._id}`}>
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 pointer-events-none"></div>

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-rose-700 shadow-sm">
          {service.categoryId?.name || 'Beauty'}
        </span>

        {/* Favorite Heart Button (kept for both roles) */}
        <button
          onClick={handleToggleFavorite}
          disabled={favoriteLoading}
          aria-label="Add to favorites"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 hover:scale-110 active:scale-90 transition-all shadow-sm"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'
            }`}
          />
        </button>

        {/* Price & Duration overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white pointer-events-none">
          <span className="flex items-center gap-1.5 text-xs font-medium backdrop-blur-md bg-black/30 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-rose-300" />
            {service.duration}
          </span>
          <span className="text-xl font-extrabold text-white drop-shadow-md">
            ${service.price}
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link to={`/services/${service._id}`}>
            <h3 className="font-bold text-base text-slate-900 mb-1.5 group-hover:text-rose-600 transition-colors line-clamp-1">
              {service.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
            {service.description || 'Professional beauty and pampering service.'}
          </p>
        </div>

        {/* Action Button - STRICTLY ROLE-BASED */}
        <div className="pt-2 border-t border-rose-50 flex items-center justify-between">
          {/* If Customer: Show Book Now */}
          {isCustomer && (
            <>
              <span className="text-xs font-bold text-rose-500">
                Available Slots Today
              </span>
              <button
                onClick={handleBookClick}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95"
              >
                Book Now
              </button>
            </>
          )}

          {/* If Admin: Strictly HIDE Book Now! Show Edit/Manage Service */}
          {isAdmin && (
            <>
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Manage Mode
              </span>
              <div className="flex items-center gap-2">
                <Link
                  to={`/services/${service._id}`}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  View
                </Link>
                <Link
                  to="/admin/services"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Service
                </Link>
              </div>
            </>
          )}

          {/* If Guest (unauthenticated): Show Book Now (prompts login) */}
          {!isAuthenticated && (
            <>
              <span className="text-xs font-bold text-rose-500">
                Available Slots Today
              </span>
              <button
                onClick={handleBookClick}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95"
              >
                Book Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
