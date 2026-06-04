import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/apiClient";
import { showSuccess, showError } from "../../lib/toast";

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d)) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ─────────────────────────────────────────────
   Skeleton loader
───────────────────────────────────────────── */
function SkeletonField({ wide = false }) {
  return (
    <div className={`skeleton rounded-lg h-10 ${wide ? "w-full" : "w-2/3"}`} />
  );
}

function SkeletonSection({ rows = 2 }) {
  return (
    <div className="card">
      <div className="card-body space-y-5">
        {/* section header skeleton */}
        <div className="flex items-center gap-2 pb-3 border-b border-surface-200">
          <div className="skeleton w-8 h-8 rounded-lg" />
          <div className="skeleton h-5 w-40 rounded" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-28 rounded" />
              <SkeletonField wide />
            </div>
            <div className="space-y-1.5">
              <div className="skeleton h-3.5 w-28 rounded" />
              <SkeletonField wide />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Section header component
───────────────────────────────────────────── */
function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3 pb-4 border-b border-surface-200 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-secondary-900">{title}</h2>
        {description && (
          <p className="text-xs text-secondary-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Plan / Status badge helpers
───────────────────────────────────────────── */
function PlanBadge({ plan }) {
  const map = {
    free: "badge-neutral",
    basic: "badge-info",
    pro: "badge-success",
    enterprise: "badge badge-warning",
  };
  const cls = map[plan?.toLowerCase()] ?? "badge-neutral";
  return (
    <span className={`badge ${cls} capitalize`}>
      {plan || "Free"}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive =
    status?.toLowerCase() === "active" || status?.toLowerCase() === "trial";
  return (
    <span className={`badge ${isActive ? "badge-success" : "badge-danger"} capitalize`}>
      {status || "Unknown"}
    </span>
  );
}

/* ─────────────────────────────────────────────
   Field row helper (read-only info rows)
───────────────────────────────────────────── */
function InfoRow({ label, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-surface-100 last:border-0">
      <span className="text-xs font-medium text-secondary-500 uppercase tracking-wide sm:w-36 shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-secondary-800">{children}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const EMPTY_FORM = {
  ownerName: "",
  businessPhone: "",
  businessEmail: "",
  businessAddress: "",
  invoicePrefix: "",
  gstNumber: "",
  gstPercent: "",
  invoiceFooter: "",
};

export default function ShopSettings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  /* ── Fetch settings ── */
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shop-settings"],
    queryFn: async () => {
      const res = await api.get("/shops/settings/me");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  /* Populate form when data arrives */
  useEffect(() => {
    if (!data) return;
    const s = data.shop ?? data.settings ?? data; // handle either { shop: {} }, { settings: {} } or flat
    setForm({
      ownerName: s.ownerName || "",
      businessPhone: s.businessPhone || s.phone || "",
      businessEmail: s.businessEmail || s.email || "",
      businessAddress: s.businessAddress || s.address || "",
      invoicePrefix: s.invoicePrefix || "",
      gstNumber: s.gstNumber || "",
      gstPercent: s.gstPercent !== undefined && s.gstPercent !== null ? s.gstPercent : "",
      invoiceFooter: s.invoiceFooter || "",
    });
  }, [data]);

  /* ── Save mutation ── */
  const mutation = useMutation({
    mutationFn: (payload) => api.patch("/shops/settings/me", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shop-settings"] });
      showSuccess("Settings saved successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    },
    onError: (err) => {
      showError(err.response?.data?.error || err.message || "Failed to save settings");
    },
  });

  /* ── Validation ── */
  function validate() {
    const e = {};
    if (!form.ownerName.trim()) e.ownerName = "Owner name is required";
    if (form.businessPhone && !/^\d{10}$/.test(form.businessPhone.replace(/\D/g, "")))
      e.businessPhone = "Enter a valid 10-digit phone";
    if (form.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.businessEmail))
      e.businessEmail = "Enter a valid email address";
    if (
      form.gstPercent !== "" &&
      (Number(form.gstPercent) < 0 || Number(form.gstPercent) > 28)
    )
      e.gstPercent = "GST % must be between 0 and 28";
    if (form.gstNumber && !/^[0-9A-Z]{15}$/i.test(form.gstNumber.trim()))
      e.gstNumber = "GST number must be 15 alphanumeric characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Field change handler ── */
  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  }

  /* ── Submit ── */
  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      gstPercent: form.gstPercent !== "" ? Number(form.gstPercent) : undefined,
    };
    mutation.mutate(payload);
  }

  /* ── Subscription info from data ── */
  const sub = data?.shop ?? data?.subscription ?? data?.settings?.subscription ?? data?.plan ?? null;

  /* ── Render ── */
  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Shop Settings</h1>
          <p className="text-sm text-secondary-400 mt-1">
            Manage your business profile, GST details, and invoice configuration
          </p>
        </div>
        <button
          type="button"
          form="settings-form"
          onClick={handleSubmit}
          disabled={mutation.isPending || isLoading}
          className="btn-primary"
        >
          {mutation.isPending ? (
            <>
              <svg
                className="w-4 h-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              Saving…
            </>
          ) : (
            <>💾 Save Settings</>
          )}
        </button>
      </div>

      {/* Success alert */}
      {saved && (
        <div className="alert-success animate-slide-up flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span className="font-medium">Settings saved! Your changes are live.</span>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="alert-error flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span>Failed to load settings. Please refresh and try again.</span>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="space-y-6 animate-stagger">
          <SkeletonSection rows={2} />
          <SkeletonSection rows={2} />
          <SkeletonSection rows={1} />
        </div>
      ) : (
        <form id="settings-form" onSubmit={handleSubmit} className="space-y-6 animate-stagger">

          {/* ══════════════════════════════════════
              Section 1 — Business Info
          ══════════════════════════════════════ */}
          <div className="card">
            <div className="card-body">
              <SectionHeader
                icon="🏢"
                title="Business Information"
                description="Your shop's public-facing owner and contact details"
              />

              {/* Row: Owner Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label label-required">Owner Name</label>
                  <input
                    name="ownerName"
                    className={`input ${errors.ownerName ? "input-error" : ""}`}
                    placeholder="e.g. Ramesh Patel"
                    value={form.ownerName}
                    onChange={onChange}
                    autoComplete="name"
                  />
                  {errors.ownerName && (
                    <p className="field-error">{errors.ownerName}</p>
                  )}
                </div>
                <div>
                  <label className="label">Business Phone</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm select-none">
                      📞
                    </span>
                    <input
                      name="businessPhone"
                      className={`input pl-9 ${errors.businessPhone ? "input-error" : ""}`}
                      placeholder="10-digit mobile"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.businessPhone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setForm((prev) => ({ ...prev, businessPhone: digits }));
                        if (errors.businessPhone)
                          setErrors((prev) => ({ ...prev, businessPhone: null }));
                      }}
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="field-error">{errors.businessPhone}</p>
                  )}
                </div>
              </div>

              {/* Business Email */}
              <div>
                <label className="label">Business Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm select-none">
                    ✉️
                  </span>
                  <input
                    name="businessEmail"
                    type="email"
                    className={`input pl-9 ${errors.businessEmail ? "input-error" : ""}`}
                    placeholder="shop@example.com"
                    value={form.businessEmail}
                    onChange={onChange}
                    autoComplete="email"
                  />
                </div>
                {errors.businessEmail && (
                  <p className="field-error">{errors.businessEmail}</p>
                )}
              </div>

              {/* Business Address */}
              <div>
                <label className="label">Business Address</label>
                <textarea
                  name="businessAddress"
                  className="textarea"
                  placeholder="Street, City, State, PIN"
                  value={form.businessAddress}
                  onChange={onChange}
                  rows={3}
                />
                <p className="text-xs text-secondary-400 mt-1">
                  📍 This address will appear on your invoices
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              Section 2 — Invoice Settings
          ══════════════════════════════════════ */}
          <div className="card">
            <div className="card-body">
              <SectionHeader
                icon="🧾"
                title="Invoice Settings"
                description="Customize how your bills and invoices are generated"
              />

              {/* Row: Invoice Prefix + GST Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">Invoice Prefix</label>
                  <input
                    name="invoicePrefix"
                    className="input"
                    placeholder="e.g. INV, BILL, AGR"
                    maxLength={10}
                    value={form.invoicePrefix}
                    onChange={onChange}
                  />
                  <p className="text-xs text-secondary-400 mt-1">
                    Bills will be numbered as <span className="font-medium text-primary-600">{form.invoicePrefix || "INV"}-0001</span>
                  </p>
                </div>
                <div>
                  <label className="label">GST Number</label>
                  <input
                    name="gstNumber"
                    className={`input uppercase tracking-widest ${errors.gstNumber ? "input-error" : ""}`}
                    placeholder="15-digit GSTIN"
                    maxLength={15}
                    value={form.gstNumber}
                    onChange={(e) => {
                      setForm((prev) => ({
                        ...prev,
                        gstNumber: e.target.value.toUpperCase(),
                      }));
                      if (errors.gstNumber)
                        setErrors((prev) => ({ ...prev, gstNumber: null }));
                    }}
                  />
                  {errors.gstNumber && (
                    <p className="field-error">{errors.gstNumber}</p>
                  )}
                </div>
              </div>

              {/* GST Percent */}
              <div className="max-w-xs">
                <label className="label">Default GST %</label>
                <div className="relative">
                  <input
                    name="gstPercent"
                    type="number"
                    min={0}
                    max={28}
                    step={0.01}
                    className={`input pr-10 ${errors.gstPercent ? "input-error" : ""}`}
                    placeholder="0"
                    value={form.gstPercent}
                    onChange={onChange}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 font-medium text-sm select-none">
                    %
                  </span>
                </div>
                {errors.gstPercent ? (
                  <p className="field-error">{errors.gstPercent}</p>
                ) : (
                  <p className="text-xs text-secondary-400 mt-1">
                    Allowed: 0, 5, 12, 18, 28 (standard GST slabs)
                  </p>
                )}
              </div>

              {/* Invoice Footer */}
              <div>
                <label className="label">Invoice Footer Note</label>
                <textarea
                  name="invoiceFooter"
                  className="textarea"
                  placeholder="e.g. Thank you for your business! Goods once sold will not be returned."
                  value={form.invoiceFooter}
                  onChange={onChange}
                  rows={3}
                />
                <p className="text-xs text-secondary-400 mt-1">
                  📋 This text appears at the bottom of every printed invoice
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              Section 3 — Subscription Info (read-only)
          ══════════════════════════════════════ */}
          <div className="card">
            <div className="card-body">
              <SectionHeader
                icon="💼"
                title="Subscription Info"
                description="Your current plan details — managed by the platform"
              />

              {sub ? (
                <div className="bg-surface-50 rounded-xl border border-surface-200 px-4 divide-y divide-surface-100">
                  <InfoRow label="Plan">
                    <PlanBadge plan={sub.plan} />
                  </InfoRow>
                  <InfoRow label="Status">
                    <StatusBadge status={sub.status} />
                  </InfoRow>
                  <InfoRow label="Expiry Date">
                    <span className="flex items-center gap-1.5">
                      <span>📅</span>
                      {formatDate(sub.expiryDate ?? sub.expiry ?? sub.endsAt)}
                    </span>
                  </InfoRow>
                  {sub.maxFarmers !== undefined && (
                    <InfoRow label="Max Farmers">
                      {sub.maxFarmers === 0 || sub.maxFarmers == null
                        ? "Unlimited"
                        : sub.maxFarmers}
                    </InfoRow>
                  )}
                  {sub.maxProducts !== undefined && (
                    <InfoRow label="Max Products">
                      {sub.maxProducts === 0 || sub.maxProducts == null
                        ? "Unlimited"
                        : sub.maxProducts}
                    </InfoRow>
                  )}
                </div>
              ) : (
                /* Fallback: show raw plan fields if sub object is not nested */
                <div className="bg-surface-50 rounded-xl border border-surface-200 px-4 divide-y divide-surface-100">
                  <InfoRow label="Plan">
                    <PlanBadge plan={data?.plan} />
                  </InfoRow>
                  <InfoRow label="Status">
                    <StatusBadge status={data?.subscriptionStatus ?? data?.status} />
                  </InfoRow>
                  <InfoRow label="Expiry Date">
                    <span className="flex items-center gap-1.5">
                      <span>📅</span>
                      {formatDate(
                        data?.expiryDate ??
                          data?.subscriptionExpiry ??
                          data?.settings?.expiryDate
                      )}
                    </span>
                  </InfoRow>
                </div>
              )}

              <p className="text-xs text-secondary-400 mt-4 flex items-center gap-1.5">
                <span>🔒</span>
                Subscription details are read-only. Contact support to upgrade or modify your plan.
              </p>
            </div>
          </div>

          {/* ── Bottom Save Bar ── */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-surface-200 shadow-sm">
            <p className="text-sm text-secondary-500">
              {mutation.isPending
                ? "Saving your changes…"
                : saved
                ? "✅ All changes saved"
                : "Review your details before saving"}
            </p>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary"
            >
              {mutation.isPending ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Saving…
                </>
              ) : (
                <>💾 Save Settings</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
