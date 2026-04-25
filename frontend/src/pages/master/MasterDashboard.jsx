import React from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/StatCard";
import SalesChart from "../../components/charts/SalesChart";
import TopFarmersChart from "../../components/charts/TopFarmersChart";
import { SkeletonCard, SkeletonChart } from "../../components/Skeleton";
import EmptyState from "../../components/EmptyState";
import { useAuth } from "../../hooks/useAuth";

import {
  useMasterSales,
  useMasterTopFarmers,
  useMasterShopCount,
} from "../../hooks/reports/useMasterReports";

import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

export default function MasterDashboard() {
  const { user } = useAuth();
  const { data: salesDataRaw, isLoading: salesLoading } = useMasterSales();
  const { data: farmersRaw, isLoading: farmersLoading } = useMasterTopFarmers();
  const { data: totalShops = 0 } = useMasterShopCount();

  // Fetch shops list for active/suspended count
  const { data: shopsData } = useQuery({
    queryKey: ["master-shops-list"],
    queryFn: async () => {
      const res = await api.get("/master/shops");
      return res.data.shops || [];
    },
  });

  const shops = Array.isArray(shopsData) ? shopsData : [];
  const activeShops = shops.filter(s => s.status === "ACTIVE").length;
  const suspendedShops = shops.filter(s => s.status === "SUSPENDED").length;

  const isLoading = salesLoading || farmersLoading;

  const sales = Array.isArray(salesDataRaw) ? salesDataRaw : [];
  const farmers = Array.isArray(farmersRaw) ? farmersRaw : [];

  const totalRevenue = sales.reduce((sum, s) => sum + (s.total || 0), 0);
  const totalBills = sales.reduce((sum, s) => sum + (s.count || 0), 0);
  const totalFarmers = farmers.length;

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
      {/* Welcome */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name || 'Admin'} 👋</h1>
          <p className="text-sm text-secondary-400 mt-1">Here's your platform overview</p>
        </div>
        <Link to="/master/shops/create" className="btn-primary no-print">
          ➕ Create Shop
        </Link>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger">
          <StatCard title="Total Revenue" value={`₹ ${totalRevenue.toLocaleString()}`} icon="💰" color="green" />
          <StatCard title="Active Shops" value={activeShops} icon="🏪" color="blue" subtitle={suspendedShops > 0 ? `${suspendedShops} suspended` : 'All active'} trend={suspendedShops === 0 ? 'up' : 'down'} />
          <StatCard title="Top Farmers" value={totalFarmers} icon="👨‍🌾" color="orange" />
          <StatCard title="Total Bills" value={totalBills} icon="🧾" color="green" subtitle="All-time" />
        </div>
      )}

      {/* Charts */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {salesChartData.length === 0 ? (
            <EmptyState title="No sales yet" message="Sales data will appear once shops create bills." />
          ) : (
            <SalesChart data={salesChartData} />
          )}

          {farmerChartData.length === 0 ? (
            <EmptyState title="No farmers yet" message="Top farmers will appear once sales are recorded." />
          ) : (
            <TopFarmersChart data={farmerChartData} />
          )}
        </div>
      )}
    </div>
  );
}
