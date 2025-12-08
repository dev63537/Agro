import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import { useNavigate } from 'react-router-dom'

export default function StockForm() {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    (async ()=> {
      try {
        const res = await api.get('/products')
        setProducts(res.data.products || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/stock', { productId, qty: Number(qty), batchNo, expiryDate })
      navigate('/shop/stock')
    } catch (err) {
      alert(err.response?.data?.error || err.message)
    }
  }

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Add Stock</h2>
      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block mb-1">Product</label>
          <select value={productId} onChange={e=>setProductId(e.target.value)}>
            <option value="">Select product</option>
            {products.map(p => <option value={p._id} key={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-1">Qty</label>
          <input value={qty} onChange={e=>setQty(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Batch No</label>
          <input value={batchNo} onChange={e=>setBatchNo(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">Expiry Date</label>
          <input type="date" value={expiryDate} onChange={e=>setExpiryDate(e.target.value)} />
        </div>
        <div>
          <button className="btn-primary">Save</button>
        </div>
      </form>
    </div>
  )
}
