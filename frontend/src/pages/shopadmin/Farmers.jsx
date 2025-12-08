import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'

export default function Farmers() {
  const [farmers, setFarmers] = useState([])

  useEffect(()=> {
    (async ()=> {
      try {
        const res = await api.get('/farmers')
        setFarmers(res.data.farmers || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Farmers</h2>
        <Link to="/shop/farmers/new" className="btn-primary">Add Farmer</Link>
      </div>
      <div className="space-y-3">
        {farmers.map(f => (
          <div key={f._id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{f.name}</div>
              <div className="text-sm text-gray-600">{f.village} | {f.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
