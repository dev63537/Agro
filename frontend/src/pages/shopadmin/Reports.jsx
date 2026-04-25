import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import StatCard from '../../components/StatCard'

export default function Reports() {
  const [sales, setSales] = useState(null)
  const [stock, setStock] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [salesRes, stockRes] = await Promise.all([
          api.get('/reports/sales'),
          api.get('/reports/stock').catch(() => ({ data: [] })),
        ])
        setSales(salesRes.data)
        setStock(stockRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const stockItems = Array.isArray(stock) ? stock : []
  const lowStockItems = stockItems.filter(s => (s.qty || 0) < 10)

  if (loading) return (
    <div className="space-y-4">
      <div className="page-header"><div className="h-7 w-32 skeleton rounded" /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="h-28 skeleton rounded-xl" />
        <div className="h-28 skeleton rounded-xl" />
        <div className="h-28 skeleton rounded-xl" />
        <div className="h-28 skeleton rounded-xl" />
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-secondary-400 mt-1">Overview of your shop performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-stagger">
        <StatCard title="Total Sales" value={`₹ ${(sales?.total || 0).toLocaleString()}`} icon="💰" color="green" />
        <StatCard title="Bills Created" value={sales?.count || 0} icon="🧾" color="blue" />
        <StatCard title="Stock Batches" value={stockItems.length} icon="📦" color="orange" />
        <StatCard title="Low Stock Items" value={lowStockItems.length} icon="⚠️" color="red" />
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Details */}
        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              💰 Sales Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-50">
                <span className="text-sm text-secondary-600">Total Revenue</span>
                <span className="font-bold text-primary-700">₹ {(sales?.total || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-50">
                <span className="text-sm text-secondary-600">Bills Generated</span>
                <span className="font-bold text-info-700">{sales?.count || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-surface-50">
                <span className="text-sm text-secondary-600">Average Bill Value</span>
                <span className="font-bold text-accent-700">
                  ₹ {sales?.count > 0 ? Math.round((sales?.total || 0) / sales.count).toLocaleString() : '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Overview */}
        <div className="card">
          <div className="card-body">
            <h3 className="font-semibold text-secondary-800 mb-4 flex items-center gap-2">
              📦 Stock Overview
            </h3>
            {lowStockItems.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm text-secondary-500">All products have sufficient stock!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-red-50 border border-red-100">
                    <span className="text-sm font-medium text-secondary-700">{item.productId?.name || item.name || 'Unknown'}</span>
                    <span className="badge-danger">{item.qty || 0} left</span>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <p className="text-xs text-center text-secondary-400">...and {lowStockItems.length - 5} more</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
