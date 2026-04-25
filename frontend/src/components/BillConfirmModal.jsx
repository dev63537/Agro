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
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
                        ✅ Confirm Bill
                    </h2>
                </div>

                <div className="modal-body space-y-4">
                    <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between">
                            <span className="text-secondary-500">Farmer</span>
                            <span className="font-medium text-secondary-800">{farmer?.name || '—'}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-secondary-500">Items</span>
                            <span className="font-medium">{items.length}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-secondary-500">Subtotal</span>
                            <span>₹ {subTotal.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between">
                            <span className="text-secondary-500">GST</span>
                            <span>₹ {gstTotal.toFixed(2)}</span>
                        </div>

                        <hr className="border-surface-200" />

                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-secondary-800">Total</span>
                            <span className="text-primary-700">₹ {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-ghost" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={onConfirm}>
                        ✅ Confirm & Create
                    </button>
                </div>
            </div>
        </div>
    );
}
