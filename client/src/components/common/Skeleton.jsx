import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white rounded-2xl p-5 border border-rose-100 shadow-sm animate-pulse space-y-4">
    <div className="w-full h-48 bg-rose-100/60 rounded-xl"></div>
    <div className="h-5 bg-rose-100/60 rounded w-3/4"></div>
    <div className="h-4 bg-rose-50 rounded w-full"></div>
    <div className="flex justify-between items-center pt-2">
      <div className="h-6 bg-rose-100/60 rounded w-1/4"></div>
      <div className="h-9 bg-rose-200/60 rounded-lg w-1/3"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-sm animate-pulse space-y-3">
    <div className="h-10 bg-rose-50 rounded-lg w-full"></div>
    {Array.from({ length: rows }).map((_, idx) => (
      <div key={idx} className="h-12 bg-rose-50/40 rounded-lg w-full"></div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-2xl border border-rose-100 p-6 shadow-sm animate-pulse space-y-4">
    <div className="h-6 bg-rose-100/60 rounded w-1/3"></div>
    <div className="h-64 bg-rose-50/60 rounded-xl w-full"></div>
  </div>
);
