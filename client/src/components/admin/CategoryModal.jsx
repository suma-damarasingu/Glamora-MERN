import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { Upload, Image as ImageIcon } from 'lucide-react';

const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(category && category._id);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setImageUrl(category.image || '');
      setPreview(category.image || '');
      setImageFile(null);
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setImageFile(null);
      setPreview('');
    }
  }, [category, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('description', description.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('image', imageUrl);
      }

      let res;
      if (isEdit) {
        res = await api.put(`/categories/${category._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        toast.success(res.data.message || (isEdit ? 'Category updated!' : 'Category created!'));
        if (onSuccess) onSuccess(res.data.category);
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
      title={isEdit ? 'Edit Category' : 'Create New Category'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hair, Nails, Makeup"
            className="w-full px-4 py-2.5 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of services in this category"
            className="w-full px-4 py-2 rounded-xl border border-rose-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Category Image
          </label>

          {preview && (
            <div className="relative mb-3 h-32 rounded-xl overflow-hidden border border-rose-100">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 cursor-pointer text-xs font-semibold text-rose-700 transition-colors">
              <Upload className="w-4 h-4" />
              <span>Upload Image File (Cloudinary / Local)</span>
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
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;
