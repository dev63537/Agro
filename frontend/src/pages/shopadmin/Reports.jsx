import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'

export default function Reports() {
  const [sales, setSales] = useState(null)

  useEffect(()=> {
    (async ()=> {
      try {
        const res = await api.get('/reports/sales')
        setSales(res.data)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reports</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Sales</h3>
          <div>Total: {sales?.total || 0}</div>
          <div>Count: {sales?.count || 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Stock</h3>
          <div><button onClick={async ()=> {
            const res = await api.get('/reports/stock')
            alert(`Batches: ${res.data.batches.length}`)
          }} className="btn-primary">Refresh Stock</button></div>
        </div>
      </div>
    </div>
  )
}
