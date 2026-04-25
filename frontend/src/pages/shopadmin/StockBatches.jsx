import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'

export default function StockBatches() {
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/stock')
        setBatches(res.data.batches || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return (
    <div className="space-y-4">
      <div className="page-header"><div className="h-7 w-40 skeleton rounded" /></div>
      <div className="table-container"><div className="h-64 skeleton" /></div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock Batches</h1>
          <p className="text-sm text-secondary-400 mt-1">{batches.length} batches in inventory</p>
        </div>
        <Link to="/shop/stock/new" className="btn-primary">➕ Add Stock</Link>
      </div>

      {batches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <div className="empty-state-title">No stock batches</div>
          <div className="empty-state-message">Add stock batches to track your inventory.</div>
          <Link to="/shop/stock/new" className="btn-primary">Add Stock Batch</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Batch No</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(b => (
                <tr key={b._id}>
                  <td className="font-medium text-secondary-800">{b.batchNo || '—'}</td>
                  <td>{b.productId?.name || b.productId || '—'}</td>
                  <td className="font-semibold">{b.qty}</td>
                  <td>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td>
                    {b.qty <= 0 ? (
                      <span className="badge-danger">Out of Stock</span>
                    ) : b.qty < 10 ? (
                      <span className="badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge-success">In Stock</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
