import React, { useEffect, useRef, useState } from 'react'
import api from '../../lib/apiClient'
import ProductSelector from '../../components/ProductSelector'
import SignaturePad from '../../components/SignaturePad'
import BillSummary from '../../components/BillSummary'
import { useNavigate } from 'react-router-dom'
import BillConfirmModal from "../../components/BillConfirmModal";

export default function Billing() {
  const [products, setProducts] = useState([])
  const [farmers, setFarmers] = useState([])
  const [farmerId, setFarmerId] = useState('')
  const [items, setItems] = useState([])
  const sigRef = useRef(null)
  const navigate = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false);


  useEffect(() => {
    (async () => {
      try {
        const [pRes, fRes] = await Promise.all([api.get('/products'), api.get('/farmers')])
        setProducts(pRes.data.products || [])
        setFarmers(fRes.data.farmers || [])
      } catch (err) {
        console.error(err)
      }
    })()
  }, [])

  const addItem = () => {
    setItems(prev => [...prev, { productId: '', qty: 1, unitPrice: 0, gstPercent: 0 }])
  }

  const updateItem = (idx, data) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...data } : it))
  }

  const removeItem = (idx) => {
    setItems(prev => prev.filter((_, i) => i !== idx))
  }

  const onProductChange = async (idx, productId) => {
    const p = products.find(x => x._id === productId)
    updateItem(idx, { productId, unitPrice: p?.price || 0, gstPercent: p?.gstPercent || 0 })
  }

  const submit = () => {
    if (!farmerId) return alert("Select farmer");
    if (items.length === 0) return alert("Add items");

    const signatureBase64 = sigRef.current?.getDataURL();

    if (!signatureBase64 || typeof signatureBase64 !== "string") {
      return alert("Please sign before creating bill");
    }

    if (!signatureBase64) return alert("Please sign");

    setShowConfirm(true);
  };


  const confirmCreateBill = async () => {
    for (const it of items) {
      if (!it.productId) {
        alert("Please select product for all items");
        return;
      }
    }
    try {
      const signatureBase64 = sigRef.current?.getDataURL();

      if (!signatureBase64 || typeof signatureBase64 !== "string") {
        return alert("Please sign before creating bill");
      }


      const payload = {
        farmerId,
        items: items.map((it) => ({
          productId: it.productId,
          qty: Number(it.qty),
          unitPrice: Number(it.unitPrice),
        })),
        paymentType: "cash",
        signatureBase64,
      };

      const res = await api.post('/billing', payload);

      const bill = res.data.bill;
      const pendingDue = res.data.pendingDueBeforeBill || 0;

      if (pendingDue > 0) {
        alert(`⚠️ WARNING: Farmer already has pending dues of ₹${pendingDue}`);
      }

      navigate(`/shop/invoice/${bill._id}`);

    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const canCreateBill = () => {
    if (!farmerId) return false;
    if (items.length === 0) return false;

    // every item must have product selected
    for (const it of items) {
      if (!it.productId) return false;
    }

    // signature must exist
    const sig = sigRef.current?.getDataURL();
    if (!sig || typeof sig !== "string") return false;

    return true;
  };


  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="bg-white p-4 rounded shadow mb-4">
          <h3 className="font-semibold mb-2">Billing</h3>
          <div className="mb-2">
            <label className="block mb-1">Farmer</label>
            <select value={farmerId} onChange={e => setFarmerId(e.target.value)}>
              <option value="">Select farmer</option>
              {farmers.map(f => <option key={f._id} value={f._id}>{f.name} — {f.village}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="p-2 border rounded">
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <ProductSelector products={products} value={it.productId} onChange={(v) => onProductChange(idx, v)} />
                  </div>
                  <div>
                    <label className="block text-sm">Qty</label>
                    <input type="number" value={it.qty} onChange={e => updateItem(idx, { qty: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm">Unit Price</label>
                    <input value={it.unitPrice} onChange={e => updateItem(idx, { unitPrice: Number(e.target.value) })} />
                  </div>
                  <div className="flex items-end">
                    <button className="btn-danger" onClick={() => removeItem(idx)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <button className="btn-primary mr-2" onClick={addItem}>Add Item</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Signature</h3>
          <SignaturePad ref={sigRef} />
          <div className="mt-2">
            <button className="mr-2" onClick={() => sigRef.current?.clear()}>Clear</button>
            <button
              className="btn-primary"
              disabled={!canCreateBill()}
              onClick={submit}
            >
              Create Bill & Invoice
            </button>
          </div>
        </div>
      </div>

      <div>
        <BillSummary items={items.map(it => ({ qty: it.qty, unitPrice: it.unitPrice, gstPercent: it.gstPercent }))} />
      </div>
      <BillConfirmModal
        open={showConfirm}
        farmer={farmers.find((f) => f._id === farmerId)}
        items={items}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmCreateBill}
      />

    </div>
  )
}
