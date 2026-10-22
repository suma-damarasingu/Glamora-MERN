import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import StatCard from '../../components/admin/StatCard';
import AnalyticsCharts from '../../components/admin/AnalyticsCharts';
import StatusBadge from '../../components/common/StatusBadge';
import { ChartSkeleton, TableSkeleton } from '../../components/common/Skeleton';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  DollarSign,
  Users,
  Scissors,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Analytics Error:', error);
      toast.error('Failed to load admin analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const recentBookings = data?.recentBookings || [];

  return (
    <div className="space-y-8">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Executive Admin Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key operational metrics, revenue reports, and appointment charts.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Metrics
        </button>
      </div>

      {/* KPI Cards Row */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-rose-100/40 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Revenue */}
          <StatCard
            title="Total Revenue"
            value={`$${stats.totalRevenue || 0}`}
            subtitle="Completed appointments"
            icon={DollarSign}
            color="emerald"
            trend="100% Realized"
          />

          {/* Total Bookings */}
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings || 0}
            subtitle={`${stats.pendingCount || 0} pending confirmation`}
            icon={Calendar}
            color="rose"
          />

          {/* Pending Confirmations */}
          <StatCard
            title="Pending Requests"
            value={stats.pendingCount || 0}
            subtitle="Action required by admin"
            icon={Clock}
            color="amber"
          />

          {/* Registered Customers */}
          <StatCard
            title="Registered Clients"
            value={stats.totalCustomers || 0}
            subtitle={`${stats.totalServices || 0} Active services`}
            icon={Users}
            color="sky"
          />
        </div>
      )}

      {/* Secondary Status Breakdown Row */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase text-amber-700">Pending</p>
              <h4 className="text-xl font-black text-amber-900 mt-0.5">{stats.pendingCount || 0}</h4>
            </div>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase text-emerald-700">Accepted</p>
              <h4 className="text-xl font-black text-emerald-900 mt-0.5">{stats.acceptedCount || 0}</h4>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase text-sky-700">Completed</p>
              <h4 className="text-xl font-black text-sky-900 mt-0.5">{stats.completedCount || 0}</h4>
            </div>
            <Sparkles className="w-5 h-5 text-sky-500" />
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase text-rose-700">Declined</p>
              <h4 className="text-xl font-black text-rose-900 mt-0.5">{stats.declinedCount || 0}</h4>
            </div>
            <XCircle className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      )}

      {/* ⭐ FEATURE #1: RECHARTS ANALYTICS SECTION */}
      {loading ? <ChartSkeleton /> : <AnalyticsCharts data={charts} />}

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Appointments</h3>
            <p className="text-xs text-slate-500">Latest scheduled salon visits</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
          >
            Manage All Bookings <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No booking transactions recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-rose-100 text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Client</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Date & Slot</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            b.userId?.profilePic ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                          }
                          alt={b.userId?.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-rose-200"
                        />
                        <div>
                          <p className="font-bold text-slate-800">{b.userId?.name || 'Client'}</p>
                          <p className="text-[11px] text-slate-400">{b.userId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800">
                      {b.serviceId?.name || 'Treatment'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      {b.date} • {b.timeSlot}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900">${b.price}</td>
                    <td className="py-3.5 px-3 text-right">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
