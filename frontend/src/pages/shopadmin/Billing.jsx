import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../lib/apiClient";
import ProductSelector from "../../components/ProductSelector";
import SearchableDropdown from "../../components/SearchableDropdown";
import SignaturePad from "../../components/SignaturePad";
import BillSummary from "../../components/BillSummary";
import { Link, useNavigate } from "react-router-dom";
import BillConfirmModal from "../../components/BillConfirmModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showWarning, showError } from "../../lib/toast";

export default function Billing() {
  const [tab, setTab] = useState("create"); // "create" | "history"
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

  const selectedFarmer = farmers.find(f => f._id === farmerId);

  const submit = () => {
    if (!farmerId) return showWarning("Please select a farmer");
    if (selectedFarmer && !selectedFarmer.active) {
      return showError("This farmer is inactive due to pending dues. Please clear their payments in the Ledger first.");
    }
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
      {/* ── Page Header with Tabs ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🧾 Billing</h1>
          <p className="text-sm text-secondary-400 mt-1">
            {tab === "create"
              ? <>Select farmer → Add items → Payment → Sign &nbsp;<kbd className="px-1.5 py-0.5 text-xs bg-surface-200 rounded border border-surface-300 font-mono">Enter</kbd> on Qty adds new item</>              : "View and manage all past bills"}
          </p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-100 rounded-xl w-fit">
        {[
          { key: "create",  label: "➕ Create Bill" },
          { key: "history", label: "📋 Bills History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t.key
                ? "bg-white text-secondary-800 shadow-sm"
                : "text-secondary-500 hover:text-secondary-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CREATE TAB ── */}
      {tab === "create" && (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Bill Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Farmer Selection */}
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-800 mb-3">👨‍🌾 Select Farmer</h3>
              <SearchableDropdown
                options={farmers}
                value={farmerId}
                onChange={setFarmerId}
                placeholder="👨‍🌾 Choose a farmer..."
                valueKey="_id"
                labelKey="name"
                renderLabel={(f) =>
                  `${f.name}${f.village ? ` (${f.village})` : ''}${!f.active ? ' 🔴 Inactive' : ''}`
                }
                autoFocus
              />

              {/* Pending Dues Note */}
              {selectedFarmer && selectedFarmer.pendingDues > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800 flex items-start gap-2">
                  <span className="text-lg">ℹ️</span>
                  <div>
                    <p><strong>Note:</strong> This farmer has a pending balance of <strong>₹{selectedFarmer.pendingDues.toLocaleString()}</strong>.</p>
                    <p className="text-xs text-orange-600 mt-1">Check the Ledger to view details or clear their payments.</p>
                  </div>
                </div>
              )}

              {/* Credit Limit Warning */}
              {selectedFarmer && selectedFarmer.creditLimit > 0 && (
                <div className={`mt-3 p-3 rounded-lg text-sm flex items-start gap-2 ${
                  selectedFarmer.pendingDues >= selectedFarmer.creditLimit
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : selectedFarmer.pendingDues >= selectedFarmer.creditLimit * 0.8
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                  <span className="text-lg">
                    {selectedFarmer.pendingDues >= selectedFarmer.creditLimit ? '🚫' :
                     selectedFarmer.pendingDues >= selectedFarmer.creditLimit * 0.8 ? '⚠️' : '💳'}
                  </span>
                  <div>
                    <p><strong>Credit Limit: ₹{selectedFarmer.creditLimit.toLocaleString()}</strong></p>
                    <p className="text-xs mt-0.5">
                      Used: ₹{(selectedFarmer.pendingDues || 0).toLocaleString()} /
                      Remaining: ₹{Math.max(0, selectedFarmer.creditLimit - (selectedFarmer.pendingDues || 0)).toLocaleString()}
                      {selectedFarmer.pendingDues >= selectedFarmer.creditLimit && ' — Billing blocked until dues are cleared.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Inactive Farmer Warning */}
              {selectedFarmer && !selectedFarmer.active && (
                <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
                  <span>⚠️</span>
                  <span><strong>{selectedFarmer.name}</strong> is inactive due to pending dues. Clear payments in the Ledger before creating a new bill.</span>
                </div>
              )}
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
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); addItem(); }
                            }}
                            onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })}
                            placeholder="Qty"
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
                  <SearchableDropdown
                    options={[
                      { _id: 'cash',    name: '💵 Cash (Full)' },
                      { _id: 'online',  name: '📱 Online (Full)' },
                      { _id: 'partial', name: '⚡ Partial Payment' },
                      { _id: 'pending', name: '⏳ Pending / Due' },
                    ]}
                    value={paymentType}
                    onChange={setPaymentType}
                    placeholder="Select payment type"
                    valueKey="_id"
                    labelKey="name"
                  />
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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); }
                      }}
                    />
                    {Number(paidAmount) < grandTotal && Number(paidAmount) > 0 && (
                      <p className="text-xs text-accent-600 mt-1">
                        ⚡ Remaining: ₹{(grandTotal - Number(paidAmount)).toFixed(2)}
                      </p>
                    )}
                    {Number(paidAmount) > grandTotal && (
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Change: ₹{(Number(paidAmount) - grandTotal).toFixed(2)}
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
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && <BillsHistory />}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Bills History Component
───────────────────────────────────────────────── */
function BillsHistory() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["bills-list"],
    queryFn: () => api.get("/billing").then((r) => r.data.bills),
  });

  const statusColors = {
    paid:    "bg-green-100 text-green-700",
    partial: "bg-yellow-100 text-yellow-700",
    unpaid:  "bg-red-100 text-red-600",
  };
  const statusLabels = {
    paid:    "✅ Paid",
    partial: "⚡ Partial",
    unpaid:  "⏳ Unpaid",
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;
    if (statusFilter !== "all") list = list.filter((b) => b.paymentStatus === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.billNo.toLowerCase().includes(q) ||
          (b.farmerId?.name || "").toLowerCase().includes(q) ||
          (b.farmerId?.village || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, statusFilter]);

  const stats = useMemo(() => {
    if (!data) return {};
    return {
      total:   data.length,
      paid:    data.filter((b) => b.paymentStatus === "paid").length,
      partial: data.filter((b) => b.paymentStatus === "partial").length,
      unpaid:  data.filter((b) => b.paymentStatus === "unpaid").length,
    };
  }, [data]);

  if (isLoading)
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
        </div>
        <div className="h-64 skeleton rounded-xl" />
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🧾</div>
        <div className="empty-state-title">No bills yet</div>
        <div className="empty-state-message">Create your first bill using the "Create Bill" tab above.</div>
      </div>
    );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Bills",  value: stats.total,   cls: "" },
          { label: "Fully Paid",   value: stats.paid,    cls: "text-green-600" },
          { label: "Partial",      value: stats.partial, cls: "text-yellow-600" },
          { label: "Unpaid / Due", value: stats.unpaid,  cls: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="card-body py-4 text-center">
              <p className="text-xs text-secondary-400 uppercase font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.cls || "text-secondary-800"}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M13 13l3 3" />
          </svg>
          <input
            type="text"
            className="input pl-9"
            placeholder="Search by bill #, farmer name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {[
          { key: "all",     label: `All (${stats.total})` },
          { key: "paid",    label: `✅ Paid (${stats.paid})` },
          { key: "partial", label: `⚡ Partial (${stats.partial})` },
          { key: "unpaid",  label: `⏳ Unpaid (${stats.unpaid})` },
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setStatusFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              statusFilter === chip.key
                ? "bg-primary-500 text-white"
                : "bg-surface-100 text-secondary-600 hover:bg-surface-200"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No matches</div>
          <div className="empty-state-message">Try a different search or filter.</div>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Bill #</th>
                <th>Date</th>
                <th>Farmer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => (
                <tr key={bill._id} className={bill.paymentStatus === "unpaid" ? "bg-red-50/30" : ""}>
                  <td className="font-mono font-semibold text-primary-700 text-sm">
                    #{bill.billNo}
                  </td>
                  <td className="text-xs text-secondary-500">
                    {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-secondary-800">{bill.farmerId?.name || "—"}</p>
                      {bill.farmerId?.village && (
                        <p className="text-xs text-secondary-400">{bill.farmerId.village}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-secondary-500 text-sm">
                    {(bill.items || []).length} item{bill.items?.length !== 1 ? "s" : ""}
                  </td>
                  <td className="font-semibold">₹{(bill.totalAmount || 0).toLocaleString()}</td>
                  <td className="text-green-600 font-medium">
                    {bill.amountPaid > 0 ? `₹${bill.amountPaid.toLocaleString()}` : "—"}
                  </td>
                  <td className={bill.balanceDue > 0 ? "text-red-600 font-semibold" : "text-secondary-400"}>
                    {bill.balanceDue > 0 ? `₹${bill.balanceDue.toLocaleString()}` : "—"}
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[bill.paymentStatus] || ""}` }>
                      {statusLabels[bill.paymentStatus] || bill.paymentStatus}
                    </span>
                    {bill.isEdited && (
                      <span className="ml-1 text-xs text-yellow-600 bg-yellow-50 px-1.5 rounded">Edited</span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/shop/invoice/${bill._id}`}
                        className="btn btn-sm btn-ghost text-primary-600 hover:bg-primary-50"
                      >
                        👁️ Invoice
                      </Link>
                      {bill.paymentStatus !== "paid" && (
                        <Link
                          to={`/shop/billing/${bill._id}/payments`}
                          className="btn btn-sm btn-ghost text-green-600 hover:bg-green-50"
                        >
                          💳 Pay
                        </Link>
                      )}
                      {!bill.creditNoteId && (
                        <Link
                          to={`/shop/billing/${bill._id}/credit-note`}
                          className="btn btn-sm btn-ghost text-orange-600 hover:bg-orange-50"
                        >
                          🔄 Return
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}