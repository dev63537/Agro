import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'

export default function ShopManagement() {
  const [shops, setShops] = useState([])

  useEffect(()=> {
    (async ()=> {
      try {
        const res = await api.get('/master/shops')
        setShops(res.data.shops || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shops</h2>
      <div className="space-y-3">
        {shops.map(s => (
          <div key={s._id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{s.name} ({s.code})</div>
              <div className="text-sm text-gray-600">{s.email}</div>
            </div>
            <div>
              <div>Status: {s.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
