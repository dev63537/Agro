import React from "react";
import StatCard from "../../components/StatCard";
import SalesChart from "../../components/charts/SalesChart";
import TopFarmersChart from "../../components/charts/TopFarmersChart";
import LowStockChart from "../../components/charts/LowStockChart";
import { SkeletonCard, SkeletonChart } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";

import {
  useMasterSales,
  useMasterTopFarmers,
  useMasterLowStock,
} from "../../hooks/reports/useMasterReports";

export default function MasterDashboard() {
  // ✅ HOOKS (DECLARE FIRST)
  const { data: sales = [], isLoading: salesLoading } = useMasterSales();
  const { data: farmers = [], isLoading: farmersLoading } =
    useMasterTopFarmers();
  const { data: lowStock = [], isLoading: lowStockLoading } =
    useMasterLowStock(10);

  const isLoading = salesLoading || farmersLoading || lowStockLoading;

  // ✅ SAFE TRANSFORMS
  const salesData = Array.isArray(sales)
    ? sales.map((s) => ({
        date: `M${s.month || s._id?.month || "N/A"}`,
        total: s.total || 0,
      }))
    : [];

  const farmerData = Array.isArray(farmers)
    ? farmers.map((f) => ({
        name: f.name || f.farmer?.name || "Unknown",
        total: f.total || 0,
      }))
    : [];

  const lowData = Array.isArray(lowStock)
    ? lowStock.map((p) => ({
        name: p.name || "Unknown",
        qty: p.totalQty || p.qty || 0,
      }))
    : [];

  // add card top
  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalShops = new Set(farmers.map((f) => f.shop)).size;
  const totalFarmers = farmers.length;
  const lowStockCount = lowStock.length;

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Revenue" value={`₹ ${totalRevenue}`} />
          <StatCard title="Total Shops" value={totalShops} />
          <StatCard title="Farmers" value={totalFarmers} />
          <StatCard title="Low Stock Products" value={lowStockCount} />
        </div>
      )}

      <h2 className="text-xl font-semibold">
        Master Dashboard — Aggregated Reports
      </h2>

      {isLoading ? (
        <>
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
        </>
      ) : (
        <>
          {!isLoading && salesData.length === 0 ? (
            <EmptyState
              title="No sales data"
              message="Sales will appear here once shops start generating bills."
            />
          ) : (
            <SalesChart
              data={
                salesData.length ? salesData : [{ date: "No data", total: 0 }]
              }
            />
          )}

          {!isLoading && farmerData.length === 0 ? (
            <EmptyState
              title="No farmers yet"
              message="Top farmers will appear once shops record transactions."
            />
          ) : (
            <TopFarmersChart
              data={
                farmerData.length ? farmerData : [{ name: "No data", total: 0 }]
              }
            />
          )}

          {!isLoading && lowData.length === 0 ? (
            <EmptyState
              title="No low stock products"
              message="All shops currently have sufficient stock."
            />
          ) : (
            <LowStockChart
              data={
                lowData.length ? lowData : [{ name: "No low stock", qty: 0 }]
              }
            />
          )}
        </>
      )}
    </div>
  );
}
