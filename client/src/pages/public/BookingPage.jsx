import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, FileText, Check, Sparkles, ArrowLeft, ShieldAlert, Edit3 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import TimeSlotPicker from '../../components/customer/TimeSlotPicker';

const BookingPage = () => {
  const { serviceId } = useParams();
  const { user, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Strict check: Admins cannot access booking flow
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const PARLOUR_CLOSING_HOUR = 20;

  const getInitialDateStr = () => {
    const now = new Date();
    if (now.getHours() >= PARLOUR_CLOSING_HOUR) {
      return format(addDays(now, 1), 'yyyy-MM-dd');
    }
    return format(now, 'yyyy-MM-dd');
  };

  // Retrieve saved address from localStorage or props
  const savedAddress = localStorage.getItem('salonAddress') || "104 Blossom Avenue, In-Salon Chair 2";

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(serviceId || '');
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState(getInitialDateStr());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [address, setAddress] = useState(savedAddress);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [notes, setNotes] = useState('');
  const [slotStatus, setSlotStatus] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingServices, setLoadingServices] = useState(true);

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

  // Fetch services list
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const res = await api.get('/services');
        if (res.data.success) {
          const list = res.data.services || [];
          setServices(list);
          if (serviceId) {
            const current = list.find((s) => s._id === serviceId);
            if (current) {
              setSelectedService(current);
              setSelectedServiceId(current._id);
            }
          } else if (list.length > 0 && !selectedServiceId) {
            setSelectedService(list[0]);
            setSelectedServiceId(list[0]._id);
          }
        }
      } catch (error) {
        toast.error('Failed to load services.');
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, [serviceId]);

  // When selected service ID changes
  const handleServiceChange = (id) => {
    setSelectedServiceId(id);
    const found = services.find((s) => s._id === id);
    setSelectedService(found || null);
  };

  // Fetch slot availability for selected date
  const fetchAvailableSlots = async (selectedDate) => {
    try {
      setSlotsLoading(true);
      setSelectedSlot('');
      const res = await api.get(`/slots/available?date=${selectedDate}`);
      if (res.data.success) {
        setSlotStatus(res.data.slotStatus || []);
      }
    } catch (error) {
      toast.error('Failed to load available time slots.');
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchAvailableSlots(date);
    }
  }, [date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedService) {
      toast.error('Please choose a service to book.');
      return;
    }
    if (!date) {
      toast.error('Please select an appointment date.');
      return;
    }
    if (!selectedSlot) {
      toast.error('Please choose an available time slot.');
      return;
    }
    if (!address.trim()) {
      toast.error('Please provide an appointment address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/bookings', {
        serviceId: selectedService._id,
        date,
        timeSlot: selectedSlot,
        address: address.trim(),
        notes: notes.trim()
      });

      if (res.data.success) {
        toast.success('Appointment booked successfully! 🎉');
        navigate('/dashboard/bookings');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Booking failed. Please try again.';
      toast.error(errorMsg);
      fetchAvailableSlots(date);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingServices) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Services Menu
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
          Reserve Your Beauty Appointment
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Select your desired treatment, pick an available slot, and confirm your visit.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Service Details Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm sticky top-24">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Chosen Treatment
            </h3>

            {selectedService ? (
              <div className="space-y-4">
                <div className="h-44 rounded-2xl overflow-hidden relative shadow-inner bg-rose-50">
                  <img
                    src={selectedService.image}
                    alt={selectedService.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-rose-700 shadow-sm">
                    {selectedService.categoryId?.name || 'Beauty'}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {selectedService.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {selectedService.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-rose-100 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    {selectedService.duration}
                  </span>
                  <span className="text-xl font-black text-rose-600">
                    ${selectedService.price}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Please choose a service to begin.</p>
            )}
          </div>
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-6"
          >
            {/* Step 1: Service Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Treatment
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                required
              >
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — ${s.price} ({s.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Date Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Choose Appointment Date
              </label>
              <input
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-rose-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                required
              />
            </div>

            {/* Step 3: Available Slot Selection */}
            <div>
              {slotsLoading ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    3. CHOOSE AVAILABLE TIME SLOT
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-16 bg-rose-100/50 rounded-xl"></div>
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

            {/* Section 4: Address */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                4. SERVICE ADDRESS / STUDIO STATION
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

            {/* Section 5: Notes */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                5. SPECIAL NOTES OR PREFERENCES <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sensitive skin, bringing reference photo, etc."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-primary outline-none resize-none h-20"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-rose-100 flex items-center justify-end gap-4">
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="px-7 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Confirming Appointment...'
                  : `Confirm Booking • $${selectedService?.price || 0}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
