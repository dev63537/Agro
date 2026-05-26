import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";
import SearchableDropdown from "../../components/SearchableDropdown";
import { useAuth } from "../../hooks/useAuth";

export default function FarmerStatement() {
  const { user } = useAuth();
  const [farmerId, setFarmerId] = useState("");

  const shopName = user?.shop?.name || "Agro Shop";

  const { data: farmers } = useQuery({
    queryKey: ["farmers"],
    queryFn: () => api.get("/farmers").then((r) => r.data.farmers),
  });

  const {
    data: statement,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["farmer-statement", farmerId],
    queryFn: () =>
      api
        .get(`/reports/farmer-statement/${farmerId}`)
        .then((r) => r.data),
    enabled: !!farmerId,
  });

  const handlePrint = () => window.print();

  const farmer = statement?.farmer;
  const bills = statement?.bills || [];
  const summary = statement?.summary || {};

  return (
    <div>
      {/* Header (hidden on print) */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">📄 Farmer Statement</h1>
          <p className="text-sm text-secondary-400 mt-1">
            Full purchase + payment history for any farmer — print or share
          </p>
        </div>
        {statement && (
          <button onClick={handlePrint} className="btn-primary">
            🖨️ Print Statement
          </button>
        )}
      </div>

      {/* Farmer selector (hidden on print) */}
      <div className="card mb-6 no-print">
        <div className="card-body">
          <label className="label">Select Farmer</label>
          <div className="max-w-sm">
            <SearchableDropdown
              options={farmers || []}
              value={farmerId}
              onChange={setFarmerId}
              placeholder="Search and select a farmer…"
              valueKey="_id"
              labelKey="name"
              renderLabel={(f) =>
                `${f.farmerCode ? `[${f.farmerCode}] ` : ""}${f.name}${
                  f.village ? ` (${f.village})` : ""
                }`
              }
            />
          </div>
        </div>
      </div>

      {!farmerId && (
        <div className="empty-state">
          <div className="empty-state-icon">👨‍🌾</div>
          <div className="empty-state-title">Select a Farmer</div>
          <div className="empty-state-message">
            Choose a farmer above to generate their full statement
          </div>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          <div className="h-32 skeleton rounded-xl" />
          <div className="h-64 skeleton rounded-xl" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          Failed to load statement. Please try again.
        </div>
      )}

      {/* ─── STATEMENT (visible always, printable) ─── */}
      {statement && farmer && (
        <div className="statement-container max-w-4xl mx-auto">
          {/* Print header */}
          <div className="card mb-5">
            <div className="card-body p-8">
              {/* Shop + Statement title */}
              <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-primary-500">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl shadow-md">
                    🌾
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900">
                      {shopName}
                    </h2>
                    <p className="text-sm text-secondary-400">Agro Billing System</p>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-2xl font-bold text-primary-700">
                    FARMER STATEMENT
                  </h3>
                  <p className="text-sm text-secondary-500 mt-1">
                    Generated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              {/* Farmer info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">
                    Farmer
                  </p>
                  <p className="text-lg font-bold text-secondary-900">{farmer.name}</p>
                  {farmer.farmerCode && (
                    <p className="text-sm text-secondary-500">Code: {farmer.farmerCode}</p>
                  )}
                  {farmer.village && (
                    <p className="text-sm text-secondary-500">Village: {farmer.village}</p>
                  )}
                  {farmer.phone && (
                    <p className="text-sm text-secondary-500">📞 {farmer.phone}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Total Billed", value: `₹${summary.totalBilled?.toLocaleString() || 0}`, cls: "text-secondary-800" },
                    { label: "Total Bills",  value: summary.billCount || 0,                           cls: "text-blue-600" },
                    { label: "Total Paid",   value: `₹${summary.totalPaid?.toLocaleString() || 0}`,  cls: "text-green-600" },
                    { label: "Outstanding",  value: `₹${summary.totalDue?.toLocaleString() || 0}`,   cls: summary.totalDue > 0 ? "text-red-600" : "text-green-600" },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-secondary-400 mb-1">{s.label}</p>
                      <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bills table */}
              <h3 className="font-semibold text-secondary-700 mb-3 flex items-center gap-2">
                🧾 Bill History
              </h3>
              <div className="table-container mb-8">
                <table className="table">
                  <thead>
                    <tr className="bg-primary-50">
                      <th className="text-primary-800">#</th>
                      <th className="text-primary-800">Bill No</th>
                      <th className="text-primary-800">Date</th>
                      <th className="text-primary-800">Items</th>
                      <th className="text-primary-800 text-right">Total</th>
                      <th className="text-primary-800 text-right">Paid</th>
                      <th className="text-primary-800 text-right">Balance</th>
                      <th className="text-primary-800">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center text-secondary-400 py-6">
                          No bills found
                        </td>
                      </tr>
                    ) : (
                      bills.map((bill, i) => (
                        <tr key={bill._id}>
                          <td className="text-secondary-400 text-xs">{i + 1}</td>
                          <td className="font-mono font-semibold text-primary-700">
                            #{bill.billNo}
                          </td>
                          <td className="text-xs text-secondary-500">
                            {new Date(bill.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td className="text-xs text-secondary-500">
                            {(bill.items || []).length} item{bill.items?.length !== 1 ? "s" : ""}
                          </td>
                          <td className="text-right font-semibold">
                            ₹{(bill.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="text-right text-green-600">
                            {bill.amountPaid > 0
                              ? `₹${bill.amountPaid.toLocaleString()}`
                              : "—"}
                          </td>
                          <td
                            className={`text-right font-semibold ${
                              bill.balanceDue > 0 ? "text-red-600" : "text-secondary-300"
                            }`}
                          >
                            {bill.balanceDue > 0
                              ? `₹${bill.balanceDue.toLocaleString()}`
                              : "—"}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                bill.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : bill.paymentStatus === "partial"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {bill.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-surface-50 border-t-2 border-surface-200">
                    <tr>
                      <td colSpan={4} className="font-bold text-right text-secondary-700">
                        TOTALS
                      </td>
                      <td className="text-right font-bold text-secondary-800">
                        ₹{summary.totalBilled?.toLocaleString()}
                      </td>
                      <td className="text-right font-bold text-green-600">
                        ₹{summary.totalPaid?.toLocaleString()}
                      </td>
                      <td className={`text-right font-bold ${summary.totalDue > 0 ? "text-red-600" : "text-green-600"}`}>
                        ₹{summary.totalDue?.toLocaleString()}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-surface-200 text-center">
                <p className="text-xs text-secondary-400">
                  This is a computer-generated statement • {shopName}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
