import React, { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { useNavigate, useParams, Link } from "react-router-dom";
import { showSuccess, showError } from "../../lib/toast";

export default function FarmerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await api.get(`/farmers/${id}`);
        const f = res.data.farmer;
        setName(f.name);
        setPhone(f.phone || "");
        setVillage(f.village || "");
        setActive(f.active);
      } catch (err) {
        showError("Failed to load farmer");
      }
    })();
  }, [id]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Farmer name is required";
    if (phone && !/^\d{10}$/.test(phone)) e.phone = "Phone must be 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { name, phone, village, active };
      if (id) {
        await api.patch(`/farmers/${id}`, payload);
        showSuccess("Farmer updated successfully");
      } else {
        await api.post("/farmers", payload);
        showSuccess("Farmer added successfully");
      }
      navigate("/shop/farmers");
    } catch (err) {
      showError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{id ? "Edit Farmer" : "Add Farmer"}</h1>
          <p className="text-sm text-secondary-400 mt-1">{id ? "Update farmer details" : "Register a new farmer"}</p>
        </div>
        <Link to="/shop/farmers" className="btn-ghost">← Back</Link>
      </div>

      <div className="card max-w-lg">
        <div className="card-body">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="label label-required">Farmer Name</label>
              <input
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="Enter farmer name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({...errors, name: null}); }}
                autoFocus
              />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">Phone</label>
                <input
                  className={`input ${errors.phone ? 'input-error' : ''}`}
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setErrors({...errors, phone: null}); }}
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
              <div>
                <label className="label">Village</label>
                <input
                  className="input"
                  placeholder="Enter village name"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-100 border border-surface-200">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
              <div>
                <p className="text-sm font-medium text-secondary-800">{active ? "Active" : "Inactive"}</p>
                <p className="text-xs text-secondary-400">{active ? "Farmer can receive bills" : "Farmer is deactivated"}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : id ? "Update Farmer" : "Save Farmer"}
              </button>
              <Link to="/shop/farmers" className="btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}