import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError } from '../../lib/toast'

export default function StockForm() {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [qty, setQty] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/products')
        setProducts(res.data.products || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const validate = () => {
    const e = {}
    if (!productId) e.productId = "Select a product"
    if (!qty || Number(qty) <= 0) e.qty = "Quantity must be greater than 0"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/stock', { productId, qty: Number(qty), batchNo, expiryDate })
      showSuccess("Stock batch added successfully")
      navigate('/shop/stock')
    } catch (err) {
      showError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Add Stock Batch</h1>
          <p className="text-sm text-secondary-400 mt-1">Add new inventory to your shop</p>
        </div>
        <Link to="/shop/stock" className="btn-ghost">← Back</Link>
      </div>

      <div className="card max-w-lg">
        <div className="card-body">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label label-required">Product</label>
              <select
                className={`select ${errors.productId ? 'input-error' : ''}`}
                value={productId}
                onChange={e => { setProductId(e.target.value); setErrors({...errors, productId: null}); }}
              >
                <option value="">Select a product</option>
                {products.map(p => <option value={p._id} key={p._id}>{p.name} ({p.unit})</option>)}
              </select>
              {errors.productId && <p className="field-error">{errors.productId}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label label-required">Quantity</label>
                <input
                  type="number"
                  className={`input ${errors.qty ? 'input-error' : ''}`}
                  placeholder="Enter quantity"
                  value={qty}
                  onChange={e => { setQty(e.target.value); setErrors({...errors, qty: null}); }}
                />
                {errors.qty && <p className="field-error">{errors.qty}</p>}
              </div>
              <div>
                <label className="label">Batch Number</label>
                <input className="input" placeholder="e.g. BATCH-001" value={batchNo} onChange={e => setBatchNo(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Expiry Date</label>
              <input type="date" className="input" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Add Stock Batch"}
              </button>
              <Link to="/shop/stock" className="btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
