import React, { useState } from "react";
import api from "../../lib/apiClient";

export default function CreateShop() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [plan, setPlan] = useState("free");
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/master/shops", {
        name,
        code,
        ownerName,
        email,
        phone,
        plan,
      });
      setResult(res.data.shopAdminCredentials);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create shop");
    }
  };

  return (
    <div className="max-w-lg bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create New Shop</h2>

      <form onSubmit={submit} className="space-y-3">
        <input className="border p-2 w-full" placeholder="Shop Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Shop Code" value={code} onChange={(e) => setCode(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Owner Name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Owner Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="border p-2 w-full">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>

        <button className="btn-primary w-full">Create Shop</button>
      </form>

      {result && (
        <div className="mt-4 p-4 bg-green-100 rounded">
          <h3 className="font-bold">Shop Admin Created</h3>
          <p><strong>Email:</strong> {result.email}</p>
          <p><strong>Password:</strong> {result.password}</p>
        </div>
      )}
    </div>
  );
}
