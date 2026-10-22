import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Sparkles } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-700">
        <p className="font-bold text-rose-300">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="mt-1 font-medium">
            <span style={{ color: entry.color || '#fb7185' }}>● </span>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsCharts = ({ data }) => {
  if (!data) return null;

  const { bookingsLast7Days = [], statusDistribution = [], topServices = [] } = data;

  const STATUS_COLORS = {
    Pending: '#f59e0b',
    Accepted: '#10b981',
    Completed: '#0ea5e9',
    Declined: '#f43f5e',
    Cancelled: '#94a3b8'
  };

  return (
    <div className="space-y-8 my-8">
      {/* Chart Section Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Performance Insights
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Real-time data visualization with Recharts (Feature #1)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Line Chart - Bookings Per Day (Last 7 Days) */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-base text-slate-800">
                Bookings Trend (Last 7 Days)
              </h3>
            </div>
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
              Daily Velocity
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bookingsLast7Days} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="Appointments"
                  stroke="#e11d48"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 7, fill: '#be123c' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Pie Chart - Booking Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-base text-slate-800">
                Booking Status Breakdown
              </h3>
            </div>
            <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
              Fulfillment Ratio
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || STATUS_COLORS[entry.name] || '#cbd5e1'}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Bar Chart - Top 5 Most-Booked Services */}
      <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-base text-slate-800">
              Top 5 Most-Booked Services
            </h3>
          </div>
          <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
            Customer Demand
          </span>
        </div>

        <div className="h-72 w-full">
          {topServices.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-slate-400">
              No service booking data yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topServices} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="bookings"
                  name="Total Bookings"
                  fill="#0ea5e9"
                  radius={[8, 8, 0, 0]}
                >
                  {topServices.map((entry, index) => {
                    const colors = ['#e11d48', '#f43f5e', '#fb7185', '#0ea5e9', '#6366f1'];
                    return <Cell key={`bar-${index}`} fill={colors[index % colors.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
