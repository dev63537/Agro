import React from "react";
import { Link } from "react-router-dom";
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

import { useAuth } from "../../hooks/useAuth";

export default function ShopDashboard() {
  const { user } = useAuth();
  const { data: salesRes, isLoading: salesLoading } = useSalesReport();
  const { data: farmersRes, isLoading: farmersLoading } = useTopFarmers();
  const { data: lowStockRes, isLoading: lowStockLoading } = useLowStock();

  const isLoading = salesLoading || farmersLoading || lowStockLoading;

  const salesDataObj = salesRes || { total: 0, count: 0, bills: [] };
  const salesBills = salesDataObj.bills;

  const farmers = Array.isArray(farmersRes) ? farmersRes : [];
  const lowStock = Array.isArray(lowStockRes) ? lowStockRes : [];

  // Transform data
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

  const totalSales = salesBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalBills = salesBills.length;
  const totalFarmers = farmers.length;
  const lowStockCount = lowStock.length;

  // Today's sales
  const today = new Date().toDateString();
  const todayBills = salesBills.filter(b => new Date(b.createdAt).toDateString() === today);
  const todaySales = todayBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Pending dues
  const pendingBills = salesBills.filter(b => b.paymentType === 'pending');
  const pendingDues = pendingBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Recent bills (last 5)
  const recentBills = [...salesBills]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const shopName = user?.shop?.name || 'Shop';

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back! 👋</h1>
          <p className="text-sm text-secondary-400 mt-1">Here's what's happening at <span className="font-medium text-secondary-600">{shopName}</span></p>
        </div>
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
          <StatCard title="Today's Sales" value={`₹ ${todaySales.toLocaleString()}`} icon="💰" color="green" subtitle={`${todayBills.length} bills today`} trend={todayBills.length > 0 ? 'up' : null} />
          <StatCard title="Total Revenue" value={`₹ ${totalSales.toLocaleString()}`} icon="📈" color="blue" subtitle={`${totalBills} total bills`} />
          <StatCard title="Farmers" value={totalFarmers} icon="👨‍🌾" color="orange" />
          <StatCard title="Pending Dues" value={`₹ ${pendingDues.toLocaleString()}`} icon="⏳" color="red" subtitle={`${pendingBills.length} unpaid bills`} trend={pendingBills.length > 0 ? 'down' : null} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/shop/billing" className="quick-action no-underline">
          <span className="text-2xl">🧾</span>
          <div>
            <p className="font-semibold text-secondary-800">New Bill</p>
            <p className="text-xs text-secondary-400">Create a new invoice</p>
          </div>
        </Link>
        <Link to="/shop/products/new" className="quick-action no-underline">
          <span className="text-2xl">📦</span>
          <div>
            <p className="font-semibold text-secondary-800">Add Product</p>
            <p className="text-xs text-secondary-400">Add to your catalog</p>
          </div>
        </Link>
        <Link to="/shop/farmers/new" className="quick-action no-underline">
          <span className="text-2xl">👨‍🌾</span>
          <div>
            <p className="font-semibold text-secondary-800">Add Farmer</p>
            <p className="text-xs text-secondary-400">Register a new farmer</p>
          </div>
        </Link>
      </div>

      {/* Recent Bills */}
      {!isLoading && recentBills.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-secondary-800">🕐 Recent Bills</h3>
              <Link to="/shop/reports" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All →</Link>
            </div>
            <div className="space-y-2">
              {recentBills.map((bill) => (
                <Link
                  key={bill._id}
                  to={`/shop/invoice/${bill._id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface-50 hover:bg-primary-50/50 transition-colors no-underline"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-sm">🧾</div>
                    <div>
                      <p className="text-sm font-medium text-secondary-800">{bill.billNo || `Bill`}</p>
                      <p className="text-xs text-secondary-400">{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary-700">₹ {(bill.totalAmount || 0).toLocaleString()}</p>
                    {bill.paymentType === 'pending' ? (
                      <span className="text-[10px] text-red-500 font-medium">PENDING</span>
                    ) : (
                      <span className="text-[10px] text-primary-500 font-medium">PAID</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
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
          {salesBills.length === 0 ? (
            <EmptyState title="No sales yet" message="Create your first bill to see sales data here." />
          ) : (
            <SalesChart data={salesData.length ? salesData : [{ date: "No data", total: 0 }]} />
          )}

          {farmers.length === 0 ? (
            <EmptyState title="No farmers found" message="Add farmers to start tracking purchases." />
          ) : (
            <TopFarmersChart data={farmerData.length ? farmerData : [{ name: "No data", total: 0 }]} />
          )}
        </div>
      )}

      {/* Low Stock — full width */}
      {!isLoading && (
        lowStock.length === 0 ? (
          <EmptyState title="No low stock items" message="All products have sufficient stock." />
        ) : (
          <LowStockChart data={lowStockData.length ? lowStockData : [{ name: "No low stock", qty: 0 }]} />
        )
      )}
    </div>
  );
}
