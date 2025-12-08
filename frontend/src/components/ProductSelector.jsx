import React from 'react'

export default function ProductSelector({ products, value, onChange }) {
  return (
    <select value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">Select product</option>
      {products.map(p => <option value={p._id} key={p._id}>{p.name} — {p.price}</option>)}
    </select>
  )
}
