import React, { useEffect, useState } from 'react'
import api from '../../lib/apiClient'
import SearchableDropdown from '../../components/SearchableDropdown'
import { useNavigate, Link } from 'react-router-dom'
import { showSuccess, showError } from '../../lib/toast'

/** Press Enter → move focus to next focusable field */
function onEnterNext(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
    e.preventDefault()
    const form = e.currentTarget.closest('form')
    const focusable = Array.from(
      form.querySelectorAll("input, select, textarea, button[type='submit']")
    ).filter((el) => !el.disabled)
    const idx = focusable.indexOf(e.target)
    if (idx < focusable.length - 1) focusable[idx + 1].focus()
  }
}

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
    if (!productId) e.productId = 'Select a product'
    if (!qty || Number(qty) <= 0) e.qty = 'Quantity must be greater than 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await api.post('/stock', { productId, qty: Number(qty), batchNo, expiryDate })
      showSuccess('Stock batch added successfully')
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
          <p className="text-sm text-secondary-400 mt-1">
            Press <kbd className="px-1.5 py-0.5 text-xs bg-surface-200 rounded border border-surface-300 font-mono">Enter</kbd> to move between fields
          </p>
        </div>
        <Link to="/shop/stock" className="btn-ghost">← Back</Link>
      </div>

      <div className="card max-w-lg">
        <div className="card-body">
          <form onSubmit={submit} className="space-y-5" onKeyDown={onEnterNext}>

            {/* Product Searchable Dropdown */}
            <div>
              <label className="label label-required">Product</label>
              <SearchableDropdown
                options={products}
                value={productId}
                onChange={(v) => { setProductId(v); setErrors({ ...errors, productId: null }); }}
                placeholder="📦 Select a product..."
                valueKey="_id"
                labelKey="name"
                renderLabel={(p) => `${p.name} (${p.unit})${p.company ? ` — ${p.company}` : ''}`}
                error={!!errors.productId}
                autoFocus
              />
              {errors.productId && <p className="field-error">{errors.productId}</p>}
            </div>

            {/* Qty + Batch row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label label-required">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className={`input ${errors.qty ? 'input-error' : ''}`}
                  placeholder="Enter quantity"
                  value={qty}
                  onChange={e => { setQty(e.target.value); setErrors({ ...errors, qty: null }); }}
                />
                {errors.qty && <p className="field-error">{errors.qty}</p>}
              </div>
              <div>
                <label className="label">Batch Number</label>
                <input
                  className="input"
                  placeholder="e.g. BATCH-001"
                  value={batchNo}
                  onChange={e => setBatchNo(e.target.value)}
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="label">Expiry Date</label>
              <input
                type="date"
                className="input"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </span>
                ) : '📦 Add Stock Batch'}
              </button>
              <Link to="/shop/stock" className="btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
