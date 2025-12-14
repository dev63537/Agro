import React from "react";
import SalesChart from "../../components/charts/SalesChart";
import TopFarmersChart from "../../components/charts/TopFarmersChart";
import LowStockChart from "../../components/charts/LowStockChart";

import {
  useSalesReport,
  useTopFarmers,
  useLowStock,
} from "../../hooks/reports/useReports";

export default function ShopDashboard() {
  const { data: salesRes } = useSalesReport();
  const { data: farmersRes } = useTopFarmers();
  const { data: lowStockRes } = useLowStock();

  // ✅ SAFETY: ALWAYS force arrays
  const salesBills = Array.isArray(salesRes?.bills)
    ? salesRes.bills
    : [];

  const farmers = Array.isArray(farmersRes) ? farmersRes : [];
  const lowStock = Array.isArray(lowStockRes) ? lowStockRes : [];

  // ✅ Transform safely
  const salesData = salesBills.map((b) => ({
    date: new Date(b.createdAt).toLocaleDateString(),
    total: b.total || 0,
  }));

  const farmerData = farmers.map((f) => ({
    name: f.farmer?.name || "Unknown",
    total: f.total || 0,
  }));

  const lowStockData = lowStock.map((p) => ({
    name: p.name || "Unknown",
    qty: p.qty || 0,
  }));

  return (
    <div className="space-y-6">
      <SalesChart
        data={salesData.length ? salesData : [{ date: "No data", total: 0 }]}
      />
      <TopFarmersChart
        data={
          farmerData.length ? farmerData : [{ name: "No data", total: 0 }]
        }
      />
      <LowStockChart
        data={
          lowStockData.length
            ? lowStockData
            : [{ name: "No low stock", qty: 0 }]
        }
      />
    </div>
  );
}
