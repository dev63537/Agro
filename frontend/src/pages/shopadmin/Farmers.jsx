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

  if (isLoading) return <div>Loading farmers...</div>
  if (error) return <div>Error loading farmers</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Farmers</h2>
        <Link to="/shop/farmers/new" className="btn-primary">
          Add Farmer
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="text-gray-500">No farmers found</div>
      ) : (
        <div className="space-y-3">
          {data.map(f => (
            <div key={f._id} className="p-3 bg-white rounded shadow flex justify-between">
              <div>
                <div className="font-semibold">{f.name}</div>
                <div className="text-sm text-gray-600">
                  {f.village} | {f.phone}
                </div>
                <div className="text-xs text-gray-400">
                  ID: {f._id}
                </div>
              </div>
              <Link to={`/shop/farmers/edit/${f._id}`} className="text-blue-600">
                Edit
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
