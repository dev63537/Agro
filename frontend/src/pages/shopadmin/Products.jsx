import React from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

export default function Products() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products')
      return res.data.products
    }
  })

  if (isLoading) return <div>Loading products...</div>
  if (error) return <div>Error loading products</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link to="/shop/products/new" className="btn-primary">
          Add Product
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="text-gray-500">No products found</div>
      ) : (
        <div className="space-y-3">
          {data.map(p => (
            <div key={p._id} className="p-3 bg-white rounded shadow flex justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">
                  Price: ₹{p.price} / {p.unit}
                </div>
              </div>
              <Link to={`/shop/products/${p._id}/edit`} className="text-blue-600">
                Edit
              </Link>


            </div>
          ))}
        </div>
      )}
    </div>
  )
}
