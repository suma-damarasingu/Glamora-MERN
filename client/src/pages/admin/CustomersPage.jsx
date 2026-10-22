import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { TableSkeleton } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';
import { Users, Search, RefreshCw, Calendar, DollarSign, History } from 'lucide-react';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (error) {
      toast.error('Failed to load registered customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenHistory = (customer) => {
    setSelectedCustomer(customer);
    setHistoryModalOpen(true);
  };

  const filteredCustomers = customers.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Registered Customers
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View salon customer profiles, appointment history, and lifetime spending.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-rose-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
            />
          </div>

          <button
            onClick={fetchCustomers}
            className="p-2.5 rounded-xl text-slate-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers registered yet"
          description="Registered salon clients will appear here automatically."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 border-b border-rose-100 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Total Bookings</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {filteredCustomers.map((c) => (
                  <tr key={c._id} className="hover:bg-rose-50/30 transition-colors">
                    {/* Customer Info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            c.profilePic ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={c.name}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Verified Client
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-4 px-4">
                      <p className="text-slate-800 font-medium">{c.email}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{c.phone}</p>
                    </td>

                    {/* Joined */}
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Total Bookings */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-extrabold text-slate-800 bg-rose-50 px-2.5 py-1 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-rose-500" />
                        {c.totalBookings || 0} visits
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-4 font-black text-slate-900 text-sm">
                      ${c.totalSpent || 0}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenHistory(c)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200"
                      >
                        <History className="w-3.5 h-3.5" />
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Booking History Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedCustomer(null);
          }}
          title={`Booking History: ${selectedCustomer.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-slate-800">{selectedCustomer.email}</p>
                <p className="text-slate-500">{selectedCustomer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-500 font-medium">Total Spent</p>
                <p className="font-black text-rose-600 text-base">
                  ${selectedCustomer.totalSpent || 0}
                </p>
              </div>
            </div>

            {selectedCustomer.bookings?.length === 0 ? (
              <p className="text-center py-6 text-slate-400 text-xs">
                This client has not placed any bookings yet.
              </p>
            ) : (
              <div className="divide-y divide-rose-50 max-h-96 overflow-y-auto">
                {selectedCustomer.bookings?.map((b) => (
                  <div key={b._id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.serviceId?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80'}
                        alt={b.serviceId?.name}
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-rose-100"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{b.serviceId?.name || 'Treatment'}</p>
                        <p className="text-[11px] text-slate-500">
                          {b.date} • {b.timeSlot}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">${b.price}</span>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomersPage;
