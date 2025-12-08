import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'

export default function StockBatches() {
  const [batches, setBatches] = useState([])

  useEffect(()=> {
    (async ()=> {
      try {
        const res = await api.get('/stock')
        setBatches(res.data.batches || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Stock Batches</h2>
        <Link to="/shop/stock/new" className="btn-primary">Add Stock Batch</Link>
      </div>
      <div className="space-y-3">
        {batches.map(b => (
          <div key={b._id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{b.batchNo || 'Batch'}</div>
              <div className="text-sm text-gray-600">Product: {b.productId?.name || b.productId}</div>
              <div className="text-sm text-gray-600">Qty: {b.qty} | Expiry: {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
