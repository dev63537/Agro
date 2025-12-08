import React from 'react'

export default function BillSummary({ items }) {
  const sub = items.reduce((s, it) => s + (it.qty * it.unitPrice || 0), 0)
  const gst = items.reduce((s, it) => s + ((it.qty * it.unitPrice || 0) * (it.gstPercent || 0) / 100), 0)
  const total = sub + gst
  return (
    <div className="p-3 bg-white rounded shadow max-w-md">
      <h3 className="font-semibold mb-2">Summary</h3>
      <div>Subtotal: {sub.toFixed(2)}</div>
      <div>GST: {gst.toFixed(2)}</div>
      <div className="text-lg font-semibold mt-2">Total: {total.toFixed(2)}</div>
    </div>
  )
}
