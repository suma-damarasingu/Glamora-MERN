import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ServiceCard from './ServiceCard';
import { CardSkeleton } from '../common/Skeleton';
import { Sparkles, Compass } from 'lucide-react';

const RecommendedSection = ({ onBookService, favorites = [], onFavoriteChange }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await api.get('/recommendations');
        if (res.data.success) {
          setRecommendations(res.data.recommendations || []);
          setReason(res.data.reason || 'Curated for you');
        }
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="my-8">
        <div className="h-6 w-48 bg-rose-100/50 rounded mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <section className="my-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-white border border-rose-100 shadow-sm relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-200/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            FEATURE #3: SMART RECOMMENDATIONS
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Recommended For You
          </h2>
          <p className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            {reason}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recommendations.map((service) => (
          <ServiceCard
            key={service._id}
            service={service}
            onBook={onBookService}
            isFavorited={favorites.some((f) => f.serviceId?._id === service._id || f._id === service._id)}
            onFavoriteChange={onFavoriteChange}
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedSection;
