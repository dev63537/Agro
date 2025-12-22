import React, { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { useNavigate, useParams } from "react-router-dom";

export default function FarmerForm() {
  const { id } = useParams(); // 👈 edit mode if exists
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [village, setVillage] = useState("");
  const [active, setActive] = useState(true);

  // 🔄 Load farmer for edit
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
        alert("Failed to load farmer");
      }
    })();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      const payload = { name, phone, village, active };

      if (id) {
        await api.patch(`/farmers/${id}`, payload);
      } else {
        await api.post("/farmers", payload);
      }

      navigate("/shop/farmers");
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold mb-4">
        {id ? "Edit Farmer" : "Add Farmer"}
      </h2>

      <form onSubmit={submit} className="space-y-3 bg-white p-4 rounded shadow">
        <div>
          <label className="block mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>

        <div>
          <label className="block mb-1">Village</label>
          <input value={village} onChange={(e) => setVillage(e.target.value)} />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          <span>Active</span>
        </div>

        <button className="btn-primary">
          {id ? "Update Farmer" : "Save Farmer"}
        </button>
      </form>
    </div>
  );
}
    