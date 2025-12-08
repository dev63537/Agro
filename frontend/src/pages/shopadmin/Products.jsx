import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import { Link } from 'react-router-dom'

export default function Products() {
  const [products, setProducts] = useState([])

  useEffect(()=> {
    (async ()=> {
      try {
        const res = await api.get('/products')
        setProducts(res.data.products || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Link to="/shop/products/new" className="btn-primary">Add Product</Link>
      </div>
      <div className="space-y-3">
        {products.map(p => (
          <div key={p._id} className="p-3 bg-white rounded shadow flex justify-between">
            <div>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">Price: {p.price} / {p.unit}</div>
            </div>
            <div>
              <Link to="#" className="text-blue-600">Edit</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
