import React from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export default function Products() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products')
      return res.data.products
    }
  })

  if (isLoading) return (
    <div className="space-y-4">
      <div className="page-header"><div className="h-7 w-32 skeleton rounded" /></div>
      <div className="table-container"><div className="h-64 skeleton" /></div>
    </div>
  )
  if (error) return <div className="alert-error">Failed to load products</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-sm text-secondary-400 mt-1">{data.length} products in catalog</p>
        </div>
        <Link to="/shop/products/new" className="btn-primary">
          ➕ Add Product
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">No products yet</div>
          <div className="empty-state-message">Add your first product to get started with billing.</div>
          <Link to="/shop/products/new" className="btn-primary">Add Product</Link>
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
              {data.map(p => (
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
