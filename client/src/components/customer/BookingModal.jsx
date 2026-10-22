import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Clock, MapPin, Check, Edit3 } from 'lucide-react';
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
  const savedAddress = localStorage.getItem('salonAddress') || "104 Blossom Avenue, In-Salon Chair 2";

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
      const saved = localStorage.getItem('salonAddress') || "104 Blossom Avenue, In-Salon Chair 2";
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
      const saved = localStorage.getItem('salonAddress') || "104 Blossom Avenue, In-Salon Chair 2";
      setAddress(saved);
      setIsEditingAddress(false);
      setDate(getInitialDateStr());
    }
  }, [isOpen]);

  // Fetch slot availability whenever date changes or modal opens
  useEffect(() => {
    if (isOpen && date) {
      fetchAvailableSlots(date);
    }
  }, [isOpen, date]);

  const fetchAvailableSlots = async (selectedDate) => {
    try {
      setSlotsLoading(true);
      setSelectedSlot(''); // Reset selection on date change
      const res = await api.get(`/slots/available?date=${selectedDate}`);
      if (res.data.success) {
        setSlotStatus(res.data.slotStatus || []);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast.error('Failed to load time slots for this date.');
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
      fetchAvailableSlots(date);
    } finally {
      setSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve Appointment" maxWidth="max-w-xl">
      <form onSubmit={handleBookingSubmit} className="space-y-6">
        {/* Service Overview Banner */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-rose-50/70 border border-rose-100">
          <img
            src={service.image}
            alt={service.name}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold tracking-wider uppercase text-rose-500">
              {service.categoryId?.name || 'Service'}
            </span>
            <h4 className="text-base font-bold text-slate-900 truncate">{service.name}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                {service.duration}
              </span>
              <span className="font-extrabold text-rose-600 text-sm">
                ${service.price}
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Pick Date */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. Select Appointment Date
          </label>
          <div className="relative">
            <input
              type="date"
              min={format(new Date(), 'yyyy-MM-dd')}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-rose-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm font-medium bg-white"
              required
            />
          </div>
        </div>

        {/* Step 2: Slot Availability & Dynamic Time Slot Picker */}
        <div>
          {slotsLoading ? (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. CHOOSE AVAILABLE TIME SLOT
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                {[1, 2, 3, 4, 5].map((idx) => (
                  <div key={idx} className="h-16 bg-rose-100/50 rounded-xl"></div>
                ))}
              </div>
            </div>
          ) : (
            <TimeSlotPicker
              selectedDate={date}
              setSelectedDate={setDate}
              availableSlots={slotStatus.map((s) => ({
                id: s.slot,
                time: s.slot,
                isBooked: !s.isAvailable
              }))}
              selectedSlot={selectedSlot ? { id: selectedSlot, time: selectedSlot } : null}
              onSelectSlot={(slot) => {
                const chosen = slot?.time || slot?.slot || slot;
                setSelectedSlot(chosen);
              }}
            />
          )}

          {selectedSlot && (
            <p className="text-xs text-emerald-600 font-semibold -mt-3 mb-4 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Slot selected: {date} at {selectedSlot}
            </p>
          )}
        </div>

        {/* Section 3: Address */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            3. SERVICE ADDRESS / STUDIO STATION
          </label>
          
          <div className={`flex items-center border rounded-lg p-3 bg-gray-50 ${isEditingAddress ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}>
            <MapPin className="text-gray-400 w-5 h-5 mr-3 flex-shrink-0" />
            
            {isEditingAddress ? (
              <div className="flex w-full gap-2">
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-gray-800"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(false)}
                  className="text-green-600 hover:text-green-700 p-1"
                >
                  <Check size={20} />
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-between items-center">
                <span className="text-gray-800 text-sm">{address}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingAddress(true)}
                  className="text-primary hover:text-pink-700 ml-2 p-1"
                >
                  <Edit3 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section 4: Notes */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            4. SPECIAL NOTES OR PREFERENCES <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sensitive skin, bringing reference photo, etc."
            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none h-20"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !selectedSlot}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Confirming...' : `Confirm Booking • $${service.price}`}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BookingModal;
