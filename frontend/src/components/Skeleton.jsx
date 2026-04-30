import React from "react";

/* ─────────────────────────────────────────────
   Base pulse bar — the atomic building block
───────────────────────────────────────────── */
export function SkeletonBox({ className = "" }) {
  return <div className={`skeleton rounded ${className}`} />;
}

/* ─────────────────────────────────────────────
   Stat Card skeleton  (used on dashboards)
───────────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="card">
      <div className="card-body space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-9 w-9 rounded-xl" />
        </div>
        <SkeletonBox className="h-8 w-1/2" />
        <SkeletonBox className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Chart skeleton  (used on dashboards)
───────────────────────────────────────────── */
export function SkeletonChart() {
  return (
    <div className="card">
      <div className="card-body space-y-4">
        <SkeletonBox className="h-4 w-1/3" />
        <SkeletonBox className="h-48" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Generic table skeleton
   rows × cols  — each row has 'cols' cells
───────────────────────────────────────────── */
export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="table-container">
      <div className="p-4 space-y-3">
        <SkeletonBox className="h-4 w-1/4 mb-4" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonBox key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Farmers table skeleton
   5 rows, 7 columns matching Farmers.jsx table
───────────────────────────────────────────── */
export function SkeletonFarmersTable({ rows = 5 }) {
  return (
    <div className="table-container">
      {/* Fake thead */}
      <div className="bg-surface-100 border-b border-surface-200 px-4 py-3 flex gap-4">
        {[12, 28, 16, 16, 14, 18, 14].map((w, i) => (
          <SkeletonBox key={i} className={`h-3 w-${w}`} />
        ))}
      </div>
      {/* Fake tbody */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 flex items-center gap-4 border-b border-surface-100"
        >
          {/* Code */}
          <SkeletonBox className="h-3 w-12" />
          {/* Name */}
          <SkeletonBox className="h-3 flex-1" />
          {/* Phone */}
          <SkeletonBox className="h-3 w-24" />
          {/* Village */}
          <SkeletonBox className="h-3 w-20" />
          {/* Status badge */}
          <SkeletonBox className="h-6 w-16 rounded-full" />
          {/* Dues */}
          <SkeletonBox className="h-3 w-16" />
          {/* Actions */}
          <SkeletonBox className="h-7 w-14 rounded-lg ml-auto" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Products table skeleton
───────────────────────────────────────────── */
export function SkeletonProductsTable({ rows = 5 }) {
  return (
    <div className="table-container">
      <div className="bg-surface-100 border-b border-surface-200 px-4 py-3 flex gap-4">
        {[28, 18, 14, 12, 10, 10, 14, 12].map((w, i) => (
          <SkeletonBox key={i} className={`h-3 w-${w}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 flex items-center gap-4 border-b border-surface-100"
        >
          <SkeletonBox className="h-3 flex-1" />
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-5 w-14 rounded-full" />
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-3 w-8" />
          <SkeletonBox className="h-3 w-8" />
          <SkeletonBox className="h-3 w-16" />
          <SkeletonBox className="h-7 w-12 rounded-lg ml-auto" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Stock Batches table skeleton
───────────────────────────────────────────── */
export function SkeletonStockTable({ rows = 5 }) {
  return (
    <div className="table-container">
      <div className="bg-surface-100 border-b border-surface-200 px-4 py-3 flex gap-4">
        {[16, 28, 12, 18, 14].map((w, i) => (
          <SkeletonBox key={i} className={`h-3 w-${w}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="px-4 py-3 flex items-center gap-4 border-b border-surface-100"
        >
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-3 flex-1" />
          <SkeletonBox className="h-3 w-12" />
          <SkeletonBox className="h-3 w-24" />
          <SkeletonBox className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Ledger skeleton  (filter card + summary cards + table)
───────────────────────────────────────────── */
export function SkeletonLedger() {
  return (
    <div className="space-y-6">
      {/* Filter card */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <SkeletonBox className="h-3 w-16" />
              <SkeletonBox className="h-10" />
            </div>
            <div className="space-y-2">
              <SkeletonBox className="h-3 w-12" />
              <SkeletonBox className="h-10" />
            </div>
            <SkeletonBox className="h-10 self-end" />
          </div>
        </div>
      </div>
      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card">
            <div className="card-body text-center space-y-2">
              <SkeletonBox className="h-3 w-16 mx-auto" />
              <SkeletonBox className="h-8 w-24 mx-auto" />
            </div>
          </div>
        ))}
      </div>
      {/* Transaction table */}
      <SkeletonTable rows={4} cols={5} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Billing page skeleton  (farmer select + items area)
───────────────────────────────────────────── */
export function SkeletonBilling() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left col */}
      <div className="lg:col-span-2 space-y-5">
        {/* Farmer card */}
        <div className="card">
          <div className="card-body space-y-3">
            <SkeletonBox className="h-4 w-32" />
            <SkeletonBox className="h-10" />
          </div>
        </div>
        {/* Items card */}
        <div className="card">
          <div className="card-body space-y-4">
            <div className="flex justify-between">
              <SkeletonBox className="h-4 w-20" />
              <SkeletonBox className="h-8 w-24 rounded-lg" />
            </div>
            <SkeletonBox className="h-28 rounded-lg" />
          </div>
        </div>
        {/* Payment card */}
        <div className="card">
          <div className="card-body space-y-3">
            <SkeletonBox className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <SkeletonBox className="h-10" />
              <SkeletonBox className="h-10" />
            </div>
          </div>
        </div>
        {/* Signature card */}
        <div className="card">
          <div className="card-body space-y-3">
            <SkeletonBox className="h-4 w-24" />
            <SkeletonBox className="h-32 rounded-lg" />
          </div>
        </div>
        <SkeletonBox className="h-12 rounded-xl" />
      </div>
      {/* Right col — summary */}
      <div className="card">
        <div className="card-body space-y-4">
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-3 w-full" />
          <SkeletonBox className="h-3 w-3/4" />
          <SkeletonBox className="h-3 w-1/2" />
          <hr className="border-surface-200" />
          <SkeletonBox className="h-6 w-32 ml-auto" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Invoice view skeleton  (page header + invoice card)
───────────────────────────────────────────── */
export function SkeletonInvoice() {
  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="page-header">
        <div className="space-y-2">
          <SkeletonBox className="h-6 w-48" />
          <SkeletonBox className="h-3 w-32" />
        </div>
        <div className="flex gap-3">
          <SkeletonBox className="h-10 w-32 rounded-lg" />
          <SkeletonBox className="h-10 w-20 rounded-lg" />
        </div>
      </div>
      {/* Invoice card */}
      <div className="card max-w-3xl mx-auto">
        <div className="card-body p-8 space-y-8">
          {/* Header row */}
          <div className="flex justify-between pb-6 border-b-2 border-primary-100">
            <div className="flex items-center gap-3">
              <SkeletonBox className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <SkeletonBox className="h-5 w-36" />
                <SkeletonBox className="h-3 w-24" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <SkeletonBox className="h-6 w-24 ml-auto" />
              <SkeletonBox className="h-3 w-16 ml-auto" />
            </div>
          </div>
          {/* Bill-to + payment status */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <SkeletonBox className="h-3 w-16" />
              <SkeletonBox className="h-5 w-32" />
              <SkeletonBox className="h-3 w-24" />
            </div>
            <div className="text-right space-y-2">
              <SkeletonBox className="h-3 w-24 ml-auto" />
              <SkeletonBox className="h-7 w-20 rounded-full ml-auto" />
            </div>
          </div>
          {/* Items table */}
          <SkeletonTable rows={3} cols={7} />
          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between">
                <SkeletonBox className="h-3 w-16" />
                <SkeletonBox className="h-3 w-20" />
              </div>
              <div className="flex justify-between">
                <SkeletonBox className="h-3 w-16" />
                <SkeletonBox className="h-3 w-20" />
              </div>
              <hr className="border-surface-200" />
              <div className="flex justify-between">
                <SkeletonBox className="h-5 w-24" />
                <SkeletonBox className="h-5 w-24" />
              </div>
            </div>
          </div>
          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-surface-200">
            <SkeletonBox className="h-16 rounded-lg" />
            <SkeletonBox className="h-16 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Form skeleton  (card with N input rows)
   Used for StockForm, FarmerForm, ProductForm
   while the API call to load product/farmer list is in-flight
───────────────────────────────────────────── */
export function SkeletonForm({ rows = 3, title = true }) {
  return (
    <div className="card max-w-lg">
      <div className="card-body space-y-5">
        {title && <SkeletonBox className="h-5 w-40 mb-2" />}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-10" />
          </div>
        ))}
        <div className="flex gap-3 pt-2">
          <SkeletonBox className="h-10 w-28 rounded-lg" />
          <SkeletonBox className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page-header skeleton  (title + subtitle + button)
───────────────────────────────────────────── */
export function SkeletonPageHeader({ hasButton = true }) {
  return (
    <div className="page-header">
      <div className="space-y-2">
        <SkeletonBox className="h-6 w-40" />
        <SkeletonBox className="h-3 w-28" />
      </div>
      {hasButton && <SkeletonBox className="h-10 w-28 rounded-lg" />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Recent bills list skeleton  (used in ShopDashboard)
───────────────────────────────────────────── */
export function SkeletonRecentBills({ rows = 5 }) {
  return (
    <div className="card">
      <div className="card-body space-y-3">
        <div className="flex justify-between mb-1">
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-4 w-16" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-50">
            <SkeletonBox className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5">
              <SkeletonBox className="h-3 w-24" />
              <SkeletonBox className="h-3 w-16" />
            </div>
            <div className="text-right space-y-1.5">
              <SkeletonBox className="h-3 w-16 ml-auto" />
              <SkeletonBox className="h-3 w-10 ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
