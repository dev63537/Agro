import React from "react";

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="card-body">
        <div className="h-3 skeleton rounded w-1/2 mb-3"></div>
        <div className="h-7 skeleton rounded w-3/4"></div>
      </div>
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card">
      <div className="card-body">
        <div className="h-3 skeleton rounded w-1/3 mb-4"></div>
        <div className="h-48 skeleton rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="table-container">
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded w-1/4 mb-4"></div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-4 skeleton rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
