import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, MapPin, Check, Edit3, Calendar, Sparkles, FileText } from 'lucide-react';
import { format, addDays } from 'date-fns';
import TimeSlotPicker from './TimeSlotPicker';

const BookingModal = ({ isOpen, onClose, service, onSuccess }) => {
  const PARLOUR_CLOSING_HOUR = 20;

  // Auto next-day if current time is past parlour closing hour
  const getInitialDateStr = () => {
    const now = new Date();
    if (now.getHours() >= PARLOUR_CLOSING_HOUR) {
      return format(addDays(now, 1), 'yyyy-MM-dd');
    }
    return format(now, 'yyyy-MM-dd');
  };

  // Retrieve saved address from localStorage or props
  const savedAddress = localStorage.getItem('salonAddress') || "Attili, West Godavari, Andhrapradesh-534134";

  const [date, setDate] = useState(getInitialDateStr());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [address, setAddress] = useState(savedAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [notes, setNotes] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotStatus, setSlotStatus] = useState([]);

  // Sync address from localStorage in real-time if updated by admin
  useEffect(() => {
    const syncAddress = () => {
      const saved = localStorage.getItem('salonAddress') || "Attili, West Godavari, Andhrapradesh-534134";
      setAddress(saved);
    };
    window.addEventListener('storage', syncAddress);
    window.addEventListener('salonAddressUpdated', syncAddress);
    return () => {
      window.removeEventListener('storage', syncAddress);
      window.removeEventListener('salonAddressUpdated', syncAddress);
    };
  }, []);

  // When modal opens, refresh initial date & address
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('salonAddress') || "Attili, West Godavari, Andhrapradesh-534134";
      setAddress(saved);
      setIsEditingAddress(false);
      setDate(getInitialDateStr());
    }
  }, [isOpen]);

  // Fetch slot availability whenever date changes or modal opens
  useEffect(() => {
    if (isOpen && date && service?._id) {
      fetchAvailableSlots(date, service._id);
    }
  }, [isOpen, date, service?._id]);

  const fetchAvailableSlots = async (selectedDate, serviceId) => {
    try {
      setSlotsLoading(true);
      setSelectedSlot(''); // Reset selection on date/service change
      const sId = serviceId || service?._id;
      const res = await api.get(`/slots/available?date=${selectedDate}${sId ? `&serviceId=${sId}` : ''}`);
      if (res.data.success) {
        setSlotStatus(res.data.slotStatus || []);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load available time slots.');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      toast.error('Please pick an appointment date.');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please select an available time slot.');
      return;
    }
    if (!address.trim()) {
      toast.error('Please provide an appointment address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/bookings', {
        serviceId: service._id,
        date,
        timeSlot: selectedSlot,
        address: address.trim(),
        notes: notes.trim()
      });

      if (res.data.success) {
        toast.success('Appointment booked successfully! 🎉');
        if (onSuccess) onSuccess(res.data.booking);
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(errorMsg);
      // If slot was just taken, refresh slots
      fetchAvailableSlots(date, service._id);
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve Appointment" maxWidth="max-w-xl">
      <form onSubmit={handleBookingSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1 pr-2">
        {/* Service Overview Banner */}
        <div className="flex items-center gap-4 p-4 rounded-3xl bg-gradient-to-r from-rose-50/90 via-pink-50/50 to-white border border-rose-100/80 shadow-sm">
          <img
            src={service.image}
            alt={service.name}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-white shadow-md shadow-rose-100 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {service.categoryId?.name || 'Beauty Treatment'}
              </span>
              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                {service.duration || '60 mins'}
              </span>
            </div>
            <h4 className="text-base font-extrabold text-slate-900 truncate tracking-tight">
              {service.name}
            </h4>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-black text-rose-600">
                ${service.price}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">inclusive of all taxes</span>
            </div>
          </div>
        </div>

        {/* Step 1: Pick Date */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-rose-500" />
            1. Select Appointment Date
          </label>
          <div className="relative">
            <input
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-rose-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-semibold bg-white shadow-sm"
              required
            />
          </div>
        </div>

        {/* Step 2: Slot Availability & Dynamic Time Slot Picker */}
        <div className="space-y-2">
          {slotsLoading ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-500" />
                  2. Loading Available Slots...
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <div key={idx} className="h-16 bg-rose-100/50 rounded-2xl"></div>
                ))}
              </div>
            </div>
          ) : (
            <TimeSlotPicker
              selectedDate={date}
              setSelectedDate={setDate}
              availableSlots={slotStatus}
              selectedSlot={selectedSlot}
              onSelectSlot={(slot) => {
                const chosen = slot?.time || slot?.slot || slot;
                setSelectedSlot(chosen);
              }}
            />
          )}

          {selectedSlot && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Selected Slot: {date} at {selectedSlot}</span>
            </div>
          )}
        </div>

        {/* Section 3: Address */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500" />
            3. Service Address / Studio Station
          </label>

          <div
            className={`flex items-center border rounded-2xl p-3.5 bg-rose-50/20 transition-all ${
              isEditingAddress ? 'border-rose-400 ring-2 ring-rose-200 bg-white' : 'border-rose-200'
            }`}
          >
            <MapPin className="text-rose-400 w-5 h-5 mr-3 shrink-0" />

            {isEditingAddress ? (
              <div className="flex w-full gap-2 items-center">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-slate-800 text-sm font-medium"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
                >
                  <Check size={14} /> Done
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-between items-center">
                <span className="text-slate-800 text-sm font-medium">{address}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-rose-600 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 flex items-center gap-1 text-xs font-semibold"
                >
                  <Edit3 size={15} /> Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-rose-500" />
            4. Special Notes or Preferences <span className="text-slate-400 font-normal normal-case">(Optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sensitive skin, bridal reference photo, preference for quiet session..."
            className="w-full border border-rose-200 rounded-2xl p-3.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none resize-none h-20 bg-white shadow-sm"
          />
        </div>

        {/* Action Buttons & Order Summary */}
        <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Total Payable: <strong className="text-rose-600 font-black text-base">${service.price}</strong>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Confirming...' : `Confirm Appointment • $${service.price}`}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
