import React from "react";
import StatCard from "../../components/StatCard";
import SalesChart from "../../components/charts/SalesChart";
import TopFarmersChart from "../../components/charts/TopFarmersChart";
import { SkeletonCard, SkeletonChart } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { useMasterShopCount } from "../../hooks/reports/useMasterReports";


import {
  useMasterSales,
  useMasterTopFarmers,
} from "../../hooks/reports/useMasterReports";

export default function MasterDashboard() {
  // 🔹 Queries
  const { data: salesDataRaw, isLoading: salesLoading } = useMasterSales();
  const { data: farmersRaw, isLoading: farmersLoading } =
    useMasterTopFarmers();

  const isLoading = salesLoading || farmersLoading;

  // 🔹 FORCE SAFE ARRAYS
  const sales = Array.isArray(salesDataRaw) ? salesDataRaw : [];
  const farmers = Array.isArray(farmersRaw) ? farmersRaw : [];
  const { data: totalShops = 0 } = useMasterShopCount();


  // 🔹 Cards
  const totalRevenue = sales.reduce(
    (sum, s) => sum + (s.total || 0),
    0
  );

  const totalBills = sales.reduce(
    (sum, s) => sum + (s.count || 0),
    0
  );

  const totalFarmers = farmers.length;

  // 🔹 Charts
  const salesChartData = sales.map((s) => ({
    date: `${s.month}/${s.year}`,
    total: s.total || 0,
  }));

  const farmerChartData = farmers.map((f) => ({
    name: f.name || "Unknown",
    total: f.total || 0,
  }));

  return (
    <div className="space-y-6">
      {/* ===== TOP CARDS ===== */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Revenue" value={`₹ ${totalRevenue}`} />
          <StatCard title="Total Shops" value={totalShops} />
          <StatCard title="Total Farmers" value={totalFarmers} />
          <StatCard title="Total Bills" value={totalBills} />  
        </div>
      )}

      <h2 className="text-xl font-semibold">Master Dashboard</h2>

      {/* ===== CHARTS ===== */}
      {isLoading ? (
        <>
          <SkeletonChart />
          <SkeletonChart />
        </>
      ) : (
        <>
          {salesChartData.length === 0 ? (
            <EmptyState
              title="No sales yet"
              message="Sales data will appear once shops create bills."
            />
          ) : (
            <SalesChart data={salesChartData} />
          )}

          {farmerChartData.length === 0 ? (
            <EmptyState
              title="No farmers yet"
              message="Top farmers will appear once sales are recorded."
            />
          ) : (
            <TopFarmersChart data={farmerChartData} />
          )}
        </>
      )}
    </div>
  );
}
