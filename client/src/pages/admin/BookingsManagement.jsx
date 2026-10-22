import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import {
  CalendarCheck,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Search,
  AlertTriangle,
  Clock,
  MapPin
} from 'lucide-react';

const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (error) {
      toast.error('Failed to load bookings list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update status with slot conflict handling
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingId(bookingId);
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });

      if (res.data.success) {
        toast.success(res.data.message || `Booking marked as ${newStatus}!`);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (error) {
      // ⭐ FEATURE #2: Catch slot conflict rejection from server
      const conflictMsg = error.response?.data?.message || 'Could not update status.';
      if (error.response?.status === 409) {
        toast((t) => (
          <div className="flex items-start gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">⚠️ Slot Conflict Warning</p>
              <p className="text-slate-600 mt-0.5">{conflictMsg}</p>
            </div>
          </div>
        ), { duration: 6000 });
      } else {
        toast.error(conflictMsg);
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch =
      searchTerm === '' ||
      b.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.date?.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Appointment Bookings Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming requests, verify availability, and prevent slot conflicts.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Feature #2 Slot conflict Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-700">
          <span className="font-extrabold text-rose-700">FEATURE #2: SLOT CONFLICT DETECTION ACTIVE</span>
          <p className="text-slate-500 mt-0.5">
            The salon booking engine strictly forbids accepting two appointments at the same date and time slot. Conflicting requests will be caught automatically.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'accepted', 'completed', 'declined', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all shrink-0 ${
                statusFilter === tab
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
              }`}
            >
              {tab === 'all' ? `All (${bookings.length})` : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client or service..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-rose-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
          />
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No bookings found"
          description="There are no appointments matching this status filter or search query."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 border-b border-rose-100 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Client Details</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Address & Notes</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {filteredBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-rose-50/30 transition-colors">
                    {/* Client */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            b.userId?.profilePic ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={b.userId?.name}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-rose-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{b.userId?.name || 'Customer'}</p>
                          <p className="text-[11px] text-slate-400">{b.userId?.phone || b.userId?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <div>
                        <span>{b.serviceId?.name || 'Treatment'}</span>
                        <span className="block text-[10px] text-rose-500 font-semibold uppercase">
                          {b.serviceId?.duration}
                        </span>
                      </div>
                    </td>

                    {/* Date & Slot */}
                    <td className="py-4 px-4">
                      <span className="font-bold text-slate-900 block">{b.date}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-700">
                        {b.timeSlot}
                      </span>
                    </td>

                    {/* Address & Notes */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-700 truncate font-medium">{b.address}</p>
                      {b.notes && (
                        <p className="text-[11px] text-slate-400 italic truncate mt-0.5">
                          "{b.notes}"
                        </p>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 font-black text-slate-900">${b.price}</td>

                    {/* Status Badge */}
                    <td className="py-4 px-4">
                      <StatusBadge status={b.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Accept Button */}
                        {b.status !== 'accepted' && b.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'accepted')}
                            disabled={updatingId === b._id}
                            title="Accept Booking (Checks Slot Conflict)"
                            className="p-1.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {/* Mark Completed Button */}
                        {b.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'completed')}
                            disabled={updatingId === b._id}
                            title="Mark Completed"
                            className="p-1.5 rounded-lg text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors disabled:opacity-50"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}

                        {/* Decline Button */}
                        {b.status !== 'declined' && b.status !== 'completed' && (
                          <button
                            onClick={() => handleUpdateStatus(b._id, 'declined')}
                            disabled={updatingId === b._id}
                            title="Decline Booking"
                            className="p-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement;
