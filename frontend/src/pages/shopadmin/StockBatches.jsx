import React, { useEffect, useMemo, useState } from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'

export default function StockBatches() {
  const [batches, setBatches]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [search,  setSearch]    = useState('')

  useEffect(() => {
    ;(async () => {
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

  // Live client-side filter: product name, batch number, status
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return batches
    return batches.filter(b => {
      const name    = (b.productId?.name || '').toLowerCase()
      const batchNo = (b.batchNo || '').toLowerCase()
      const status  = b.qty <= 0 ? 'out of stock' : b.qty < 10 ? 'low stock' : 'in stock'
      return name.includes(q) || batchNo.includes(q) || status.includes(q)
    })
  }, [batches, search])

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
          <p className="text-sm text-secondary-400 mt-1">
            {filtered.length} of {batches.length} batches
          </p>
        </div>
        <Link to="/shop/stock/new" className="btn-primary">➕ Add Stock</Link>
      </div>

      {/* ── Search Bar ── */}
      <div className="mb-5">
        <div className="relative max-w-sm">
          {/* Search icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none"
            viewBox="0 0 20 20" fill="none"
          >
            <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M13 13l3 3" />
          </svg>

          <input
            type="text"
            className="input pl-9 pr-9"
            placeholder="Search by product, batch no., status…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />

          {/* Clear button */}
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-700 transition-colors"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter chips */}
        {search && (
          <p className="mt-2 text-xs text-secondary-400">
            Showing <strong className="text-secondary-700">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for &ldquo;<strong className="text-primary-700">{search}</strong>&rdquo;
          </p>
        )}
      </div>

      {batches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏷️</div>
          <div className="empty-state-title">No stock batches</div>
          <div className="empty-state-message">Add stock batches to track your inventory.</div>
          <Link to="/shop/stock/new" className="btn-primary">Add Stock Batch</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No matches found</div>
          <div className="empty-state-message">
            No stock batch matches &ldquo;<strong>{search}</strong>&rdquo;. Try a different keyword.
          </div>
          <button onClick={() => setSearch('')} className="btn-outline">✕ Clear Search</button>
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
              {filtered.map(b => (
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
