import React, { useEffect, useRef } from "react";

export default function BillConfirmModal({
    open,
    farmer,
    items,
    onCancel,
    onConfirm,
}) {
    const confirmButtonRef = useRef(null);

    // Escape key listener to close modal
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        // Focus the confirm button or first interactive element when opened
        confirmButtonRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, onCancel]);

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
        <div 
            className="modal-backdrop" 
            onClick={onCancel}
            role="presentation"
        >
            <div 
                className="modal-content max-w-md" 
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-bill-title"
            >
                <div className="modal-header">
                    <h2 id="confirm-bill-title" className="text-lg font-semibold text-secondary-900 flex items-center gap-2">
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
                    <button className="btn-ghost min-h-[40px] px-4 animate-active" onClick={onCancel}>
                        Cancel
                    </button>
                    <button 
                        ref={confirmButtonRef}
                        className="btn-primary min-h-[40px] px-4" 
                        onClick={onConfirm}
                    >
                        ✅ Confirm & Create
                    </button>
                </div>
            </div>
        </div>
    );
}
