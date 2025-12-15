import React from "react";

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
      <div className="h-6 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-white rounded-lg shadow p-4 animate-pulse">
      <div className="h-4 bg-gray-300 rounded w-1/3 mb-4"></div>
      <div className="h-40 bg-gray-300 rounded"></div>
    </div>
  );
}
