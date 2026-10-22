import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, FileText, Check, Sparkles, ArrowLeft, Edit3, ShieldCheck } from 'lucide-react';
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
  const savedAddress = localStorage.getItem('salonAddress') || "Attili, West Godavari, Andhrapradesh-534134";

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

  // Fetch slot availability for selected date & service
  const fetchAvailableSlots = async (selectedDate, sId) => {
    try {
      setSlotsLoading(true);
      setSelectedSlot('');
      const activeServiceId = sId || selectedServiceId;
      const res = await api.get(
        `/slots/available?date=${selectedDate}${activeServiceId ? `&serviceId=${activeServiceId}` : ''}`
      );
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
    if (date && selectedServiceId) {
      fetchAvailableSlots(date, selectedServiceId);
    }
  }, [date, selectedServiceId]);

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
      fetchAvailableSlots(date, selectedServiceId);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header & Breadcrumb */}
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
          Select your customized treatment, pick your preferred timing, and secure your booking with Glamora.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Service Details & Summary Card */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm sticky top-24 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
                Selected Treatment
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                {selectedService?.categoryId?.name || 'Service'}
              </span>
            </div>

            {selectedService ? (
              <div className="space-y-4">
                <div className="h-48 rounded-2xl overflow-hidden relative shadow-inner bg-rose-50 border border-rose-100">
                  <img
                    src={selectedService.image}
                    alt={selectedService.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                      {selectedService.duration || '60 mins'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-lg text-slate-900 tracking-tight">
                    {selectedService.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {selectedService.description || 'Full luxury beauty session with our expert beauticians.'}
                  </p>
                </div>

                {/* Pricing & Duration */}
                <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Treatment Fee</span>
                    <div className="text-2xl font-black text-rose-600 leading-none mt-0.5">
                      ${selectedService.price}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      {selectedService.duration || '60 mins'}
                    </div>
                  </div>
                </div>

                {/* Benefits / Guarantees */}
                <div className="space-y-2 pt-2 border-t border-rose-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Certified professional stylist & sanitized station</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Real-time conflict prevention active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>Instant confirmation upon booking</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Please choose a service to begin.</p>
            )}
          </div>
        </div>

        {/* Right Column: Multi-Step Booking Form */}
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm space-y-7"
          >
            {/* Step 1: Service Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-500" />
                1. Select Treatment
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-rose-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white shadow-sm"
                required
              >
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — ${s.price} ({s.duration || '60 mins'})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Date Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-rose-500" />
                2. Choose Appointment Date
              </label>
              <input
                type="date"
                min={format(new Date(), 'yyyy-MM-dd')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-rose-200 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white shadow-sm"
                required
              />
            </div>

            {/* Step 3: Available Slot Selection */}
            <div className="space-y-2">
              {slotsLoading ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-rose-500" />
                      3. Loading Available Slots...
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-pulse">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-16 bg-rose-100/50 rounded-2xl"></div>
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
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Selected Appointment Slot: {date} at {selectedSlot}</span>
                </div>
              )}
            </div>

            {/* Section 4: Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" />
                4. Service Address / Studio Station
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
                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1"
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

            {/* Section 5: Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-500" />
                5. Special Requests or Notes <span className="text-slate-400 font-normal normal-case">(Optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Sensitive skin, bridal reference, preferred stylist..."
                className="w-full border border-rose-200 rounded-2xl p-3.5 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none resize-none h-20 bg-white shadow-sm"
              />
            </div>

            {/* Submit Bar */}
            <div className="pt-4 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/services"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors w-full sm:w-auto text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Confirming Appointment...'
                  : `Confirm Appointment • $${selectedService?.price || 0}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
