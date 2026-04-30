import React, { useMemo, useState } from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { showSuccess, showError } from '../../lib/toast'

export default function Farmers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // 'all' | 'dues' | 'inactive'

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

  const sendReminder = useMutation({
    mutationFn: (id) => api.post(`/farmers/${id}/remind`),
    onSuccess: () => showSuccess('Reminder sent successfully'),
    onError: (err) => showError(err?.response?.data?.error || 'Failed to send reminder'),
  })

  // Derived stats for quick chips
  const stats = useMemo(() => {
    if (!data) return { total: 0, withDues: 0, inactive: 0, totalDues: 0 }
    return {
      total:     data.length,
      withDues:  data.filter(f => f.pendingDues > 0).length,
      inactive:  data.filter(f => !f.active).length,
      totalDues: data.reduce((s, f) => s + (f.pendingDues || 0), 0),
    }
  }, [data])

  // Live filter: text search + quick-filter chip
  const filtered = useMemo(() => {
    if (!data) return []
    let list = data

    // Quick chip filters
    if (filter === 'dues')     list = list.filter(f => f.pendingDues > 0)
    if (filter === 'inactive') list = list.filter(f => !f.active)

    // Text search: name, phone, village, farmerCode
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(f =>
        (f.name        || '').toLowerCase().includes(q) ||
        (f.phone       || '').toLowerCase().includes(q) ||
        (f.village     || '').toLowerCase().includes(q) ||
        (f.farmerCode  || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [data, search, filter])

  if (isLoading) return (
    <div className="space-y-4">
      <div className="page-header"><div className="h-7 w-32 skeleton rounded" /></div>
      <div className="table-container"><div className="h-64 skeleton" /></div>
    </div>
  )
  if (error) return <div className="alert-error">Failed to load farmers</div>

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Farmers</h1>
          <p className="text-sm text-secondary-400 mt-1">
            {filtered.length} of {data.length} farmers
          </p>
        </div>
        <Link to="/shop/farmers/new" className="btn-primary">
          ➕ Add Farmer
        </Link>
      </div>

      {/* ── Summary Chips ── */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Total dues banner */}
        {stats.totalDues > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            💸 Total Pending: ₹{stats.totalDues.toLocaleString()}
          </div>
        )}
        {/* Quick filter chips */}
        {[
          { key: 'all',      label: `All (${stats.total})`,              color: filter === 'all'      ? 'bg-primary-500 text-white' : 'bg-surface-100 text-secondary-600 hover:bg-surface-200' },
          { key: 'dues',     label: `⚠️ With Dues (${stats.withDues})`, color: filter === 'dues'     ? 'bg-red-500 text-white'     : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' },
          { key: 'inactive', label: `🔴 Inactive (${stats.inactive})`, color: filter === 'inactive' ? 'bg-secondary-500 text-white' : 'bg-surface-100 text-secondary-600 hover:bg-surface-200' },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${chip.color}`}
          >
            {chip.label}
          </button>
        ))}
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
            placeholder="Search by name, phone, village, code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
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

        {search && (
          <p className="mt-2 text-xs text-secondary-400">
            Showing <strong className="text-secondary-700">{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''} for &ldquo;<strong className="text-primary-700">{search}</strong>&rdquo;
          </p>
        )}
      </div>

      {/* ── Table ── */}
      {data.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍🌾</div>
          <div className="empty-state-title">No farmers yet</div>
          <div className="empty-state-message">Register your first farmer to start creating bills.</div>
          <Link to="/shop/farmers/new" className="btn-primary">Add Farmer</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No matches found</div>
          <div className="empty-state-message">
            {search
              ? <>No farmer matches &ldquo;<strong>{search}</strong>&rdquo;.</>
              : <>No farmers match the selected filter.</>
            }
          </div>
          <div className="flex gap-3 justify-center mt-2">
            {search    && <button onClick={() => setSearch('')}    className="btn-outline">✕ Clear Search</button>}
            {filter !== 'all' && <button onClick={() => setFilter('all')} className="btn-ghost">Reset Filter</button>}
          </div>
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
                <th>Pending Dues</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f._id} className={f.pendingDues > 0 ? 'bg-red-50/40' : ''}>
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
                  <td className={`font-semibold ${f.pendingDues > 0 ? 'text-red-600' : 'text-secondary-400'}`}>
                    {f.pendingDues > 0 ? (
                      <span className="flex items-center gap-1">
                        ₹{f.pendingDues.toLocaleString()}
                        <span className="badge-danger text-xs">Due</span>
                      </span>
                    ) : '—'}
                  </td>
                  <td className="text-right flex items-center justify-end gap-2">
                    {f.pendingDues > 0 && (
                      <button
                        className="btn btn-sm bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                        onClick={() => sendReminder.mutate(f._id)}
                        disabled={sendReminder.isPending}
                      >
                        🔔 Remind
                      </button>
                    )}
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
