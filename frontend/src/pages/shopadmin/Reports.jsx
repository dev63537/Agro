import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import StatCard from '../../components/StatCard'
import { showError } from '../../lib/toast'

const TABS = [
  { key: 'sales', label: '💰 Sales', icon: '💰' },
  { key: 'farmer-dues', label: '📋 Farmer Dues', icon: '📋' },
  { key: 'farmer-purchases', label: '👨‍🌾 Farmer Purchases', icon: '👨‍🌾' },
  { key: 'product-movement', label: '📦 Product Movement', icon: '📦' },
]

function downloadCSV(filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export default function Reports() {
  const [tab, setTab] = useState('sales')
  const [loading, setLoading] = useState(false)

  // Date filter
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Data
  const [sales, setSales] = useState(null)
  const [farmerDues, setFarmerDues] = useState(null)
  const [farmerPurchases, setFarmerPurchases] = useState(null)
  const [productMovement, setProductMovement] = useState(null)
  const [stock, setStock] = useState(null)
  const [duesYear, setDuesYear] = useState(new Date().getFullYear())

  const fetchData = async (activeTab) => {
    setLoading(true)
    try {
      const params = {}
      if (from) params.from = from
      if (to) params.to = to

      if (activeTab === 'sales') {
        const [salesRes, stockRes] = await Promise.all([
          api.get('/reports/sales', { params }),
          api.get('/reports/stock').catch(() => ({ data: [] })),
        ])
        setSales(salesRes.data)
        setStock(stockRes.data)
      } else if (activeTab === 'farmer-dues') {
        const res = await api.get('/reports/farmer-dues', { params: { year: duesYear } })
        setFarmerDues(res.data)
      } else if (activeTab === 'farmer-purchases') {
        const res = await api.get('/reports/farmer-purchases', { params })
        setFarmerPurchases(res.data)
      } else if (activeTab === 'product-movement') {
        const res = await api.get('/reports/product-movement', { params })
        setProductMovement(res.data)
      }
    } catch (err) {
      showError(err?.response?.data?.error || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(tab)
  }, [tab, duesYear])

  const handleFilter = () => fetchData(tab)

  const stockItems = Array.isArray(stock) ? stock : []
  const lowStockItems = stockItems.filter(s => (s.qty || 0) < 10)

  // CSV export handlers
  const exportSalesCSV = () => {
    if (!sales?.bills?.length) return
    const headers = ['Bill No', 'Farmer', 'Date', 'Payment', 'Amount']
    const rows = sales.bills.map(b => [
      b.billNo,
      `"${b.farmerId?.name || 'Unknown'}"`,
      new Date(b.createdAt).toLocaleDateString('en-IN'),
      b.paymentType,
      b.totalAmount
    ])
    downloadCSV('sales_report.csv', headers, rows)
  }

  const exportDuesCSV = () => {
    if (!farmerDues?.dues?.length) return
    const headers = ['Farmer Code', 'Farmer Name', 'Village', 'Phone', 'Total Due', 'Status']
    const rows = farmerDues.dues.map(d => [
      d.farmer?.farmerCode || '',
      `"${d.farmer?.name || 'Unknown'}"`,
      `"${d.farmer?.village || ''}"`,
      d.farmer?.phone || '',
      d.totalDue,
      d.status
    ])
    downloadCSV('farmer_dues_report.csv', headers, rows)
  }

  const exportPurchasesCSV = () => {
    if (!farmerPurchases?.length) return
    const headers = ['Farmer Code', 'Farmer Name', 'Total Amount', 'Bills', 'Last Purchase']
    const rows = farmerPurchases.map(d => [
      d.farmer?.farmerCode || '',
      `"${d.farmer?.name || 'Unknown'}"`,
      d.totalAmount,
      d.billCount,
      new Date(d.lastPurchase).toLocaleDateString('en-IN')
    ])
    downloadCSV('farmer_purchases_report.csv', headers, rows)
  }

  const exportProductCSV = () => {
    if (!productMovement?.length) return
    const headers = ['Product', 'Qty Sold', 'Revenue', 'Bills']
    const rows = productMovement.map(d => [
      `"${d.productName || 'Unknown'}"`,
      d.totalQtySold,
      d.totalRevenue?.toFixed(2),
      d.billCount
    ])
    downloadCSV('product_movement_report.csv', headers, rows)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-sm text-secondary-400 mt-1">Detailed analytics of your shop performance</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 p-1 rounded-xl overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              tab === t.key
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-secondary-500 hover:text-secondary-700 hover:bg-surface-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Date Filter (not for dues tab) */}
      {tab !== 'farmer-dues' ? (
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="label">From Date</label>
                <input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} />
              </div>
              <div>
                <label className="label">To Date</label>
                <input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} />
              </div>
              <div>
                <button onClick={handleFilter} className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Loading...' : '🔍 Apply Filter'}
                </button>
              </div>
              <div>
                <button
                  onClick={() => { setFrom(''); setTo(''); setTimeout(() => fetchData(tab), 0); }}
                  className="btn-ghost w-full"
                >
                  ✕ Clear Filter
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mb-6">
          <div className="card-body">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div>
                <label className="label">Year</label>
                <input type="number" className="input" value={duesYear} onChange={e => setDuesYear(e.target.value)} />
              </div>
              <div>
                <button onClick={() => fetchData('farmer-dues')} className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Loading...' : '🔍 Load Dues'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="h-28 skeleton rounded-xl" />
            <div className="h-28 skeleton rounded-xl" />
            <div className="h-28 skeleton rounded-xl" />
            <div className="h-28 skeleton rounded-xl" />
          </div>
        </div>
      )}

      {/* ===== SALES TAB ===== */}
      {!loading && tab === 'sales' && sales && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-stagger">
            <StatCard title="Total Sales" value={`₹ ${(sales?.total || 0).toLocaleString()}`} icon="💰" color="green" />
            <StatCard title="Bills Created" value={sales?.count || 0} icon="🧾" color="blue" />
            <StatCard title="Stock Batches" value={stockItems.length} icon="📦" color="orange" />
            <StatCard title="Low Stock Items" value={lowStockItems.length} icon="⚠️" color="red" />
          </div>

          <div className="flex justify-end">
            <button onClick={exportSalesCSV} className="btn-outline btn-sm" disabled={!sales?.bills?.length}>
              📥 Export CSV
            </button>
          </div>

          {/* Sales Table */}
          {sales?.bills?.length > 0 && (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Bill No</th>
                    <th>Farmer</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.bills.map((b) => (
                    <tr key={b._id}>
                      <td className="font-medium text-secondary-800">{b.billNo}</td>
                      <td>{b.farmerId?.name || '—'}</td>
                      <td>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        {b.paymentType === 'pending'
                          ? <span className="badge-danger">Pending</span>
                          : <span className="badge-success capitalize">{b.paymentType}</span>
                        }
                      </td>
                      <td className="text-right font-semibold">₹ {(b.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== FARMER DUES TAB ===== */}
      {!loading && tab === 'farmer-dues' && farmerDues && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-stagger">
            <StatCard title="Farmers with Dues" value={farmerDues.count || 0} icon="👨‍🌾" color="red" />
            <StatCard title="Total Outstanding" value={`₹ ${(farmerDues.totalDues || 0).toLocaleString()}`} icon="💸" color="orange" />
            <StatCard title="Year" value={farmerDues.year} icon="📅" color="blue" />
          </div>

          <div className="flex justify-end">
            <button onClick={exportDuesCSV} className="btn-outline btn-sm" disabled={!farmerDues?.dues?.length}>
              📥 Export CSV
            </button>
          </div>

          {farmerDues?.dues?.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Farmer</th>
                    <th>Village</th>
                    <th>Status</th>
                    <th className="text-right">Total Due</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerDues.dues.map((d, i) => (
                    <tr key={i}>
                      <td className="text-xs font-mono text-secondary-400">{d.farmer?.farmerCode || '—'}</td>
                      <td className="font-medium text-secondary-800">{d.farmer?.name || '—'}</td>
                      <td>{d.farmer?.village || '—'}</td>
                      <td>
                        {d.farmer?.active
                          ? <span className="badge-success">Active</span>
                          : <span className="badge-danger">Inactive</span>
                        }
                      </td>
                      <td className="text-right font-semibold text-red-600">₹ {(d.totalDue || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <div className="empty-state-title">No outstanding dues</div>
              <div className="empty-state-message">All farmers have cleared their dues for {farmerDues.year}.</div>
            </div>
          )}
        </div>
      )}

      {/* ===== FARMER PURCHASES TAB ===== */}
      {!loading && tab === 'farmer-purchases' && farmerPurchases && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={exportPurchasesCSV} className="btn-outline btn-sm" disabled={!farmerPurchases?.length}>
              📥 Export CSV
            </button>
          </div>

          {farmerPurchases.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Farmer</th>
                    <th>Bills</th>
                    <th>Last Purchase</th>
                    <th className="text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerPurchases.map((d, i) => (
                    <tr key={i}>
                      <td className="text-xs font-mono text-secondary-400">{d.farmer?.farmerCode || '—'}</td>
                      <td className="font-medium text-secondary-800">{d.farmer?.name || '—'}</td>
                      <td>{d.billCount}</td>
                      <td>{new Date(d.lastPurchase).toLocaleDateString('en-IN')}</td>
                      <td className="text-right font-semibold text-primary-700">₹ {(d.totalAmount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <div className="empty-state-title">No purchase data</div>
              <div className="empty-state-message">No farmer purchases found for the selected period.</div>
            </div>
          )}
        </div>
      )}

      {/* ===== PRODUCT MOVEMENT TAB ===== */}
      {!loading && tab === 'product-movement' && productMovement && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button onClick={exportProductCSV} className="btn-outline btn-sm" disabled={!productMovement?.length}>
              📥 Export CSV
            </button>
          </div>

          {productMovement.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Qty Sold</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">Bills</th>
                  </tr>
                </thead>
                <tbody>
                  {productMovement.map((d, i) => (
                    <tr key={i}>
                      <td className="font-medium text-secondary-800">{d.productName || '—'}</td>
                      <td className="text-right">{d.totalQtySold}</td>
                      <td className="text-right font-semibold text-primary-700">₹ {(d.totalRevenue || 0).toLocaleString()}</td>
                      <td className="text-right">{d.billCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-title">No movement data</div>
              <div className="empty-state-message">No product sales found for the selected period.</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
