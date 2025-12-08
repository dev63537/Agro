import React, { useState } from 'react'
import api from '../../lib/apiClient'

export default function Ledger() {
  const [farmerId, setFarmerId] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [ledger, setLedger] = useState(null)

  const load = async () => {
    if (!farmerId) return alert('Select farmer id in header (set shop header).')
    try {
      const res = await api.get(`/ledger/${farmerId}/${year}`)
      setLedger(res.data.ledger)
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ledger</h2>
      <div className="mb-4 bg-white p-4 rounded shadow">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label>Farmer ID</label>
            <input value={farmerId} onChange={e=>setFarmerId(e.target.value)} placeholder="Enter farmer ID" />
          </div>
          <div>
            <label>Year</label>
            <input type="number" value={year} onChange={e=>setYear(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="btn-primary" onClick={load}>Load Ledger</button>
          </div>
        </div>
      </div>

      {ledger && (
        <div className="bg-white p-4 rounded shadow">
          <div>Year: {ledger.year}</div>
          <div>Total Due: {ledger.totalDue}</div>
          <div>Transactions:</div>
          <ul className="list-disc pl-6">
            {ledger.transactions.map((t, i) => <li key={i}>{t.type} — {t.amount} — {new Date(t.date).toLocaleString()}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}
