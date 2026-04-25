import React, { useEffect, useRef, useState } from "react";
import api from "../../lib/apiClient";
import ProductSelector from "../../components/ProductSelector";
import SignaturePad from "../../components/SignaturePad";
import BillSummary from "../../components/BillSummary";
import { useNavigate } from "react-router-dom";
import BillConfirmModal from "../../components/BillConfirmModal";
import { useQueryClient } from "@tanstack/react-query";
import { showWarning, showError } from "../../lib/toast";

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [farmerId, setFarmerId] = useState("");
  const [items, setItems] = useState([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);

  const sigRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          api.get("/products"),
          api.get("/farmers"),
        ]);
        setProducts(pRes.data.products || []);
        setFarmers(fRes.data.farmers || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // Auto-calculate totals
  const subTotal = items.reduce((sum, it) => sum + (Number(it.qty) * Number(it.unitPrice) || 0), 0);
  const gstTotal = items.reduce((sum, it) => sum + ((Number(it.qty) * Number(it.unitPrice) || 0) * (Number(it.gstPercent) || 0)) / 100, 0);
  const grandTotal = subTotal + gstTotal;

  // Auto-fill paid amount when payment type changes
  useEffect(() => {
    if (paymentType !== "pending") {
      setPaidAmount(grandTotal);
    } else {
      setPaidAmount(0);
    }
  }, [paymentType, grandTotal]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", qty: 1, unitPrice: 0, gstPercent: 0 },
    ]);
  };

  // Keyboard shortcut: Enter on qty field adds new item
  const handleQtyKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  const updateItem = (idx, data) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...data } : it))
    );
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const onProductChange = (idx, productId) => {
    const p = products.find((x) => x._id === productId);
    updateItem(idx, {
      productId,
      unitPrice: p?.price || 0,
      gstPercent: p?.gstPercent || 0,
    });
  };

  const submit = () => {
    if (!farmerId) return showWarning("Please select a farmer");
    if (items.length === 0) return showWarning("Please add at least one item");
    if (items.some(it => !it.productId)) return showWarning("Please select a product for all items");

    const sig = sigRef.current?.getDataURL();
    if (!sig) return showWarning("Please sign before creating bill");

    setShowConfirm(true);
  };

  const confirmCreateBill = async () => {
    try {
      const signatureBase64 = sigRef.current?.getDataURL();

      const payload = {
        farmerId,
        items: items.map((it) => ({
          productId: it.productId,
          qty: Number(it.qty),
          unitPrice: Number(it.unitPrice),
        })),
        paymentType,
        paidAmount: paymentType === "pending" ? 0 : Number(paidAmount),
        signatureBase64,
      };

      const res = await api.post("/billing", payload);

      await queryClient.invalidateQueries({ queryKey: ["shop-sales"] });
      await queryClient.invalidateQueries({ queryKey: ["top-farmers"] });
      await queryClient.invalidateQueries({ queryKey: ["low-stock"] });

      navigate(`/shop/invoice/${res.data.bill._id}`);
    } catch (err) {
      showError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Bill</h1>
          <p className="text-sm text-secondary-400 mt-1">Generate a new invoice for a farmer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Bill Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Farmer Selection */}
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-800 mb-3">👨‍🌾 Select Farmer</h3>
              <select
                className="select"
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
              >
                <option value="">Choose a farmer...</option>
                {farmers.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.name} {f.village ? `(${f.village})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-800">📦 Items</h3>
                <button onClick={addItem} className="btn-outline btn-sm">
                  ➕ Add Item
                </button>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-8 text-secondary-400">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm">No items added yet. Click "Add Item" to start.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((it, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-surface-200 bg-surface-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-secondary-400 uppercase">Item #{idx + 1}</span>
                        <button
                          onClick={() => removeItem(idx)}
                          className="btn btn-sm text-red-500 hover:bg-red-50 hover:text-red-700 px-2"
                        >
                          ✕ Remove
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="label">Product</label>
                          <ProductSelector
                            products={products}
                            value={it.productId}
                            onChange={(v) => onProductChange(idx, v)}
                          />
                        </div>
                        <div>
                          <label className="label">Qty</label>
                          <input
                            type="number"
                            min="1"
                            className="input"
                            value={it.qty}
                            onKeyDown={handleQtyKeyDown}
                            onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      {it.productId && (
                        <div className="flex items-center gap-4 text-xs text-secondary-500 bg-white rounded-lg px-3 py-2 border border-surface-200">
                          <span>₹{it.unitPrice}/{products.find(p => p._id === it.productId)?.unit || 'unit'}</span>
                          <span>GST: {it.gstPercent}%</span>
                          <span className="ml-auto font-semibold text-primary-700">
                            Line Total: ₹{((it.qty * it.unitPrice) + (it.qty * it.unitPrice * it.gstPercent / 100)).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-800 mb-3">💳 Payment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Payment Type</label>
                  <select
                    className="select"
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="online">📱 Online</option>
                    <option value="pending">⏳ Pending</option>
                  </select>
                </div>

                {paymentType !== "pending" && (
                  <div>
                    <label className="label">Paid Amount (₹)</label>
                    <input
                      type="number"
                      className="input"
                      placeholder="Enter paid amount"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                    />
                    {Number(paidAmount) < grandTotal && Number(paidAmount) > 0 && (
                      <p className="text-xs text-accent-600 mt-1">
                        Remaining: ₹{(grandTotal - Number(paidAmount)).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-800 mb-3">✍️ Signature</h3>
              <SignaturePad ref={sigRef} />
            </div>
          </div>

          {/* Submit */}
          <button onClick={submit} className="btn-primary btn-lg w-full">
            🧾 Review & Create Bill
          </button>
        </div>

        {/* Right — Summary (sticky) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-8">
            <BillSummary items={items} grandTotal={grandTotal} subTotal={subTotal} gstTotal={gstTotal} />
          </div>
        </div>
      </div>

      <BillConfirmModal
        open={showConfirm}
        farmer={farmers.find((f) => f._id === farmerId)}
        items={items}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmCreateBill}
      />
    </div>
  );
}