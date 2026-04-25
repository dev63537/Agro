import React from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export default function Farmers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['farmers'],
    queryFn: async () => {
      const res = await api.get('/farmers')
      return res.data.farmers
    }
  })

  if (isLoading) return (
    <div className="space-y-4">
      <div className="page-header"><div className="h-7 w-32 skeleton rounded" /></div>
      <div className="table-container"><div className="h-64 skeleton" /></div>
    </div>
  )
  if (error) return <div className="alert-error">Failed to load farmers</div>

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Farmers</h1>
          <p className="text-sm text-secondary-400 mt-1">{data.length} farmers registered</p>
        </div>
        <Link to="/shop/farmers/new" className="btn-primary">
          ➕ Add Farmer
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍🌾</div>
          <div className="empty-state-title">No farmers yet</div>
          <div className="empty-state-message">Register your first farmer to start creating bills.</div>
          <Link to="/shop/farmers/new" className="btn-primary">Add Farmer</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Village</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map(f => (
                <tr key={f._id}>
                  <td className="font-medium text-secondary-800">{f.name}</td>
                  <td>{f.phone || '—'}</td>
                  <td>{f.village || '—'}</td>
                  <td>
                    {f.active ? (
                      <span className="badge-success">Active</span>
                    ) : (
                      <span className="badge-danger">Inactive</span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link to={`/shop/farmers/${f._id}/edit`} className="btn btn-sm btn-ghost text-info-600">
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
