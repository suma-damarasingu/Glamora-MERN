import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, XCircle, RefreshCw, CalendarCheck } from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings/my');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (error) {
      toast.error('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this pending appointment?')) return;

    try {
      setCancellingId(bookingId);
      const res = await api.put(`/bookings/${bookingId}/cancel`);
      if (res.data.success) {
        toast.success('Appointment cancelled successfully.');
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Salon Bookings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track your appointment statuses, dates, and reserved time slots.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'accepted', 'completed', 'declined', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
              statusFilter === tab
                ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
            }`}
          >
            {tab === 'all' ? `All Bookings (${bookings.length})` : tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings in this filter"
          description={
            statusFilter === 'all'
              ? 'You have not scheduled any beauty treatments yet.'
              : `You have no ${statusFilter} appointments.`
          }
          actionText="Book an Appointment"
          actionLink="/services"
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm card-hover-effect flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex items-start sm:items-center gap-4">
                <img
                  src={
                    booking.serviceId?.image ||
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={booking.serviceId?.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-rose-100 shrink-0"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
                    {booking.serviceId?.categoryId?.name || 'Salon Treatment'}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {booking.serviceId?.name || 'Service Booking'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                    <span className="flex items-center gap-1 font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md">
                      <Calendar className="w-3.5 h-3.5" /> {booking.date}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                      <Clock className="w-3.5 h-3.5" /> {booking.timeSlot}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5" /> {booking.address}
                    </span>
                  </div>

                  {booking.notes && (
                    <p className="text-xs text-slate-400 italic pt-1">
                      Notes: "{booking.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-rose-50">
                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Price</p>
                  <p className="text-lg font-black text-slate-900">${booking.price}</p>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={booking.status} />

                  {/* Cancel button: Allowed only when status is pending */}
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingId === booking._id}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
