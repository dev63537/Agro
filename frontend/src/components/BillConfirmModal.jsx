import React from "react";

export default function BillConfirmModal({
    open,
    farmer,
    items,
    onCancel,
    onConfirm,
}) {
    if (!open) return null;

    const subTotal = items.reduce(
        (s, it) => s + (it.qty * it.unitPrice || 0),
        0
    );

    const gstTotal = items.reduce(
        (s, it) =>
            s + ((it.qty * it.unitPrice || 0) * (it.gstPercent || 0)) / 100,
        0
    );

    const total = subTotal + gstTotal;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4">
                    Confirm Bill
                </h2>

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span>Farmer</span>
                        <span className="font-medium">{farmer?.name}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Items</span>
                        <span>{items.length}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹ {subTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                        <span>GST</span>
                        <span>₹ {gstTotal.toFixed(2)}</span>
                    </div>

                    <hr />

                    <div className="flex justify-between text-lg font-bold text-green-700">
                        <span>Total</span>
                        <span>₹ {total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        className="px-4 py-2 rounded border"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>

                    <button
                        className="px-4 py-2 rounded bg-green-600 text-white"
                        onClick={onConfirm}
                    >
                        Confirm & Create Bill
                    </button>
                </div>
            </div>
        </div>
    );
}
