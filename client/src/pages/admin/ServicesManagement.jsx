import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import ServiceModal from '../../components/admin/ServiceModal';
import CategoryModal from '../../components/admin/CategoryModal';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import {
  Scissors,
  Plus,
  Edit2,
  Trash2,
  FolderPlus,
  RefreshCw,
  Clock,
  Layers,
  Search
} from 'lucide-react';

const ServicesManagement = () => {
  const [activeTab, setActiveTab] = useState('services'); // 'services' | 'categories'
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, servRes] = await Promise.all([
        api.get('/categories'),
        api.get('/services?all=true')
      ]);

      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (servRes.data.success) setServices(servRes.data.services || []);
    } catch (error) {
      toast.error('Failed to load services data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Actions
  const handleOpenAddCategory = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setSelectedCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await api.delete(`/categories/${catId}`);
      if (res.data.success) {
        toast.success('Category deleted successfully.');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot delete category.');
    }
  };

  // Service Actions
  const handleOpenAddService = () => {
    setSelectedService(null);
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (serv) => {
    setSelectedService(serv);
    setServiceModalOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await api.delete(`/services/${serviceId}`);
      if (res.data.success) {
        toast.success('Service deleted successfully.');
        setServices((prev) => prev.filter((s) => s._id !== serviceId));
      }
    } catch (error) {
      toast.error('Failed to delete service.');
    }
  };

  const filteredServices = services.filter((s) => {
    const matchesCategory = categoryFilter === 'all' || s.categoryId?._id === categoryFilter;
    const matchesSearch =
      searchTerm === '' ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Services & Categories Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin controls everything: prices, images, descriptions, and category taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'services' ? (
            <button
              onClick={handleOpenAddService}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add New Service
            </button>
          ) : (
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              Add New Category
            </button>
          )}

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl text-slate-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Switch Tabs */}
      <div className="flex border-b border-rose-100 gap-6">
        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scissors className="w-4 h-4" />
          All Services ({services.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'categories'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Categories ({categories.length})
        </button>
      </div>

      {/* TAB 1: SERVICES CATALOG */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  categoryFilter === 'all'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
                }`}
              >
                All Departments
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setCategoryFilter(c._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    categoryFilter === c._id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-rose-100 hover:bg-rose-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-rose-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
              />
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={5} />
          ) : filteredServices.length === 0 ? (
            <EmptyState
              icon={Scissors}
              title="No services found"
              description="Add your first beauty service to start offering appointments."
              actionText="Add New Service"
              onAction={handleOpenAddService}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50/50 border-b border-rose-100 text-slate-500 uppercase tracking-wider font-bold">
                    <tr>
                      <th className="py-3.5 px-4">Service</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Price</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {filteredServices.map((service) => (
                      <tr key={service._id} className="hover:bg-rose-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-12 h-12 rounded-xl object-cover ring-1 ring-rose-100"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{service.name}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-rose-600">
                          {service.categoryId?.name || 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                          ${service.price}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          <span className="flex items-center gap-1 font-semibold text-slate-800">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            {service.duration || '60 mins'}
                          </span>
                          {service.slots && service.slots.length > 0 && (
                            <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                              {service.slots.length} configured slots
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              service.isActive
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {service.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditService(service)}
                              title="Edit Service"
                              className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service._id)}
                              title="Delete Service"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
      )}

      {/* TAB 2: CATEGORIES CRUD */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No categories found"
              description="Create beauty categories like Hair, Makeup, Nails, Skin, and Spa."
              actionText="Add New Category"
              onAction={handleOpenAddCategory}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm card-hover-effect flex flex-col justify-between"
                >
                  <div className="relative h-40 rounded-2xl overflow-hidden mb-4 bg-rose-50">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/90 backdrop-blur-md text-rose-700 shadow-sm">
                      {cat.serviceCount || 0} Services
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">{cat.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-rose-50">
                    <span className="text-[11px] font-bold text-slate-400">Department</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ServiceModal
        isOpen={serviceModalOpen}
        onClose={() => {
          setServiceModalOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        categories={categories}
        onSuccess={fetchData}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default ServicesManagement;
