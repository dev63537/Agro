import React from 'react'
import SalesChart from '../../components/charts/SalesChart'
import TopFarmersChart from '../../components/charts/TopFarmersChart'
import LowStockChart from '../../components/charts/LowStockChart'

import { useMasterSales, useMasterTopFarmers, useMasterLowStock } from '../../hooks/reports/useMasterReports'

export default function MasterDashboard() {
  const { data: sales = [], isLoading: salesLoading } = useMasterSales()
  const { data: farmers = [], isLoading: farmersLoading } = useMasterTopFarmers()
  const { data: lowStock = [], isLoading: lowStockLoading } = useMasterLowStock(10)

  // Transform sales aggregate into chart format
  const salesData = (sales || []).map((s) => ({
    date: `M${s.month || s._id?.month || s.month}`,
    total: s.total || 0
  }))

  // Farmers: controller returns name/total
  const farmerData = (farmers || []).map((f) => ({
    name: f.name || (f.farmer && f.farmer.name) || 'Unknown',
    total: f.total || 0
  }))

  // Low stock: controller returns product name and totalQty
  const lowData = (lowStock || []).map((p) => ({
    name: p.name || 'Unknown',
    qty: p.totalQty || p.qty || 0
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Master Dashboard — Aggregated Reports</h2>
      </div>

      {salesLoading ? (
        <div className="bg-white p-4 rounded shadow">Loading sales...</div>
      ) : (
        <SalesChart data={salesData.length ? salesData : [{ date: 'No data', total: 0 }]} />
      )}

      {farmersLoading ? (
        <div className="bg-white p-4 rounded shadow">Loading top farmers...</div>
      ) : (
        <TopFarmersChart data={farmerData.length ? farmerData : [{ name: 'No data', total: 0 }]} />
      )}

      {lowStockLoading ? (
        <div className="bg-white p-4 rounded shadow">Loading low stock...</div>
      ) : (
        <LowStockChart data={lowData.length ? lowData : [{ name: 'No low stock', qty: 0 }]} />
      )}
    </div>
  )
}
