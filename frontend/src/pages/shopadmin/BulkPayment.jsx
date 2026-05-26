import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";
import SearchableDropdown from "../../components/SearchableDropdown";

export default function BulkPayment() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(new Set());
  const [method, setMethod] = useState("cash");
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [farmerFilter, setFarmerFilter] = useState("");

  // Load all unpaid/partial bills
  const { data: bills, isLoading } = useQuery({
    queryKey: ["bills-unpaid"],
    queryFn: () =>
      api
        .get("/billing?status=unpaid&limit=200")
        .then((r) => r.data.bills)
        .then((allBills) =>
          // Client filter: unpaid + partial only
          (allBills || []).filter((b) =>
            ["unpaid", "partial"].includes(b.paymentStatus)
          )
        ),
  });

  // Load farmers for filter dropdown
  const { data: farmersData } = useQuery({
    queryKey: ["farmers"],
    queryFn: () => api.get("/farmers").then((r) => r.data.farmers),
  });

  const farmers = farmersData || [];

  // Filtered bills
  const filtered = useMemo(() => {
    if (!bills) return [];
    let list = bills;
    if (farmerFilter) list = list.filter((b) => b.farmerId?._id === farmerFilter);
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (b) =>
          b.billNo?.toLowerCase().includes(q) ||
          (b.farmerId?.name || "").toLowerCase().includes(q)
      );
    return list;
  }, [bills, search, farmerFilter]);

  const totalSelected = useMemo(() => {
    return filtered
      .filter((b) => selected.has(b._id))
      .reduce((s, b) => s + (b.balanceDue || b.totalAmount), 0);
  }, [filtered, selected]);

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((b) => b._id)));
    }
  };

  const toggleOne = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleBulkPay = async () => {
    if (selected.size === 0) return showError("Select at least one bill");
    setProcessing(true);
    try {
      const res = await api.post("/billing/bulk-pay", {
        billIds: [...selected],
        method,
        note: "Bulk payment",
      });
      showSuccess(res.data.message || `${selected.size} bills marked as paid`);
      setSelected(new Set());
      queryClient.invalidateQueries({ queryKey: ["bills-unpaid"] });
      queryClient.invalidateQueries({ queryKey: ["bills-list"] });
      queryClient.invalidateQueries({ queryKey: ["outstanding-dues"] });
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
    } catch (err) {
      showError(err.response?.data?.error || err.message);
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (b) =>
    b.paymentStatus === "partial"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-600";

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Bulk Payment</h1>
          <p className="text-sm text-secondary-400 mt-1">
            Select multiple unpaid bills and mark them all as paid at once
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            {/* Search */}
            <div>
              <label className="label">Search Bills</label>
              <input
                type="text"
                className="input"
                placeholder="Bill # or farmer name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Farmer filter */}
            <div>
              <label className="label">Filter by Farmer</label>
              <SearchableDropdown
                options={[{ _id: "", name: "All Farmers" }, ...farmers]}
                value={farmerFilter}
                onChange={setFarmerFilter}
                placeholder="All farmers"
                valueKey="_id"
                labelKey="name"
              />
            </div>

            {/* Payment method */}
            <div>
              <label className="label">Payment Method</label>
              <SearchableDropdown
                options={[
                  { _id: "cash",   name: "💵 Cash" },
                  { _id: "online", name: "📱 Online / UPI" },
                  { _id: "card",   name: "💳 Card" },
                ]}
                value={method}
                onChange={setMethod}
                placeholder="Select method"
                valueKey="_id"
                labelKey="name"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {selected.size > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-between gap-4 animate-fade-in">
          <div>
            <p className="font-semibold text-primary-800">
              {selected.size} bill{selected.size !== 1 ? "s" : ""} selected
            </p>
            <p className="text-sm text-primary-600">
              Total to collect: <strong>₹{totalSelected.toLocaleString()}</strong>
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={handleBulkPay}
            disabled={processing}
          >
            {processing
              ? "Processing…"
              : `✅ Mark ${selected.size} Bill${selected.size !== 1 ? "s" : ""} as Paid`}
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 skeleton rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎉</div>
          <div className="empty-state-title">No unpaid bills!</div>
          <div className="empty-state-message">
            All bills are fully paid. Great work!
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <table className="table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
                    />
                  </th>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Farmer</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill) => (
                  <tr
                    key={bill._id}
                    className={`cursor-pointer transition-colors ${
                      selected.has(bill._id) ? "bg-primary-50" : "hover:bg-surface-50"
                    }`}
                    onClick={() => toggleOne(bill._id)}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(bill._id)}
                        onChange={() => toggleOne(bill._id)}
                        className="w-4 h-4 rounded accent-primary-500 cursor-pointer"
                      />
                    </td>
                    <td className="font-mono font-semibold text-primary-700 text-sm">
                      #{bill.billNo}
                    </td>
                    <td className="text-xs text-secondary-500">
                      {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <p className="font-medium text-secondary-800">
                        {bill.farmerId?.name || "—"}
                      </p>
                      {bill.farmerId?.village && (
                        <p className="text-xs text-secondary-400">
                          {bill.farmerId.village}
                        </p>
                      )}
                    </td>
                    <td className="font-semibold">
                      ₹{(bill.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="text-green-600">
                      {bill.amountPaid > 0
                        ? `₹${bill.amountPaid.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="font-bold text-red-600">
                      ₹{(bill.balanceDue || bill.totalAmount || 0).toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusBadge(bill)}`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
