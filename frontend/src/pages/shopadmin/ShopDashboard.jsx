import React from "react";
import SalesChart from "../../components/charts/SalesChart";
import TopFarmersChart from "../../components/charts/TopFarmersChart";
import LowStockChart from "../../components/charts/LowStockChart";

import { useSalesReport, useTopFarmers, useLowStock } from "../../hooks/reports/useReports";

export default function ShopDashboard() {
  const { data: sales = [] } = useSalesReport();
  const { data: farmers = [] } = useTopFarmers();
  const { data: lowStock = [] } = useLowStock();

  // Transform backend format -> chart format
  const salesData = sales.map((s) => ({
    date: `Month ${s._id}`,
    total: s.total
  }));

  const farmerData = farmers.map((f) => ({
    name: f.farmer.name,
    total: f.total
  }));

  const lowData = lowStock.map((l) => ({
    name: l.name,
    qty: l.qty
  }));

  return (
    <div className="space-y-6">
      <SalesChart data={salesData} />
      <TopFarmersChart data={farmerData} />
      <LowStockChart data={lowData} />
    </div>
  );
}
