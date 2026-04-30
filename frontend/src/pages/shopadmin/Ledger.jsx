import React, { useState, useEffect } from 'react'
import api from '../../lib/apiClient'
import SearchableDropdown from '../../components/SearchableDropdown'
import { showWarning, showError, showSuccess } from '../../lib/toast'

export default function Ledger() {
  const [farmers, setFarmers] = useState([])
  const [farmerId, setFarmerId] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [ledger, setLedger] = useState(null)
  const [loading, setLoading] = useState(false)

  // Payment form
  const [payAmount, setPayAmount] = useState('')
  const [paying, setPaying] = useState(false)

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
        setLedger({ year: year, totalDue: 0, transactions: [], status: 'cleared' })
      } else {
        showError(err.response?.data?.error || err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClearDues = async () => {
    const amount = parseFloat(payAmount)
    if (!amount || amount <= 0) return showWarning('Enter a valid payment amount')
    if (!farmerId) return showWarning('Select a farmer first')

    setPaying(true)
    try {
      await api.post('/ledger/clear', {
        farmerId,
        year: parseInt(year, 10),
        amountPaid: amount
      })
      showSuccess(`₹${amount.toLocaleString()} payment recorded successfully!`)
      setPayAmount('')
      // Reload ledger to reflect changes
      await load()
    } catch (err) {
      showError(err.response?.data?.error || err.message)
    } finally {
      setPaying(false)
    }
  }

  const selectedFarmer = farmers.find(f => f._id === farmerId)

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
              <SearchableDropdown
                options={farmers}
                value={farmerId}
                onChange={setFarmerId}
                placeholder="Select a farmer"
                valueKey="_id"
                labelKey="name"
                renderLabel={(f) =>
                  `${f.farmerCode ? `[${f.farmerCode}] ` : ''}${f.name}${f.village ? ` (${f.village})` : ''}${!f.active ? ' — ⚠️ Inactive' : ''}`
                }
              />
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
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card border-primary-200 bg-primary-50">
              <div className="card-body text-center">
                <p className="text-xs font-medium text-secondary-500 uppercase">Year</p>
                <p className="text-2xl font-bold text-primary-700">{ledger.year}</p>
              </div>
            </div>
            <div className={`card ${(ledger.totalDue || 0) > 0 ? 'border-red-200 bg-red-50' : 'border-primary-200 bg-primary-50'}`}>
              <div className="card-body text-center">
                <p className="text-xs font-medium text-secondary-500 uppercase">Total Due</p>
                <p className={`text-2xl font-bold ${(ledger.totalDue || 0) > 0 ? 'text-red-700' : 'text-primary-700'}`}>
                  ₹ {(ledger.totalDue || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="card border-info-200 bg-info-50">
              <div className="card-body text-center">
                <p className="text-xs font-medium text-secondary-500 uppercase">Transactions</p>
                <p className="text-2xl font-bold text-info-700">{(ledger.transactions || []).length}</p>
              </div>
            </div>
            <div className="card border-accent-200 bg-accent-50">
              <div className="card-body text-center">
                <p className="text-xs font-medium text-secondary-500 uppercase">Status</p>
                <p className="text-2xl font-bold text-accent-700 capitalize">{ledger.status || 'open'}</p>
              </div>
            </div>
          </div>

          {/* Record Payment Section */}
          {(ledger.totalDue || 0) > 0 && (
            <div className="card border-primary-200">
              <div className="card-body">
                <h3 className="font-semibold text-secondary-800 mb-3 flex items-center gap-2">
                  💰 Record Payment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="label">Payment Amount (₹)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder={`Max: ₹${(ledger.totalDue || 0).toLocaleString()}`}
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                      max={ledger.totalDue}
                    />
                  </div>
                  <div>
                    <button
                      className="btn-primary w-full"
                      onClick={handleClearDues}
                      disabled={paying || !payAmount}
                    >
                      {paying ? 'Processing...' : '✅ Record Payment'}
                    </button>
                  </div>
                  <div>
                    <button
                      className="btn-accent w-full"
                      onClick={() => {
                        setPayAmount(ledger.totalDue.toString())
                      }}
                    >
                      💯 Pay Full Amount (₹{(ledger.totalDue || 0).toLocaleString()})
                    </button>
                  </div>
                </div>
                {selectedFarmer && !selectedFarmer.active && (
                  <div className="mt-3 p-3 rounded-lg bg-accent-50 border border-accent-200 text-sm text-accent-800">
                    ⚠️ This farmer is currently <strong>Inactive</strong>. Clearing all dues will automatically re-activate them.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transactions Table */}
          {ledger.transactions && ledger.transactions.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Note</th>
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
                          {t.type === 'bill' ? '🧾 Bill' : '💰 Payment'}
                        </span>
                      </td>
                      <td className="text-secondary-500 text-sm">{t.note || '—'}</td>
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
