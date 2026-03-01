import React, { useEffect, useRef, useState } from "react";
import api from "../../lib/apiClient";
import ProductSelector from "../../components/ProductSelector";
import SignaturePad from "../../components/SignaturePad";
import BillSummary from "../../components/BillSummary";
import { useNavigate } from "react-router-dom";
import BillConfirmModal from "../../components/BillConfirmModal";
import { useQueryClient } from "@tanstack/react-query";

export default function Billing() {
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [farmerId, setFarmerId] = useState("");
  const [items, setItems] = useState([]);
  const [paymentType, setPaymentType] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);

  const sigRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [pRes, fRes] = await Promise.all([
          api.get("/products"),
          api.get("/farmers"),
        ]);
        setProducts(pRes.data.products || []);
        setFarmers(fRes.data.farmers || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", qty: 1, unitPrice: 0, gstPercent: 0 },
    ]);
  };

  const updateItem = (idx, data) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...data } : it))
    );
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const onProductChange = (idx, productId) => {
    const p = products.find((x) => x._id === productId);
    updateItem(idx, {
      productId,
      unitPrice: p?.price || 0,
      gstPercent: p?.gstPercent || 0,
    });
  };

  const submit = () => {
    if (!farmerId) return alert("Select farmer");
    if (items.length === 0) return alert("Add items");

    const sig = sigRef.current?.getDataURL();
    if (!sig) return alert("Please sign");

    setShowConfirm(true);
  };

  const confirmCreateBill = async () => {
    try {
      const signatureBase64 = sigRef.current?.getDataURL();

      const payload = {
        farmerId,
        items: items.map((it) => ({
          productId: it.productId,
          qty: Number(it.qty),
          unitPrice: Number(it.unitPrice),
        })),
        paymentType,
        paidAmount: paymentType === "pending" ? 0 : Number(paidAmount),
        signatureBase64,
      };

      const res = await api.post("/billing", payload);

      await queryClient.invalidateQueries({ queryKey: ["shop-sales"] });
      await queryClient.invalidateQueries({ queryKey: ["top-farmers"] });
      await queryClient.invalidateQueries({ queryKey: ["low-stock"] });

      navigate(`/shop/invoice/${res.data.bill._id}`);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Billing</h3>

          <label>Farmer</label>
          <select value={farmerId} onChange={(e) => setFarmerId(e.target.value)}>
            <option value="">Select farmer</option>
            {farmers.map((f) => (
              <option key={f._id} value={f._id}>
                {f.name}
              </option>
            ))}
          </select>

          {items.map((it, idx) => (
            <div key={idx} className="border p-2 mt-2">
              <ProductSelector
                products={products}
                value={it.productId}
                onChange={(v) => onProductChange(idx, v)}
              />
              <input
                type="number"
                value={it.qty}
                onChange={(e) =>
                  updateItem(idx, { qty: Number(e.target.value) })
                }
              />
              <button onClick={() => removeItem(idx)}>Remove</button>
            </div>
          ))}

          <button onClick={addItem}>Add Item</button>
        </div>

        <div className="bg-white p-4 rounded shadow mt-4">
          <h3>Payment</h3>

          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="online">Online</option>
            <option value="pending">Pending</option>
          </select>

          {paymentType !== "pending" && (
            <input
              type="number"
              placeholder="Paid Amount"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
          )}
        </div>

        <div className="bg-white p-4 rounded shadow mt-4">
          <SignaturePad ref={sigRef} />
          <button onClick={submit}>Create Bill</button>
        </div>
      </div>

      <div>
        <BillSummary
          items={items.map((i) => ({
            qty: i.qty,
            unitPrice: i.unitPrice,
            gstPercent: i.gstPercent,
          }))}
        />
      </div>

      <BillConfirmModal
        open={showConfirm}
        farmer={farmers.find((f) => f._id === farmerId)}
        items={items}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmCreateBill}
      />
    </div>
  );
}