import React from 'react'

export default function BillSummary({ items }) {
  const itemCount = items.length

  const subTotal = items.reduce(
    (sum, it) => sum + (Number(it.qty) * Number(it.unitPrice) || 0),
    0
  )

  const gstTotal = items.reduce(
    (sum, it) =>
      sum +
      ((Number(it.qty) * Number(it.unitPrice) || 0) *
        (Number(it.gstPercent) || 0)) /
        100,
    0
  )

  const total = subTotal + gstTotal

  return (
    <div className="p-4 bg-white rounded shadow max-w-md">
      <h3 className="font-semibold text-lg mb-3">Bill Summary</h3>

      <div className="flex justify-between text-sm mb-1">
        <span>Items</span>
        <span>{itemCount}</span>
      </div>

      <div className="flex justify-between text-sm mb-1">
        <span>Subtotal</span>
        <span>₹ {subTotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span>GST</span>
        <span>₹ {gstTotal.toFixed(2)}</span>
      </div>

      <hr className="my-2" />

      <div className="flex justify-between text-lg font-bold text-green-700">
        <span>Total</span>
        <span>₹ {total.toFixed(2)}</span>
      </div>

      {/* ⚠️ Hooks for future warnings */}
      {total === 0 && (
        <div className="mt-2 text-sm text-red-600">
          ⚠ Please add items to generate bill
        </div>
      )}
    </div>
  )
}
