import React from "react";
import EmptyState from "../../components/EmptyState";
import SalesChart from "../../components/charts/SalesChart";
import TopFarmersChart from "../../components/charts/TopFarmersChart";
import StatCard from "../../components/StatCard";
import LowStockChart from "../../components/charts/LowStockChart";
import { SkeletonCard, SkeletonChart } from "../../components/Skeleton";

import {
  useSalesReport,
  useTopFarmers,
  useLowStock,
} from "../../hooks/reports/useReports";

export default function ShopDashboard() {
  const { data: salesRes, isLoading: salesLoading } = useSalesReport();
  const { data: farmersRes, isLoading: farmersLoading } = useTopFarmers();
  const { data: lowStockRes, isLoading: lowStockLoading } = useLowStock();

  const isLoading = salesLoading || farmersLoading || lowStockLoading;

  const salesDataObj = salesRes || { total: 0, count: 0, bills: [] };
  const salesBills = salesDataObj.bills;


  const farmers = Array.isArray(farmersRes) ? farmersRes : [];
  const lowStock = Array.isArray(lowStockRes) ? lowStockRes : [];

  // ✅ Transform safely
  const salesData = salesBills.map((b) => ({
    date: new Date(b.createdAt).toLocaleDateString(),
    total: b.totalAmount || 0,
  }));

  const farmerData = farmers.map((f) => ({
    name: f.farmer?.name || "Unknown",
    total: f.total || 0,
  }));

  const lowStockData = lowStock.map((p) => ({
    name: p.name || "Unknown",
    qty: p.qty || 0,
  }));

  const totalSales = salesBills.reduce(
    (sum, b) => sum + (b.totalAmount || 0),
    0
  );

  const totalBills = salesBills.length;
  const totalFarmers = farmers.length;
  const lowStockCount = lowStock.length;


  console.log("SALES API RESPONSE:", salesRes);
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
          <StatCard title="Total Sales" value={`₹ ${totalSales}`} />
          <StatCard title="Total Bills" value={totalBills} />
          <StatCard title="Farmers" value={totalFarmers} />
          <StatCard title="Low Stock Items" value={lowStockCount} />
        </div>
      )}

      {isLoading ? (
        <>
          <SkeletonChart />
          <SkeletonChart />
          <SkeletonChart />
        </>
      ) : (
        <>
          {!isLoading && salesBills.length === 0 ? (
            <EmptyState
              title="No sales yet"
              message="Create your first bill to see sales data here."
            />
          ) : (
            <SalesChart
              data={
                salesData.length ? salesData : [{ date: "No data", total: 0 }]
              }
            />
          )}

          {!isLoading && farmers.length === 0 ? (
            <EmptyState
              title="No farmers found"
              message="Add farmers to start tracking purchases."
            />
          ) : (
            <TopFarmersChart
              data={
                farmerData.length ? farmerData : [{ name: "No data", total: 0 }]
              }
            />
          )}

          {!isLoading && lowStock.length === 0 ? (
            <EmptyState
              title="No low stock items"
              message="All products have sufficient stock."
            />
          ) : (
            <LowStockChart
              data={
                lowStockData.length
                  ? lowStockData
                  : [{ name: "No low stock", qty: 0 }]
              }
            />
          )}
        </>
      )}
    </div>
  );
}
