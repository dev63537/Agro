import React, { useRef, useState } from "react";
import api from "../../lib/apiClient";
import { showError, showSuccess } from "../../lib/toast";

/** Press Enter → move focus to next focusable sibling */
function useEnterNext() {
  return (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA" && e.target.tagName !== "SELECT") {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      const focusable = Array.from(
        form.querySelectorAll("input, select, textarea, button[type='submit']")
      ).filter((el) => !el.disabled);
      const idx = focusable.indexOf(e.target);
      if (idx < focusable.length - 1) focusable[idx + 1].focus();
    }
  };
}

export default function CreateShop() {
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("free");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const onKeyDown = useEnterNext();

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { showError("Shop name is required."); return; }
    if (!email) { showError("Email is required — the shop admin will receive an invite."); return; }

    setLoading(true);
    try {
      const res = await api.post("/master/shops", { name, ownerName, email, phone, plan });
      setResult(res.data);
      showSuccess(res.data.message || "Shop created successfully!");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setName(""); setOwnerName(""); setEmail(""); setPhone(""); setPlan("free"); setResult(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Shop</h1>
          <p className="text-sm text-secondary-400 mt-1">Press <kbd className="px-1.5 py-0.5 text-xs bg-surface-200 rounded border border-surface-300 font-mono">Enter</kbd> to move between fields</p>
        </div>
      </div>

      <div className="card max-w-lg">
        <div className="card-body">
          <form onSubmit={submit} className="space-y-4" onKeyDown={onKeyDown}>
            <div>
              <label className="label label-required">Shop Name</label>
              <input
                className="input"
                placeholder="Enter shop name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div>
              <label className="label">Owner Name</label>
              <input
                className="input"
                placeholder="Shop owner full name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>

            <div>
              <label className="label label-required">Owner Email</label>
              <input
                className="input"
                type="email"
                placeholder="owner@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-xs text-secondary-400 mt-1">📧 An invite link will be sent to this email.</p>
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                placeholder="10-digit phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Plan</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="select">
                <option value="free">🆓 Free</option>
                <option value="basic">⭐ Basic</option>
                <option value="pro">🚀 Pro</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </span>
                ) : "➕ Create Shop"}
              </button>
              {result && (
                <button type="button" onClick={reset} className="btn-ghost">
                  + New
                </button>
              )}
            </div>
          </form>

          {result && (
            <div className="alert-success mt-5">
              <h3 className="font-bold text-primary-700 flex items-center gap-2">
                ✅ Shop Created Successfully
              </h3>
              <p className="text-sm mt-2">
                <strong>Shop Admin:</strong> {result.shopAdmin?.email}
              </p>
              <p className="text-sm mt-1">
                📧 An invite email has been sent. The shop admin must click the link to set their password.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
