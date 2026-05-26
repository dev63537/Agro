import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";

export default function IssueCreditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnItems, setReturnItems] = useState([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: bill, isLoading } = useQuery({
    queryKey: ["bill", id],
    queryFn: () => api.get(`/billing/${id}`).then((r) => r.data.bill),
  });

  // ✅ FIX: useEffect instead of onSuccess (removed in React Query v5)
  useEffect(() => {
    if (bill?.items) {
      setReturnItems(
        bill.items.map((it) => ({
          productId: it.productId,
          name: it.name,
          maxQty: it.qty,
          unitPrice: it.unitPrice,
          gstPercent: it.gstPercent,
          returnQty: 0,
        }))
      );
    }
  }, [bill]);

  const updateQty = (idx, qty) => {
    setReturnItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, returnQty: Math.min(Math.max(0, Number(qty)), it.maxQty) } : it
      )
    );
  };

  const selected = returnItems.filter((it) => it.returnQty > 0);

  const previewTotal = selected.reduce((sum, it) => {
    const lineTotal = it.returnQty * it.unitPrice;
    return sum + lineTotal + (lineTotal * it.gstPercent) / 100;
  }, 0);

  const submit = async () => {
    if (selected.length === 0) return showError("Select at least one item to return");
    setSubmitting(true);
    try {
      await api.post(`/billing/${id}/credit-note`, {
        items: selected.map((it) => ({ productId: it.productId, qty: it.returnQty })),
        reason,
      });
      showSuccess("Credit note issued successfully");
      navigate(`/shop/returns`);
    } catch (err) {
      showError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-8 w-64 skeleton rounded" />
        <div className="h-48 skeleton rounded-xl" />
      </div>
    );

  if (!bill)
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📄</div>
        <div className="empty-state-title">Bill not found</div>
        <Link to="/shop/billing" className="btn-primary">← Back to Billing</Link>
      </div>
    );

  if (bill.creditNoteId) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">🔄 Return Items</h1>
          <Link to="/shop/returns" className="btn-ghost">← View All Returns</Link>
        </div>
        <div className="card max-w-lg">
          <div className="card-body text-center py-10">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-lg font-semibold text-secondary-700">Credit Note Already Issued</p>
            <p className="text-sm text-secondary-400 mt-1">
              A return has already been processed for Bill <strong>#{bill.billNo}</strong>.
            </p>
            <div className="flex gap-3 justify-center mt-4">
              <Link to="/shop/returns" className="btn-primary">View Returns</Link>
              <Link to={`/shop/invoice/${id}`} className="btn-ghost">View Invoice</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">🔄 Return Items — Bill #{bill.billNo}</h1>
          <p className="text-sm text-secondary-400 mt-1">
            Farmer: <strong>{bill.farmerId?.name}</strong>
            {bill.farmerId?.village && ` · ${bill.farmerId.village}`}
            {" · "}Original Total: <strong>₹{bill.totalAmount?.toLocaleString()}</strong>
          </p>
        </div>
        <Link to={`/shop/invoice/${id}`} className="btn-ghost">← Back to Invoice</Link>
      </div>

      {/* How it works banner */}
      <div className="mb-5 p-4 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-3">
        <span className="text-2xl">ℹ️</span>
        <div className="text-sm text-blue-700">
          <p className="font-semibold mb-1">How returns work:</p>
          <p>Enter the quantity to return for each item → Stock is added back automatically → Farmer's balance is reduced.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item selection */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-800 mb-1">📦 Select Items to Return</h3>
              <p className="text-xs text-secondary-400 mb-4">
                Set return quantity for each item. Leave at <strong>0</strong> to keep it.
              </p>

              {returnItems.length === 0 ? (
                <div className="text-center py-8 text-secondary-400">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm">No items found on this bill.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {returnItems.map((it, idx) => (
                    <div
                      key={`${it.productId}-${idx}`}
                      className={`p-4 rounded-xl border-2 transition-all duration-150 ${
                        it.returnQty > 0
                          ? "border-orange-300 bg-orange-50"
                          : "border-surface-200 bg-surface-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-secondary-800 truncate">{it.name}</p>
                          <p className="text-xs text-secondary-400 mt-0.5">
                            ₹{it.unitPrice} / unit · GST {it.gstPercent}% · Billed qty:{" "}
                            <strong>{it.maxQty}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-lg border border-surface-300 bg-white text-secondary-600 hover:bg-surface-100 font-bold transition-colors"
                            onClick={() => updateQty(idx, it.returnQty - 1)}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            max={it.maxQty}
                            className="input w-16 text-center font-semibold"
                            value={it.returnQty}
                            onChange={(e) => updateQty(idx, e.target.value)}
                          />
                          <button
                            type="button"
                            className="w-8 h-8 rounded-lg border border-surface-300 bg-white text-secondary-600 hover:bg-surface-100 font-bold transition-colors"
                            onClick={() => updateQty(idx, it.returnQty + 1)}
                          >
                            +
                          </button>
                          <span className="text-xs text-secondary-400 w-14">
                            of {it.maxQty}
                          </span>
                        </div>
                      </div>
                      {it.returnQty > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-orange-600 font-semibold bg-orange-100 px-2 py-0.5 rounded-full">
                            Return value: ₹
                            {(
                              it.returnQty * it.unitPrice +
                              (it.returnQty * it.unitPrice * it.gstPercent) / 100
                            ).toFixed(2)}
                          </span>
                          <button
                            className="text-xs text-secondary-400 hover:text-red-500 transition-colors"
                            onClick={() => updateQty(idx, 0)}
                          >
                            ✕ Clear
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5">
                <label className="label">Reason for Return</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="e.g. Damaged goods, wrong product delivered, customer changed mind…"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview sidebar */}
        <div>
          <div className="card lg:sticky lg:top-8">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-800 mb-4">📋 Return Preview</h3>

              {selected.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">👆</p>
                  <p className="text-sm text-secondary-400">
                    Set a quantity &gt; 0 on any item to preview the return
                  </p>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {selected.map((it) => (
                    <div key={it.productId} className="flex justify-between text-sm">
                      <span className="text-secondary-600 truncate flex-1">
                        {it.name} × {it.returnQty}
                      </span>
                      <span className="font-semibold text-orange-600 ml-2">
                        ₹
                        {(
                          it.returnQty * it.unitPrice +
                          (it.returnQty * it.unitPrice * it.gstPercent) / 100
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-surface-200 pt-2 flex justify-between font-bold text-lg">
                    <span className="text-secondary-700">Credit Total</span>
                    <span className="text-orange-600">₹{previewTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {reason && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                  <strong>Reason:</strong> {reason}
                </div>
              )}

              <div className="space-y-1.5 text-xs bg-green-50 border border-green-100 rounded-xl p-3 mb-4">
                <p className="text-green-700">✅ Stock restored to inventory automatically</p>
                <p className="text-green-700">✅ Farmer's balance reduced by credit amount</p>
                <p className="text-orange-600 font-medium">⚠️ Only one return per bill allowed</p>
              </div>

              <button
                className="btn-primary w-full"
                onClick={submit}
                disabled={submitting || selected.length === 0}
              >
                {submitting ? "Processing…" : `🔄 Confirm Return (₹${previewTotal.toFixed(2)})`}
              </button>

              {selected.length === 0 && (
                <p className="text-center text-xs text-secondary-400 mt-2">
                  Select items above to enable
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
