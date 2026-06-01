import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

/* ─── Status badge helper ─── */
const StatusBadge = ({ status }) => {
  const map = {
    issued:    "bg-blue-100 text-blue-700 border border-blue-200",
    applied:   "bg-green-100 text-green-700 border border-green-200",
    cancelled: "bg-red-100 text-red-600 border border-red-200",
  };
  const label = { issued: "🔵 Issued", applied: "✅ Applied", cancelled: "❌ Cancelled" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || ""}`}>
      {label[status] || status}
    </span>
  );
};

/* ─── Detail drawer / modal ─── */
function CreditNoteDetail({ cn, onClose }) {
  const closeBtnRef = React.useRef(null);

  React.useEffect(() => {
    if (!cn) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [cn, onClose]);

  if (!cn) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cn-modal-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 flex items-start justify-between">
          <div>
            <p className="text-white/70 text-xs uppercase tracking-widest font-medium">Credit Note</p>
            <h2 id="cn-modal-title" className="text-2xl font-bold text-white mt-0.5">{cn.creditNoteNo}</h2>
            <p className="text-white/80 text-sm mt-1">
              Farmer: <strong>{cn.farmerId?.name}</strong>
              {cn.farmerId?.village && ` · ${cn.farmerId.village}`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-white/70 hover:text-white transition-colors text-2xl leading-none mt-1 p-2 -m-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-400 text-xs uppercase font-medium mb-0.5">Original Bill</p>
              <Link
                to={`/shop/invoice/${cn.originalBillId?._id || cn.originalBillId}`}
                className="text-primary-600 font-semibold hover:underline"
                onClick={onClose}
              >
                #{cn.originalBillId?.billNo || "—"}
              </Link>
            </div>
            <div>
              <p className="text-secondary-400 text-xs uppercase font-medium mb-0.5">Date Issued</p>
              <p className="font-medium text-secondary-700">
                {new Date(cn.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <div>
              <p className="text-secondary-400 text-xs uppercase font-medium mb-0.5">Status</p>
              <StatusBadge status={cn.status} />
            </div>
            <div>
              <p className="text-secondary-400 text-xs uppercase font-medium mb-0.5">Credit Amount</p>
              <p className="text-xl font-bold text-orange-600">₹{cn.totalAmount?.toLocaleString()}</p>
            </div>
          </div>

          {/* Reason */}
          {cn.reason && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
              <p className="text-xs text-amber-600 font-semibold uppercase mb-0.5">Reason</p>
              <p className="text-sm text-amber-800">{cn.reason}</p>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-secondary-500 text-xs uppercase font-semibold mb-2">Returned Items</p>
            <div className="rounded-xl border border-surface-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-50">
                  <tr>
                    <th className="text-left px-4 py-2 text-secondary-500 font-medium">Item</th>
                    <th className="text-right px-4 py-2 text-secondary-500 font-medium">Qty</th>
                    <th className="text-right px-4 py-2 text-secondary-500 font-medium">Price</th>
                    <th className="text-right px-4 py-2 text-secondary-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(cn.items || []).map((it, i) => (
                    <tr key={i} className="border-t border-surface-100">
                      <td className="px-4 py-2 font-medium text-secondary-800">{it.name}</td>
                      <td className="px-4 py-2 text-right text-secondary-600">{it.qty}</td>
                      <td className="px-4 py-2 text-right text-secondary-600">₹{it.unitPrice}</td>
                      <td className="px-4 py-2 text-right font-semibold text-orange-600">
                        ₹{it.total?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-orange-50 border-t border-orange-100">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 font-bold text-secondary-700 text-right">
                      Credit Total
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-orange-600 text-base">
                      ₹{cn.totalAmount?.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-600 space-y-1">
            <p>✅ Stock was restored automatically when this credit note was issued</p>
            <p>✅ Farmer's outstanding ledger dues were reduced accordingly</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button ref={closeBtnRef} onClick={onClose} className="btn-ghost w-full min-h-[44px]">Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Returns Page ─── */
export default function Returns() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCN, setSelectedCN] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["credit-notes"],
    queryFn: () =>
      api.get("/billing/credit-notes/all").then((r) => r.data.creditNotes),
  });

  /* ── Stats ── */
  const stats = useMemo(() => {
    if (!data) return { total: 0, totalValue: 0, issued: 0, applied: 0, cancelled: 0 };
    return {
      total:     data.length,
      totalValue: data.reduce((s, cn) => s + (cn.totalAmount || 0), 0),
      issued:    data.filter((cn) => cn.status === "issued").length,
      applied:   data.filter((cn) => cn.status === "applied").length,
      cancelled: data.filter((cn) => cn.status === "cancelled").length,
    };
  }, [data]);

  /* ── Filtered list ── */
  const filtered = useMemo(() => {
    if (!data) return [];
    let list = data;

    if (statusFilter !== "all") list = list.filter((cn) => cn.status === statusFilter);

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (cn) =>
          cn.creditNoteNo.toLowerCase().includes(q) ||
          (cn.farmerId?.name || "").toLowerCase().includes(q) ||
          (cn.originalBillId?.billNo || "").toLowerCase().includes(q) ||
          (cn.reason || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data, search, statusFilter]);

  /* ── Render ── */
  if (isLoading)
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="h-8 w-56 skeleton rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 skeleton rounded-xl" />
          ))}
        </div>
        <div className="h-64 skeleton rounded-xl" />
      </div>
    );

  if (error)
    return (
      <div className="alert-error">
        Failed to load returns. Please refresh.
      </div>
    );

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🔄 Returns & Credit Notes</h1>
          <p className="text-sm text-secondary-400 mt-1">
            All product returns and issued credit notes across your shop
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="card-body py-4 text-center">
            <p className="text-xs text-secondary-400 uppercase font-medium">Total Returns</p>
            <p className="text-3xl font-bold text-secondary-800 mt-1">{stats.total}</p>
          </div>
        </div>
        <div className="card" style={{ borderColor: "#fed7aa" }}>
          <div className="card-body py-4 text-center" style={{ background: "#fff7ed" }}>
            <p className="text-xs text-orange-500 uppercase font-medium">Total Credit Value</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              ₹{stats.totalValue.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="card" style={{ borderColor: "#bfdbfe" }}>
          <div className="card-body py-4 text-center" style={{ background: "#eff6ff" }}>
            <p className="text-xs text-blue-500 uppercase font-medium">Issued</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.issued}</p>
          </div>
        </div>
        <div className="card" style={{ borderColor: "#bbf7d0" }}>
          <div className="card-body py-4 text-center" style={{ background: "#f0fdf4" }}>
            <p className="text-xs text-green-500 uppercase font-medium">Applied</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.applied}</p>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 pointer-events-none"
            viewBox="0 0 20 20" fill="none"
          >
            <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" d="M13 13l3 3" />
          </svg>
          <input
            type="text"
            className="input pl-9 pr-9"
            placeholder="Search by CN#, farmer, bill, reason…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-700"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        {/* Status chips */}
        {[
          { key: "all",       label: `All (${stats.total})`,           cls: statusFilter === "all"       ? "bg-secondary-700 text-white" : "bg-surface-100 text-secondary-600 hover:bg-surface-200" },
          { key: "issued",    label: `🔵 Issued (${stats.issued})`,    cls: statusFilter === "issued"    ? "bg-blue-500 text-white"       : "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200" },
          { key: "applied",   label: `✅ Applied (${stats.applied})`,  cls: statusFilter === "applied"   ? "bg-green-500 text-white"      : "bg-green-50 text-green-600 hover:bg-green-100 border border-green-200" },
          { key: "cancelled", label: `❌ Cancelled (${stats.cancelled})`, cls: statusFilter === "cancelled" ? "bg-red-500 text-white"       : "bg-red-50 text-red-500 hover:bg-red-100 border border-red-200" },
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setStatusFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${chip.cls}`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── Table / Empty state ── */}
      {data?.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔄</div>
          <div className="empty-state-title">No returns yet</div>
          <div className="empty-state-message">
            When you issue a credit note from any invoice, it will appear here.
          </div>
          <Link to="/shop/billing" className="btn-primary">
            Go to Billing
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No matches</div>
          <div className="empty-state-message">Try a different search or filter.</div>
          <div className="flex gap-3 justify-center mt-2">
            {search      && <button onClick={() => setSearch("")}          className="btn-outline">✕ Clear Search</button>}
            {statusFilter !== "all" && <button onClick={() => setStatusFilter("all")} className="btn-ghost">Reset Filter</button>}
          </div>
        </div>
      ) : (
        <>
          {search && (
            <p className="text-xs text-secondary-400 mb-3">
              Showing <strong className="text-secondary-700">{filtered.length}</strong> result
              {filtered.length !== 1 ? "s" : ""} for &ldquo;
              <strong className="text-primary-700">{search}</strong>&rdquo;
            </p>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Credit Note #</th>
                  <th>Date</th>
                  <th>Farmer</th>
                  <th>Original Bill</th>
                  <th>Items</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-right">Credit Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cn) => (
                  <tr
                    key={cn._id}
                    className="cursor-pointer hover:bg-orange-50/40 transition-colors"
                    onClick={() => setSelectedCN(cn)}
                  >
                    <td>
                      <span className="font-mono text-sm font-semibold text-orange-600">
                        {cn.creditNoteNo}
                      </span>
                    </td>
                    <td className="text-xs text-secondary-500">
                      {new Date(cn.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-secondary-800">{cn.farmerId?.name || "—"}</p>
                        {cn.farmerId?.village && (
                          <p className="text-xs text-secondary-400">{cn.farmerId.village}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <Link
                        to={`/shop/invoice/${cn.originalBillId?._id || cn.originalBillId}`}
                        className="text-primary-600 hover:underline text-sm font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{cn.originalBillId?.billNo || "—"}
                      </Link>
                    </td>
                    <td className="text-secondary-600 text-sm">
                      {(cn.items || []).length} item{(cn.items || []).length !== 1 ? "s" : ""}
                    </td>
                    <td className="text-sm text-secondary-500 max-w-[180px] truncate">
                      {cn.reason || <span className="text-secondary-300">—</span>}
                    </td>
                    <td>
                      <StatusBadge status={cn.status} />
                    </td>
                    <td className="text-right font-bold text-orange-600">
                      ₹{(cn.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-sm btn-ghost text-orange-600 hover:bg-orange-50"
                        onClick={(e) => { e.stopPropagation(); setSelectedCN(cn); }}
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Detail Modal ── */}
      <CreditNoteDetail cn={selectedCN} onClose={() => setSelectedCN(null)} />
    </div>
  );
}
