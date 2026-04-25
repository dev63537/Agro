import React from 'react'

export default function ProductSelector({ products, value, onChange }) {
  return (
    <select
      className="select"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Select a product...</option>
      {products.map(p => (
        <option key={p._id} value={p._id}>
          {p.name} — ₹{p.price}/{p.unit}
        </option>
      ))}
    </select>
  )
}
