import React from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showSuccess, showError } from '../../lib/toast'

export default function Farmers() {
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['farmers'],
    queryFn: async () => {
      const res = await api.get('/farmers')
      return res.data.farmers
    }
  })

  const toggleActive = useMutation({
    mutationFn: ({ id, active }) => api.patch(`/farmers/${id}`, { active }),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries(['farmers'])
      showSuccess(active ? 'Farmer activated' : 'Farmer deactivated')
    },
    onError: (err) => showError(err?.response?.data?.error || 'Failed to update farmer'),
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
                <th>Code</th>
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
                  <td className="text-xs font-mono text-secondary-400">{f.farmerCode || '—'}</td>
                  <td className="font-medium text-secondary-800">{f.name}</td>
                  <td>{f.phone || '—'}</td>
                  <td>{f.village || '—'}</td>
                  <td>
                    <button
                      onClick={() => toggleActive.mutate({ id: f._id, active: !f.active })}
                      disabled={toggleActive.isPending}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        f.active
                          ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${f.active ? 'bg-primary-500' : 'bg-red-500'}`} />
                      {f.active ? 'Active' : 'Inactive'}
                    </button>
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
