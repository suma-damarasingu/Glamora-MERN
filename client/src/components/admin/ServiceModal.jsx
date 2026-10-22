import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, Clock, Plus, X, Wand2 } from 'lucide-react';

const COMMON_TIMES = [
  '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
  '08:00 PM', '08:30 PM', '09:00 PM'
];

function parseTimeToMinutes(timeStr) {
  if (!timeStr) return 540;
  const [time, modifier] = timeStr.trim().split(' ');
  let [hours, minutes] = (time || '09:00').split(':').map(Number);
  if (hours === 12) hours = 0;
  if (modifier === 'PM') hours += 12;
  return hours * 60 + (minutes || 0);
}

function formatMinutesToTime(totalMinutes) {
  let hours24 = Math.floor(totalMinutes / 60);
  let minutes = totalMinutes % 60;
  let modifier = hours24 >= 12 ? 'PM' : 'AM';
  let hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return String(hours12).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ' ' + modifier;
}

function generateTimeSlots(startStr, endStr, durMinutes) {
  const start = parseTimeToMinutes(startStr);
  const end = parseTimeToMinutes(endStr);
  const duration = Number(durMinutes) || 60;
  if (duration <= 0 || start >= end) return [];
  const result = [];
  for (let m = start; m + duration <= end; m += duration) {
    result.push(formatMinutesToTime(m));
  }
  return result;
}

const ServiceModal = ({ isOpen, onClose, service, categories = [], onSuccess }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('08:00 PM');
  const [slots, setSlots] = useState([]);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(service && service._id);

  useEffect(() => {
    if (service) {
      setName(service.name || '');
      setCategoryId(service.categoryId?._id || service.categoryId || '');
      setPrice(service.price !== undefined ? service.price : '');
      const dur = service.durationMinutes || (service.duration ? parseInt(service.duration, 10) : 60);
      setDurationMinutes(dur || 60);
      setStartTime(service.startTime || '09:00 AM');
      setEndTime(service.endTime || '08:00 PM');

      if (Array.isArray(service.slots) && service.slots.length > 0) {
        setSlots(service.slots);
      } else {
        setSlots(generateTimeSlots(service.startTime || '09:00 AM', service.endTime || '08:00 PM', dur || 60));
      }

      setDescription(service.description || '');
      setIsActive(service.isActive !== undefined ? service.isActive : true);
      setImageUrl(service.image || '');
      setPreview(service.image || '');
      setImageFile(null);
    } else {
      setName('');
      setCategoryId(categories.length > 0 ? categories[0]._id : '');
      setPrice('');
      setDurationMinutes(60);
      setStartTime('09:00 AM');
      setEndTime('08:00 PM');
      setSlots(generateTimeSlots('09:00 AM', '08:00 PM', 60));
      setDescription('');
      setIsActive(true);
      setImageUrl('');
      setImageFile(null);
      setPreview('');
    }
  }, [service, categories, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleGenerateSlots = () => {
    const generated = generateTimeSlots(startTime, endTime, durationMinutes);
    if (generated.length === 0) {
      toast.error('Could not generate slots. Ensure End Time is after Start Time.');
      return;
    }
    setSlots(generated);
    toast.success(`Generated ${generated.length} time slots!`);
  };

  const handleRemoveSlot = (slotToRemove) => {
    setSlots(slots.filter((s) => s !== slotToRemove));
  };

  const handleAddCustomSlot = (e) => {
    e.preventDefault();
    if (!newSlotTime.trim()) return;
    const trimmed = newSlotTime.trim();
    if (slots.includes(trimmed)) {
      toast.error('This slot is already added.');
      return;
    }
    setSlots([...slots, trimmed]);
    setNewSlotTime('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || price === '') {
      toast.error('Name, category, and price are required.');
      return;
    }

    if (slots.length === 0) {
      toast.error('Please configure at least one available time slot for this service.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('categoryId', categoryId);
      formData.append('price', Number(price));
      formData.append('duration', `${durationMinutes} mins`);
      formData.append('durationMinutes', Number(durationMinutes));
      formData.append('startTime', startTime);
      formData.append('endTime', endTime);
      formData.append('slots', JSON.stringify(slots));
      formData.append('description', description.trim());
      formData.append('isActive', isActive);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image', imageUrl);
      }

      let res;
      if (isEdit) {
        res = await api.put(`/services/${service._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || (isEdit ? 'Service updated!' : 'Service created!'));
        if (onSuccess) onSuccess(res.data.service);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Service & Timings' : 'Add New Service & Schedule'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {/* Basic Service Info */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Service Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Signature Balayage & Blowdry"
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Price ($)
            </label>
            <input
              type="number"
              required
              min="0"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 85"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Section: Service Timings & Available Slots Configuration */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Service Timings & Dynamic Slot Management
              </h4>
            </div>
            <button
              type="button"
              onClick={handleGenerateSlots}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Auto-Generate Slots
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {COMMON_TIMES.map((t) => (
                  <option key={`start-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {COMMON_TIMES.map((t) => (
                  <option key={`end-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="15"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                placeholder="60"
                className="w-full px-3 py-2 rounded-xl border border-rose-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Active Configured Slots */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5 flex items-center justify-between">
              <span>Configured Time Slots ({slots.length} slots)</span>
              <span className="text-[10px] font-normal text-slate-500 normal-case">
                These slots will appear in customer appointment booking
              </span>
            </label>

            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2.5 rounded-xl bg-white border border-rose-100">
              {slots.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No slots configured. Click "Auto-Generate Slots" or add manually below.
                </p>
              ) : (
                slots.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(s)}
                      className="text-rose-400 hover:text-rose-700"
                      title="Remove slot"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Quick Add Custom Slot */}
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                placeholder="e.g. 01:15 PM"
                className="w-36 px-3 py-1.5 rounded-lg border border-rose-200 text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddCustomSlot}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Custom Slot
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Service Description
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about what is included in this treatment..."
            className="w-full px-4 py-2 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        {/* Service Image & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Service Image
            </label>
            {preview && (
              <div className="relative mb-2 h-24 rounded-xl overflow-hidden border border-rose-100">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="flex items-center justify-center gap-2 p-2 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 cursor-pointer text-xs font-semibold text-rose-700 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreview(e.target.value);
                }}
                placeholder="Or paste image URL"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                {isActive ? 'Active (Bookable by Customers)' : 'Inactive (Hidden)'}
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-rose-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 disabled:opacity-50"
          >
            {loading ? 'Saving Service...' : isEdit ? 'Save Changes' : 'Create Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceModal;
