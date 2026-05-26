import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";
import SearchableDropdown from "../../components/SearchableDropdown";

export default function BillPayments() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: billData, isLoading: billLoading } = useQuery({
    queryKey: ["bill", id],
    queryFn: () => api.get(`/billing/${id}`).then((r) => r.data.bill),
  });

  const { data: paymentsData, isLoading: pmtLoading } = useQuery({
    queryKey: ["bill-payments", id],
    queryFn: () => api.get(`/billing/${id}/payments`).then((r) => r.data.payments),
  });

  const addPayment = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return showError("Enter a valid amount");
    if (amt > (billData?.balanceDue || 0)) {
      return showError(`Amount exceeds balance due ₹${billData.balanceDue.toLocaleString()}`);
    }
    setSubmitting(true);
    try {
      await api.post(`/billing/${id}/payments`, { amount: amt, method, note });
      showSuccess(`₹${amt.toLocaleString()} payment recorded`);
      setAmount("");
      setNote("");
      queryClient.invalidateQueries(["bill", id]);
      queryClient.invalidateQueries(["bill-payments", id]);
      queryClient.invalidateQueries(["farmers"]);
    } catch (err) {
      showError(err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const bill = billData;

  const statusColor = {
    paid: "bg-green-100 text-green-700",
    partial: "bg-yellow-100 text-yellow-700",
    unpaid: "bg-red-100 text-red-700",
  };

  if (billLoading) return <div className="p-6 text-center text-secondary-400">Loading bill…</div>;
  if (!bill) return <div className="p-6 text-center text-red-500">Bill not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">💳 Payments — Bill #{bill.billNo}</h1>
          <p className="text-sm text-secondary-400 mt-1">
            Farmer: <strong>{bill.farmerId?.name}</strong>
            {bill.farmerId?.village && ` · ${bill.farmerId.village}`}
          </p>
        </div>
        <Link to="/shop/billing" className="btn-ghost">← Back to Billing</Link>
      </div>

      {/* Bill Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Bill Total", value: `₹${bill.totalAmount?.toLocaleString()}`, color: "text-secondary-800" },
          { label: "Amount Paid", value: `₹${bill.amountPaid?.toLocaleString()}`, color: "text-green-600" },
          { label: "Balance Due", value: `₹${bill.balanceDue?.toLocaleString()}`, color: bill.balanceDue > 0 ? "text-red-600" : "text-green-600" },
          {
            label: "Status",
            value: (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColor[bill.paymentStatus] || ""}`}>
                {bill.paymentStatus}
              </span>
            ),
          },
        ].map((s) => (
          <div key={s.label} className="card">
            <div className="card-body py-4">
              <p className="text-xs text-secondary-400 uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color || ""}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Payment Form */}
        {bill.paymentStatus !== "paid" && (
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-body">
                <h3 className="font-semibold text-secondary-800 mb-4">➕ Add Payment</h3>
                <form onSubmit={addPayment} className="space-y-4">
                  <div>
                    <label className="label">Amount (₹)</label>
                    <input
                      type="number"
                      min="1"
                      max={bill.balanceDue}
                      className="input"
                      placeholder={`Max ₹${bill.balanceDue?.toLocaleString()}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      autoFocus
                    />
                  </div>

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

                  <div>
                    <label className="label">Note (optional)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Paid by son"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full" disabled={submitting}>
                    {submitting ? "Recording…" : "✅ Record Payment"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className={bill.paymentStatus !== "paid" ? "lg:col-span-3" : "lg:col-span-5"}>
          <div className="card">
            <div className="card-body">
              <h3 className="font-semibold text-secondary-800 mb-4">📋 Payment History</h3>

              {pmtLoading ? (
                <div className="text-center py-8 text-secondary-400">Loading…</div>
              ) : !paymentsData || paymentsData.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💸</div>
                  <div className="empty-state-title">No payments recorded</div>
                  <div className="empty-state-message">Payments will appear here once recorded.</div>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsData.map((p, i) => (
                        <tr key={p._id}>
                          <td className="text-secondary-400 text-xs">{i + 1}</td>
                          <td className="text-xs">{new Date(p.createdAt).toLocaleString("en-IN")}</td>
                          <td className="font-semibold text-green-600">₹{p.amount.toLocaleString()}</td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-xs bg-surface-100 capitalize">
                              {p.method}
                            </span>
                          </td>
                          <td className="text-xs text-secondary-400">{p.note || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
