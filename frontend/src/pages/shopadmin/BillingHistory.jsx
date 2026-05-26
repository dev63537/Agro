import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

/* ─────────────────────────────────────────────────────────────
   Billing History  — bills grouped by farmer
   Shows: farmer name, village, each bill's date, amount, status
───────────────────────────────────────────────────────────── */
export default function BillingHistory() {
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("all");
  const [expandedFarmers, setExp]   = useState(new Set()); // which farmers are open
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");

  // Fetch all bills (generous limit — history page)
  const { data, isLoading } = useQuery({
    queryKey: ["billing-history"],
    queryFn: () =>
      api.get("/billing?limit=500").then((r) => r.data.bills || []),
  });

  // ── Group bills by farmerId ──────────────────────────────
  const grouped = useMemo(() => {
    if (!data) return [];

    let bills = [...data];

    // Status filter
    if (statusFilter !== "all")
      bills = bills.filter((b) => b.paymentStatus === statusFilter);

    // Date range filter
    if (dateFrom)
      bills = bills.filter(
        (b) => new Date(b.createdAt) >= new Date(dateFrom)
      );
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      bills = bills.filter((b) => new Date(b.createdAt) <= to);
    }

    // Group by farmer
    const map = new Map();
    for (const bill of bills) {
      const fId   = bill.farmerId?._id || "unknown";
      const fName = bill.farmerId?.name || "Unknown Farmer";
      const fVil  = bill.farmerId?.village || "";
      const fPh   = bill.farmerId?.phone || "";

      if (!map.has(fId)) {
        map.set(fId, {
          farmerId: fId,
          farmerName: fName,
          village: fVil,
          phone: fPh,
          bills: [],
          totalBilled: 0,
          totalDue: 0,
        });
      }
      const grp = map.get(fId);
      grp.bills.push(bill);
      grp.totalBilled += bill.totalAmount || 0;
      grp.totalDue    += bill.balanceDue  || 0;
    }

    // Convert to sorted array — most recent activity first
    let list = [...map.values()].map((grp) => ({
      ...grp,
      bills: grp.bills.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      ),
      lastDate: grp.bills[0]?.createdAt,
    }));

    list.sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate));

    // Search filter on farmer name / village
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (g) =>
          g.farmerName.toLowerCase().includes(q) ||
          g.village.toLowerCase().includes(q) ||
          g.phone.includes(q)
      );

    return list;
  }, [data, search, statusFilter, dateFrom, dateTo]);

  // ── Summary stats ────────────────────────────────────────
  const stats = useMemo(() => {
    if (!data) return {};
    return {
      totalBills:    data.length,
      totalFarmers:  new Set(data.map((b) => b.farmerId?._id)).size,
      totalRevenue:  data.reduce((s, b) => s + b.totalAmount, 0),
      totalDue:      data.reduce((s, b) => s + (b.balanceDue || 0), 0),
    };
  }, [data]);

  const toggleFarmer = (id) => {
    setExp((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expandAll  = () => setExp(new Set(grouped.map((g) => g.farmerId)));
  const collapseAll = () => setExp(new Set());

  // ── Status helpers ───────────────────────────────────────
  const statusBadge = {
    paid:    "bg-green-100 text-green-700",
    partial: "bg-yellow-100 text-yellow-700",
    unpaid:  "bg-red-100   text-red-600",
  };
  const statusIcon = { paid: "✅", partial: "⚡", unpaid: "⏳" };

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  const fmtTime = (d) =>
    new Date(d).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit", hour12: true,
    });

  // ── Render ───────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Billing History</h1>
          <p className="text-sm text-secondary-400 mt-1">
            All bills grouped by farmer — with name, date, and payment status
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <button onClick={expandAll}   className="btn-ghost text-xs">⊕ Expand All</button>
          <button onClick={collapseAll} className="btn-ghost text-xs">⊖ Collapse All</button>
        </div>
      </div>

      {/* Stats bar */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-fade-in">
          {[
            { label: "Total Bills",    value: stats.totalBills,                                    color: "text-secondary-800" },
            { label: "Farmers",        value: stats.totalFarmers,                                  color: "text-blue-600" },
            { label: "Total Revenue",  value: `₹${(stats.totalRevenue || 0).toLocaleString()}`,    color: "text-green-600" },
            { label: "Outstanding",    value: `₹${(stats.totalDue     || 0).toLocaleString()}`,    color: stats.totalDue > 0 ? "text-red-600" : "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="card">
              <div className="card-body py-4 text-center">
                <p className="text-xs text-secondary-400 uppercase tracking-wider font-medium">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value ?? "—"}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-5">
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="label">Search Farmer</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none" viewBox="0 0 20 20" fill="none">
                  <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5" />
                  <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M13 13l3 3" />
                </svg>
                <input
                  type="text"
                  className="input pl-9"
                  placeholder="Name, village, phone…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="label">Payment Status</label>
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="paid">✅ Paid</option>
                <option value="partial">⚡ Partial</option>
                <option value="unpaid">⏳ Unpaid</option>
              </select>
            </div>

            {/* Date from */}
            <div>
              <label className="label">From Date</label>
              <input type="date" className="input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            {/* Date to */}
            <div>
              <label className="label">To Date</label>
              <input type="date" className="input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Active filter chips */}
          {(search || statusFilter !== "all" || dateFrom || dateTo) && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-surface-100">
              {search && (
                <span className="flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                  👤 "{search}" <button onClick={() => setSearch("")} className="ml-1 hover:text-red-500">✕</button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                  {statusIcon[statusFilter]} {statusFilter} <button onClick={() => setStatus("all")} className="ml-1 hover:text-red-500">✕</button>
                </span>
              )}
              {(dateFrom || dateTo) && (
                <span className="flex items-center gap-1 text-xs bg-primary-100 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                  📅 {dateFrom || "…"} → {dateTo || "…"} <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="ml-1 hover:text-red-500">✕</button>
                </span>
              )}
              <button
                onClick={() => { setSearch(""); setStatus("all"); setDateFrom(""); setDateTo(""); }}
                className="text-xs text-secondary-400 hover:text-red-500 underline transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-secondary-400 mb-4 px-1">
          Showing <strong>{grouped.length}</strong> farmer{grouped.length !== 1 ? "s" : ""} with{" "}
          <strong>{grouped.reduce((s, g) => s + g.bills.length, 0)}</strong> bill{grouped.reduce((s, g) => s + g.bills.length, 0) !== 1 ? "s" : ""}
        </p>
      )}

      {/* ── Loading ── */}
      {isLoading && (
        <div className="space-y-4 animate-fade-in">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 skeleton rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 skeleton rounded" />
                    <div className="h-3 w-32 skeleton rounded" />
                  </div>
                </div>
                <div className="h-20 skeleton rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && grouped.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-title">No billing history found</div>
          <div className="empty-state-message">
            {search || statusFilter !== "all" || dateFrom || dateTo
              ? "No results match your current filters."
              : "Create your first bill to see history here."}
          </div>
          <Link to="/shop/billing" className="btn-primary mt-2 inline-flex">
            ➕ Create Bill
          </Link>
        </div>
      )}

      {/* ── Farmer Groups ── */}
      {!isLoading && (
        <div className="space-y-4 animate-fade-in">
          {grouped.map((grp) => {
            const isOpen = expandedFarmers.has(grp.farmerId);
            const hasDues = grp.totalDue > 0;

            return (
              <div
                key={grp.farmerId}
                className={`card transition-all duration-200 ${hasDues ? "border-l-4 border-l-red-400" : "border-l-4 border-l-green-400"}`}
              >
                {/* ── Farmer Header (always visible) ── */}
                <div
                  className="card-body cursor-pointer select-none"
                  onClick={() => toggleFarmer(grp.farmerId)}
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm shrink-0 ${hasDues ? "bg-gradient-to-br from-red-400 to-red-600" : "bg-gradient-to-br from-green-400 to-green-600"}`}>
                        {grp.farmerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-secondary-900 text-base truncate">
                            {grp.farmerName}
                          </h3>
                          {grp.village && (
                            <span className="text-xs text-secondary-400 bg-surface-100 px-2 py-0.5 rounded-full shrink-0">
                              📍 {grp.village}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap text-xs text-secondary-400">
                          {grp.phone && <span>📞 {grp.phone}</span>}
                          <span>🧾 {grp.bills.length} bill{grp.bills.length !== 1 ? "s" : ""}</span>
                          <span>🕐 Last: {fmtDate(grp.lastDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="hidden sm:flex items-center gap-6 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-secondary-400">Total Billed</p>
                        <p className="font-bold text-secondary-800">₹{grp.totalBilled.toLocaleString()}</p>
                      </div>
                      {hasDues && (
                        <div className="text-right">
                          <p className="text-xs text-secondary-400">Outstanding</p>
                          <p className="font-bold text-red-600">₹{grp.totalDue.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {/* Expand chevron */}
                    <svg
                      className={`w-5 h-5 text-secondary-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20" fill="none"
                    >
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8l4 4 4-4" />
                    </svg>
                  </div>

                  {/* Mobile totals */}
                  <div className="flex sm:hidden items-center gap-4 mt-2 pt-2 border-t border-surface-100">
                    <span className="text-xs text-secondary-500">Billed: <strong>₹{grp.totalBilled.toLocaleString()}</strong></span>
                    {hasDues && <span className="text-xs text-red-600">Due: <strong>₹{grp.totalDue.toLocaleString()}</strong></span>}
                  </div>
                </div>

                {/* ── Bill List (expandable) ── */}
                {isOpen && (
                  <div className="border-t border-surface-100 animate-fade-in">
                    {/* Action bar */}
                    <div className="px-5 py-2.5 bg-surface-50 flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                        {grp.bills.length} Bill{grp.bills.length !== 1 ? "s" : ""} for {grp.farmerName}
                      </p>
                      <div className="flex gap-2">
                        <Link
                          to={`/shop/farmer-statement?farmer=${grp.farmerId}`}
                          className="btn btn-sm bg-surface-100 text-secondary-600 hover:bg-primary-50 hover:text-primary-700"
                        >
                          📄 Statement
                        </Link>
                        <Link
                          to={`/shop/billing?tab=history&farmer=${grp.farmerId}`}
                          className="btn btn-sm bg-surface-100 text-secondary-600 hover:bg-primary-50 hover:text-primary-700"
                        >
                          🧾 All Bills
                        </Link>
                      </div>
                    </div>

                    {/* Bills table */}
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Bill No</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Items</th>
                            <th className="text-right">Amount</th>
                            <th className="text-right">Paid</th>
                            <th className="text-right">Balance</th>
                            <th>Status</th>
                            <th className="text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {grp.bills.map((bill) => (
                            <tr
                              key={bill._id}
                              className={bill.paymentStatus === "unpaid" ? "bg-red-50/30" : ""}
                            >
                              {/* Bill No */}
                              <td>
                                <span className="font-mono font-semibold text-primary-700 text-sm">
                                  #{bill.billNo}
                                </span>
                                {bill.isEdited && (
                                  <span className="ml-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full font-medium">
                                    Edited
                                  </span>
                                )}
                              </td>

                              {/* Date */}
                              <td>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary-700 shrink-0">
                                    {new Date(bill.createdAt).getDate()}
                                  </div>
                                  <div>
                                    <p className="text-xs font-medium text-secondary-700">
                                      {new Date(bill.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                    </p>
                                    <p className="text-[10px] text-secondary-400">
                                      {new Date(bill.createdAt).toLocaleDateString("en-IN", { weekday: "short" })}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              {/* Time */}
                              <td className="text-xs text-secondary-400">
                                {fmtTime(bill.createdAt)}
                              </td>

                              {/* Items */}
                              <td>
                                <div className="flex flex-wrap gap-1 max-w-[160px]">
                                  {(bill.items || []).slice(0, 2).map((it, i) => (
                                    <span
                                      key={i}
                                      className="text-[10px] bg-surface-100 text-secondary-600 px-1.5 py-0.5 rounded-full truncate max-w-[80px]"
                                      title={it.name}
                                    >
                                      {it.name} ×{it.qty}
                                    </span>
                                  ))}
                                  {(bill.items || []).length > 2 && (
                                    <span className="text-[10px] text-secondary-400">
                                      +{bill.items.length - 2} more
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Amount */}
                              <td className="text-right font-semibold text-secondary-800">
                                ₹{(bill.totalAmount || 0).toLocaleString()}
                              </td>

                              {/* Paid */}
                              <td className="text-right text-green-600 font-medium">
                                {bill.amountPaid > 0 ? `₹${bill.amountPaid.toLocaleString()}` : "—"}
                              </td>

                              {/* Balance */}
                              <td className={`text-right font-semibold ${(bill.balanceDue || 0) > 0 ? "text-red-600" : "text-secondary-300"}`}>
                                {(bill.balanceDue || 0) > 0 ? `₹${bill.balanceDue.toLocaleString()}` : "—"}
                              </td>

                              {/* Status */}
                              <td>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusBadge[bill.paymentStatus] || ""}`}>
                                  {statusIcon[bill.paymentStatus]} {bill.paymentStatus}
                                </span>
                                {bill.creditNoteId && (
                                  <span className="ml-1 text-[10px] text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-full font-medium">
                                    Returned
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    to={`/shop/invoice/${bill._id}`}
                                    className="btn btn-sm btn-ghost text-primary-600 hover:bg-primary-50 py-1 px-2"
                                    title="View Invoice"
                                  >
                                    👁️
                                  </Link>
                                  {bill.paymentStatus !== "paid" && !bill.creditNoteId && (
                                    <Link
                                      to={`/shop/billing/${bill._id}/payments`}
                                      className="btn btn-sm btn-ghost text-green-600 hover:bg-green-50 py-1 px-2"
                                      title="Add Payment"
                                    >
                                      💳
                                    </Link>
                                  )}
                                  {!bill.creditNoteId && (
                                    <Link
                                      to={`/shop/billing/${bill._id}/credit-note`}
                                      className="btn btn-sm btn-ghost text-orange-500 hover:bg-orange-50 py-1 px-2"
                                      title="Return Items"
                                    >
                                      🔄
                                    </Link>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>

                        {/* Per-farmer totals footer */}
                        <tfoot className="bg-surface-50 border-t-2 border-surface-200">
                          <tr>
                            <td colSpan={4} className="px-4 py-2.5 text-xs font-semibold text-secondary-500 uppercase">
                              {grp.farmerName} — Totals
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-secondary-800">
                              ₹{grp.totalBilled.toLocaleString()}
                            </td>
                            <td className="px-4 py-2.5 text-right font-bold text-green-600">
                              ₹{(grp.totalBilled - grp.totalDue).toLocaleString()}
                            </td>
                            <td className={`px-4 py-2.5 text-right font-bold ${hasDues ? "text-red-600" : "text-secondary-300"}`}>
                              {hasDues ? `₹${grp.totalDue.toLocaleString()}` : "—"}
                            </td>
                            <td colSpan={2} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
