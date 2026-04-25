import React, { useState, useEffect } from 'react'
import api from '../../lib/apiClient'
import { showWarning, showError } from '../../lib/toast'

export default function Ledger() {
  const [farmers, setFarmers] = useState([])
  const [farmerId, setFarmerId] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [ledger, setLedger] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/farmers')
        setFarmers(res.data.farmers || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const load = async () => {
    if (!farmerId) return showWarning('Please select a farmer')
    setLoading(true)
    try {
      const res = await api.get(`/ledger/${farmerId}/${year}`)
      setLedger(res.data.ledger)
    } catch (err) {
      if (err.response?.status === 404) {
        // No ledger exists yet — show empty state instead of error
        setLedger({ year: year, totalDue: 0, transactions: [] })
      } else {
        showError(err.response?.data?.error || err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Farmer Ledger</h1>
          <p className="text-sm text-secondary-400 mt-1">View transaction history by farmer and year</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Farmer</label>
              <select className="select" value={farmerId} onChange={e => setFarmerId(e.target.value)}>
                <option value="">Select a farmer</option>
                {farmers.map(f => (
                  <option key={f._id} value={f._id}>{f.name} {f.village ? `(${f.village})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <input type="number" className="input" value={year} onChange={e => setYear(e.target.value)} />
            </div>
            <div className="flex items-end">
              <button className="btn-primary w-full" onClick={load} disabled={loading}>
                {loading ? 'Loading...' : '📒 Load Ledger'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {ledger ? (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card border-primary-200 bg-primary-50">
              <div className="card-body text-center">
                <p className="text-xs font-medium text-secondary-500 uppercase">Year</p>
                <p className="text-2xl font-bold text-primary-700">{ledger.year}</p>
              </div>
            </div>
            <div className="card border-red-200 bg-red-50">
              <div className="card-body text-center">
                <p className="text-xs font-medium text-secondary-500 uppercase">Total Due</p>
                <p className="text-2xl font-bold text-red-700">₹ {(ledger.totalDue || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="card border-info-200 bg-info-50">
              <div className="card-body text-center">
                <p className="text-xs font-medium text-secondary-500 uppercase">Transactions</p>
                <p className="text-2xl font-bold text-info-700">{(ledger.transactions || []).length}</p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          {ledger.transactions && ledger.transactions.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.transactions.map((t, i) => (
                    <tr key={i}>
                      <td className="text-secondary-400">{i + 1}</td>
                      <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={t.type === 'bill' ? 'badge-danger' : 'badge-success'}>
                          {t.type}
                        </span>
                      </td>
                      <td className={`text-right font-semibold ${t.type === 'bill' ? 'text-red-600' : 'text-primary-600'}`}>
                        {t.type === 'bill' ? '-' : '+'}₹ {Math.abs(t.amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No transactions</div>
              <div className="empty-state-message">No transactions found for this farmer in {year}.</div>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📒</div>
          <div className="empty-state-title">Select a farmer</div>
          <div className="empty-state-message">Choose a farmer and year above to view their ledger.</div>
        </div>
      )}
    </div>
  )
}
