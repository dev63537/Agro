import React from 'react'

export default function BillSummary({ items, subTotal: propSubTotal, gstTotal: propGstTotal, grandTotal: propGrandTotal }) {
  const itemCount = items.length

  const subTotal = propSubTotal ?? items.reduce(
    (sum, it) => sum + (Number(it.qty) * Number(it.unitPrice) || 0),
    0
  )

  const gstTotal = propGstTotal ?? items.reduce(
    (sum, it) =>
      sum +
      ((Number(it.qty) * Number(it.unitPrice) || 0) *
        (Number(it.gstPercent) || 0)) /
        100,
    0
  )

  const total = propGrandTotal ?? (subTotal + gstTotal)

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="font-semibold text-secondary-800 mb-4">📋 Bill Summary</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-secondary-500">Items</span>
            <span className="font-medium text-secondary-800">{itemCount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-secondary-500">Subtotal</span>
            <span className="font-medium text-secondary-800">₹ {subTotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-secondary-500">GST</span>
            <span className="font-medium text-secondary-800">₹ {gstTotal.toFixed(2)}</span>
          </div>

          <hr className="border-surface-200" />

          <div className="flex justify-between text-lg font-bold">
            <span className="text-secondary-800">Total</span>
            <span className="text-primary-700">₹ {total.toFixed(2)}</span>
          </div>
        </div>

        {total === 0 && (
          <div className="mt-4 p-3 rounded-lg bg-accent-50 border border-accent-200 text-center">
            <p className="text-xs text-accent-700">⚠ Add items to generate bill total</p>
          </div>
        )}
      </div>
    </div>
  )
}
