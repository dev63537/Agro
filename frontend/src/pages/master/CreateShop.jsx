import React, { useState } from "react";
import api from "../../lib/apiClient";
import { showError, showSuccess } from "../../lib/toast";

export default function CreateShop() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("free");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) { showError("Email is required — the shop admin will receive an invite."); return; }

    setLoading(true);
    try {
      const res = await api.post("/master/shops", { name, code, ownerName, email, phone, plan });
      setResult(res.data);
      showSuccess(res.data.message || "Shop created successfully!");
    } catch (err) {
      showError(err.response?.data?.error || "Failed to create shop");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create New Shop</h1>
      </div>

      <div className="card max-w-lg">
        <div className="card-body">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Shop Name *</label>
              <input className="input" placeholder="Enter shop name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Shop Code *</label>
              <input className="input" placeholder="Unique code (e.g. GV01)" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div>
              <label className="label">Owner Name</label>
              <input className="input" placeholder="Shop owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
            </div>
            <div>
              <label className="label">Owner Email *</label>
              <input className="input" type="email" placeholder="owner@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="label">Plan</label>
              <select value={plan} onChange={(e) => setPlan(e.target.value)} className="select">
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Shop"}
            </button>
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
