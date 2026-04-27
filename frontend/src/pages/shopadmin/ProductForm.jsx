import React, { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { useNavigate, useParams, Link } from "react-router-dom";
import { showSuccess, showError } from "../../lib/toast";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    company: "",
    sku: "",
    unit: "kg",
    price: "",
    gstPercent: "",
    category: "",
    description: "",
  });

  const isEdit = Boolean(id);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setForm({
          name: res.data.product.name || "",
          company: res.data.product.company || "",
          sku: res.data.product.sku || "",
          unit: res.data.product.unit || "kg",
          price: res.data.product.price || "",
          gstPercent: res.data.product.gstPercent || "",
          category: res.data.product.category || "",
          description: res.data.product.description || "",
        });
      } catch (err) {
        showError("Failed to load product");
      }
    })();
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price || Number(form.price) <= 0) e.price = "Valid price is required";
    if (form.gstPercent !== "" && (Number(form.gstPercent) < 0 || Number(form.gstPercent) > 100)) e.gstPercent = "GST must be 0-100%";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, form);
        showSuccess("Product updated successfully");
      } else {
        await api.post("/products", form);
        showSuccess("Product created successfully");
      }
      navigate("/shop/products");
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
          <h1 className="page-title">{isEdit ? "Edit Product" : "Add Product"}</h1>
          <p className="text-sm text-secondary-400 mt-1">{isEdit ? "Update product details" : "Add a new product to your catalog"}</p>
        </div>
        <Link to="/shop/products" className="btn-ghost">← Back</Link>
      </div>

      <div className="card max-w-2xl">
        <div className="card-body">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label label-required">Product Name</label>
                <input name="name" className={`input ${errors.name ? 'input-error' : ''}`} placeholder="e.g. Urea Fertilizer" value={form.name} onChange={onChange} autoFocus />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div>
                <label className="label">Company / Brand</label>
                <input name="company" className="input" placeholder="e.g. Tata Rallis, Bayer" value={form.company} onChange={onChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="label">SKU</label>
                <input name="sku" className="input" placeholder="e.g. UREA-50KG" value={form.sku} onChange={onChange} />
              </div>
              <div>
                <label className="label">Category</label>
                <input name="category" className="input" placeholder="e.g. Fertilizers, Seeds, Pesticides" value={form.category} onChange={onChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="label label-required">Price (₹)</label>
                <input name="price" type="number" step="0.01" className={`input ${errors.price ? 'input-error' : ''}`} placeholder="0.00" value={form.price} onChange={onChange} />
                {errors.price && <p className="field-error">{errors.price}</p>}
              </div>
              <div>
                <label className="label">Unit</label>
                <select name="unit" className="select" value={form.unit} onChange={onChange}>
                  <option value="kg">kg</option>
                  <option value="ltr">ltr</option>
                  <option value="pcs">pcs</option>
                  <option value="bag">bag</option>
                  <option value="box">box</option>
                  <option value="ton">ton</option>
                </select>
              </div>
              <div>
                <label className="label">GST %</label>
                <input name="gstPercent" type="number" step="0.01" className={`input ${errors.gstPercent ? 'input-error' : ''}`} placeholder="0" value={form.gstPercent} onChange={onChange} />
                {errors.gstPercent && <p className="field-error">{errors.gstPercent}</p>}
              </div>
            </div>



            <div>
              <label className="label">Description</label>
              <textarea name="description" className="textarea" placeholder="Optional product description" value={form.description} onChange={onChange} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
              </button>
              <Link to="/shop/products" className="btn-ghost">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
