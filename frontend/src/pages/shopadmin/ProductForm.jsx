import React, { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { useNavigate, useParams } from "react-router-dom";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "kg",
    price: "",
    gstPercent: "",
    category: "",
    description: "",
  });

  const isEdit = Boolean(id);

  // ✅ LOAD PRODUCT FOR EDIT
  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setForm({
          name: res.data.product.name || "",
          sku: res.data.product.sku || "",
          unit: res.data.product.unit || "kg",
          price: res.data.product.price || "",
          gstPercent: res.data.product.gstPercent || "",
          category: res.data.product.category || "",
          description: res.data.product.description || "",
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async () => {
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, form);
      } else {
        await api.post("/products", form);
      }
      navigate("/shop/products");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? "Edit Product" : "Add Product"}
      </h2>

      <input name="name" placeholder="Product Name" value={form.name} onChange={onChange} />
      <input name="sku" placeholder="SKU" value={form.sku} onChange={onChange} />
      <input name="unit" placeholder="Unit (kg, ltr)" value={form.unit} onChange={onChange} />
      <input name="price" type="number" placeholder="Price" value={form.price} onChange={onChange} />
      <input name="gstPercent" type="number" placeholder="GST %" value={form.gstPercent} onChange={onChange} />
      <input name="category" placeholder="Category" value={form.category} onChange={onChange} />
      <textarea name="description" placeholder="Description" value={form.description} onChange={onChange} />

      <button className="btn-primary mt-3" onClick={submit}>
        {isEdit ? "Update Product" : "Create Product"}
      </button>
    </div>
  );
}
