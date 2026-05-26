import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/apiClient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format an ISO date string as "DD MMM YYYY HH:MM"
 */
function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("en-GB", { month: "short" });
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month} ${year} ${hh}:${mm}`;
}

/**
 * Map an action string to a badge color class variant.
 */
function actionBadgeClass(action) {
  switch (action) {
    case "SHOP_CREATED":
      return "badge-green";
    case "SHOP_UPDATED":
      return "badge-blue";
    case "PASSWORD_RESET":
      return "badge-orange";
    case "DATA_RESET":
      return "badge-red";
    default:
      return "badge-gray";
  }
}

/**
 * Truncate a JSON-serialised details object to at most `maxLen` characters.
 */
function truncateDetails(details, maxLen = 60) {
  if (details === null || details === undefined) return "—";
  let str;
  try {
    str = typeof details === "string" ? details : JSON.stringify(details);
  } catch {
    str = String(details);
  }
  return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableSkeleton({ rows = 8 }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-4 py-3">
              <div
                className="h-4 bg-secondary-200 rounded"
                style={{ width: j === 5 ? "90%" : j === 1 ? "70%" : "60%" }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyRow({ colSpan = 6, message = "No audit log entries found." }) {
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="py-16 text-center text-secondary-400">
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl">📭</span>
            <p className="text-sm font-medium">{message}</p>
          </div>
        </td>
      </tr>
    </tbody>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

const PAGE_LIMIT = 50;

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // ── Data fetching ──────────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["master-audit-log", page],
    queryFn: async () => {
      const res = await api.get("/master/audit-log", {
        params: { page, limit: PAGE_LIMIT },
      });
      return res.data; // { logs, total, page, limit }
    },
    keepPreviousData: true,
    staleTime: 30_000,
  });

  const logs = data?.logs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  // ── Client-side filter (actorEmail or action) ──────────────────────────────
  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (log) =>
        (log.actorEmail ?? "").toLowerCase().includes(q) ||
        (log.action ?? "").toLowerCase().includes(q)
    );
  }, [logs, search]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handlePrev() {
    setPage((p) => Math.max(1, p - 1));
  }

  function handleNext() {
    setPage((p) => Math.min(totalPages, p + 1));
  }

  function handleSearch(e) {
    setSearch(e.target.value);
    // Reset to page 1 only when the search changes so the user
    // doesn't land on a non-existent page after filtering.
    setPage(1);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📜 Audit Log</h1>
          <p className="text-sm text-secondary-400 mt-1">
            Track all administrative actions
          </p>
        </div>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ⚠️ Failed to load audit log:{" "}
          {error?.response?.data?.error ?? error?.message ?? "Unknown error"}
        </div>
      )}

      <div className="card">
        <div className="card-body space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute inset-y-0 left-3 flex items-center text-secondary-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                className="input pl-9 w-full"
                placeholder="Search by actor email or action…"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <p className="text-xs text-secondary-400 ml-auto whitespace-nowrap">
              {total.toLocaleString()} total entr{total === 1 ? "y" : "ies"}
            </p>
          </div>

          {/* Table */}
          <div className="table-container overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                    Actor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide whitespace-nowrap">
                    IP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wide">
                    Details
                  </th>
                </tr>
              </thead>

              {isLoading ? (
                <TableSkeleton rows={8} />
              ) : filteredLogs.length === 0 ? (
                <EmptyRow
                  message={
                    search
                      ? `No entries matching "${search}"`
                      : "No audit log entries found."
                  }
                />
              ) : (
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t border-secondary-100 hover:bg-secondary-50 transition-colors"
                    >
                      {/* Time */}
                      <td className="px-4 py-3 text-sm text-secondary-600 whitespace-nowrap font-mono">
                        {formatDateTime(log.createdAt)}
                      </td>

                      {/* Actor */}
                      <td className="px-4 py-3 text-sm text-secondary-800 whitespace-nowrap max-w-[180px] truncate">
                        {log.actorEmail || "—"}
                      </td>

                      {/* Action badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`badge ${actionBadgeClass(log.action)} text-xs font-semibold`}
                        >
                          {log.action || "UNKNOWN"}
                        </span>
                      </td>

                      {/* Target */}
                      <td className="px-4 py-3 text-sm text-secondary-700 whitespace-nowrap">
                        {log.targetType ? (
                          <span>
                            <span className="text-secondary-400 text-xs mr-1">
                              {log.targetType}
                            </span>
                            <span className="font-medium">
                              {log.targetName || "—"}
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* IP */}
                      <td className="px-4 py-3 text-sm text-secondary-500 font-mono whitespace-nowrap">
                        {log.ip || "—"}
                      </td>

                      {/* Details */}
                      <td className="px-4 py-3">
                        {log.details !== undefined && log.details !== null ? (
                          <pre className="text-xs text-secondary-600 bg-secondary-100 rounded px-2 py-1 max-w-[260px] overflow-hidden leading-relaxed whitespace-pre-wrap break-all">
                            {truncateDetails(log.details, 60)}
                          </pre>
                        ) : (
                          <span className="text-secondary-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
            <button
              className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handlePrev}
              disabled={page <= 1 || isLoading}
            >
              ← Prev
            </button>

            <span className="text-sm text-secondary-500 font-medium">
              Page{" "}
              <span className="text-secondary-800 font-semibold">{page}</span>{" "}
              of{" "}
              <span className="text-secondary-800 font-semibold">
                {totalPages}
              </span>
            </span>

            <button
              className="btn-secondary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleNext}
              disabled={page >= totalPages || isLoading}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
