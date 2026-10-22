import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';

const ServiceModal = ({ isOpen, onClose, service, categories = [], onSuccess }) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('45 mins');
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
      setDuration(service.duration || '45 mins');
      setDescription(service.description || '');
      setIsActive(service.isActive !== undefined ? service.isActive : true);
      setImageUrl(service.image || '');
      setPreview(service.image || '');
      setImageFile(null);
    } else {
      setName('');
      setCategoryId(categories.length > 0 ? categories[0]._id : '');
      setPrice('');
      setDuration('45 mins');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || price === '') {
      toast.error('Name, category, and price are required.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('categoryId', categoryId);
      formData.append('price', Number(price));
      formData.append('duration', duration.trim());
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
      title={isEdit ? 'Edit Service' : 'Add New Service'}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Duration
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 45 mins"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-700">
                {isActive ? 'Active (Visible)' : 'Inactive (Hidden)'}
              </span>
            </label>
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
            placeholder="Details about what is included in this service..."
            className="w-full px-4 py-2 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Service Image
          </label>

          {preview && (
            <div className="relative mb-3 h-32 rounded-xl overflow-hidden border border-rose-100">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 cursor-pointer text-xs font-semibold text-rose-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload Service Photo</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 uppercase font-bold">OR URL</span>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setPreview(e.target.value);
                }}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-rose-500"
              />
            </div>
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
            {loading ? 'Saving...' : isEdit ? 'Update Service' : 'Add Service'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ServiceModal;
