import React, { useMemo, useState } from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export default function Products() {
  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('all')

  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products')
      return res.data.products
    }
  })

  // Unique category list from data
  const categories = useMemo(() => {
    if (!data) return []
    const cats = [...new Set(data.map(p => p.category).filter(Boolean))]
    return cats.sort()
  }, [data])

  // Live filter: text search + category
  const filtered = useMemo(() => {
    if (!data) return []
    let list = data

    if (category !== 'all') list = list.filter(p => p.category === category)

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(p =>
        (p.name     || '').toLowerCase().includes(q) ||
        (p.company  || '').toLowerCase().includes(q) ||
        (p.sku      || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [data, search, category])

  if (isLoading) return (
    <div className="space-y-4">
      <div className="page-header"><div className="h-7 w-32 skeleton rounded" /></div>
      <div className="table-container"><div className="h-64 skeleton" /></div>
    </div>
  )
  if (error) return <div className="alert-error">Failed to load products</div>

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-sm text-secondary-400 mt-1">
            {filtered.length} of {data.length} products
          </p>
        </div>
        <Link to="/shop/products/new" className="btn-primary">
          ➕ Add Product
        </Link>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
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
            placeholder="Search by name, company, SKU…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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

        {/* Category chips — only show if categories exist */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {[{ key: 'all', label: 'All' }, ...categories.map(c => ({ key: c, label: c }))].map(chip => (
              <button
                key={chip.key}
                onClick={() => setCategory(chip.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                  category === chip.key
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface-100 text-secondary-600 hover:bg-surface-200'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results hint */}
      {(search || category !== 'all') && (
        <p className="mb-3 text-xs text-secondary-400">
          Showing <strong className="text-secondary-700">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
          {search && <> for &ldquo;<strong className="text-primary-700">{search}</strong>&rdquo;</>}
          {category !== 'all' && <> in <strong className="text-primary-700">{category}</strong></>}
        </p>
      )}

      {/* ── Table ── */}
      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">No products yet</div>
          <div className="empty-state-message">Add your first product to get started with billing.</div>
          <Link to="/shop/products/new" className="btn-primary">Add Product</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No matches found</div>
          <div className="empty-state-message">
            {search
              ? <>No product matches &ldquo;<strong>{search}</strong>&rdquo;.</>
              : <>No products in this category.</>
            }
          </div>
          <div className="flex gap-3 justify-center mt-2">
            {search        && <button onClick={() => setSearch('')}       className="btn-outline">✕ Clear Search</button>}
            {category !== 'all' && <button onClick={() => setCategory('all')} className="btn-ghost">Reset Category</button>}
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Company</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Unit</th>
                <th>GST %</th>
                <th>Category</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td className="font-medium text-secondary-800">{p.name}</td>
                  <td className="text-secondary-500">{p.company || '—'}</td>
                  <td><span className="badge-neutral">{p.sku || '—'}</span></td>
                  <td className="font-semibold text-primary-700">₹{p.price}</td>
                  <td>{p.unit}</td>
                  <td>{p.gstPercent || 0}%</td>
                  <td>{p.category || '—'}</td>
                  <td className="text-right">
                    <Link to={`/shop/products/${p._id}/edit`} className="btn btn-sm btn-ghost text-info-600">
                      ✏️ Edit
                    </Link>
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
