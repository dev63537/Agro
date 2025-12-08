import React, { useState } from 'react'
import api from '../../lib/apiClient'
import { useNavigate } from 'react-router-dom'

export default function ProductForm() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('kg')
  const [gst, setGst] = useState(5)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/products', { name, price: Number(price), unit, gstPercent: Number(gst) })
      navigate('/shop/products')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Add Product</h2>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block mb-1">Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Price</label>
          <input value={price} onChange={e=>setPrice(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Unit</label>
          <input value={unit} onChange={e=>setUnit(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">GST %</label>
          <input value={gst} onChange={e=>setGst(e.target.value)} />
        </div>
        <div>
          <button className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  )
}
