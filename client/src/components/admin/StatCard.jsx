import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'rose', trend }) => {
  const colorMap = {
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      ring: 'ring-rose-200'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      ring: 'ring-amber-200'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      ring: 'ring-emerald-200'
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-600',
      border: 'border-sky-100',
      ring: 'ring-sky-200'
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-100',
      ring: 'ring-violet-200'
    }
  };

  const currentTheme = colorMap[color] || colorMap.rose;

  return (
    <div
      className={`bg-white rounded-3xl p-6 border ${currentTheme.border} shadow-sm card-hover-effect flex items-start justify-between`}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>}
        {trend && (
          <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            {trend}
          </span>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-2xl ${currentTheme.bg} ${currentTheme.text} flex items-center justify-center shrink-0 ring-4 ${currentTheme.ring}`}
      >
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default StatCard;
