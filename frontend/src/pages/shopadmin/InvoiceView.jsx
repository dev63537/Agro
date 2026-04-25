import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/apiClient";
import { useAuth } from "../../hooks/useAuth";

export default function InvoiceView() {
  const { id } = useParams();
  const { user } = useAuth();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  const shopName = user?.shop?.name || "Shop";

  useEffect(() => {
    async function fetchBill() {
      try {
        const res = await api.get(`/billing/${id}`);
        setBill(res.data.bill);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchBill();
  }, [id]);

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 skeleton rounded" />
      <div className="h-96 skeleton rounded-xl" />
    </div>
  );

  if (!bill) return (
    <div className="empty-state">
      <div className="empty-state-icon">📄</div>
      <div className="empty-state-title">Invoice not found</div>
      <div className="empty-state-message">This invoice may have been deleted or doesn't exist.</div>
      <Link to="/shop/billing" className="btn-primary">Back to Billing</Link>
    </div>
  );

  const subTotal = bill.subTotal || 0;
  const gstTotal = bill.gstTotal || 0;
  const totalAmount = bill.totalAmount || 0;

  return (
    <div>
      {/* Actions (hidden on print) */}
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">Invoice {bill.billNo}</h1>
          <p className="text-sm text-secondary-400 mt-1">Created on {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="btn-primary">
            🖨️ Print Invoice
          </button>
          <Link to="/shop/billing" className="btn-ghost">← Back</Link>
        </div>
      </div>

      {/* Invoice Card */}
      <div className="invoice-container card max-w-3xl mx-auto">
        <div className="card-body p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-primary-500">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl shadow-md">
                  🌾
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">{shopName}</h2>
                  <p className="text-sm text-secondary-400">Agro Billing System</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-primary-700">INVOICE</h3>
              <p className="text-sm text-secondary-500 mt-1">#{bill.billNo}</p>
              <p className="text-sm text-secondary-500">
                {new Date(bill.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Farmer + Payment Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">Bill To</p>
              <p className="font-semibold text-secondary-900 text-lg">{bill.farmerId?.name || bill.farmerId || '—'}</p>
              {bill.farmerId?.village && <p className="text-sm text-secondary-500">{bill.farmerId.village}</p>}
              {bill.farmerId?.phone && <p className="text-sm text-secondary-500">📞 {bill.farmerId.phone}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-secondary-400 uppercase tracking-wider mb-2">Payment Status</p>
              {bill.paymentType === 'pending' ? (
                <span className="badge-danger text-sm px-3 py-1">⏳ Pending</span>
              ) : (
                <span className="badge-success text-sm px-3 py-1">✅ Paid ({bill.paymentType})</span>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="table-container mb-8">
            <table className="table">
              <thead>
                <tr className="bg-primary-50">
                  <th className="text-primary-800">#</th>
                  <th className="text-primary-800">Item</th>
                  <th className="text-primary-800 text-right">Qty</th>
                  <th className="text-primary-800 text-right">Price</th>
                  <th className="text-primary-800 text-right">GST %</th>
                  <th className="text-primary-800 text-right">GST ₹</th>
                  <th className="text-primary-800 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {(bill.items || []).map((item, idx) => {
                  const lineAmount = (item.qty || 0) * (item.unitPrice || 0);
                  const lineGst = (lineAmount * (item.gstPercent || 0)) / 100;
                  return (
                    <tr key={idx}>
                      <td className="text-secondary-400">{idx + 1}</td>
                      <td className="font-medium text-secondary-800">{item.name || '—'}</td>
                      <td className="text-right">{item.qty}</td>
                      <td className="text-right">₹{(item.unitPrice || 0).toFixed(2)}</td>
                      <td className="text-right">{item.gstPercent || 0}%</td>
                      <td className="text-right">₹{lineGst.toFixed(2)}</td>
                      <td className="text-right font-semibold">₹{(item.total || lineAmount + lineGst).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">Subtotal</span>
                <span className="font-medium">₹ {subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-500">GST Total</span>
                <span className="font-medium">₹ {gstTotal.toFixed(2)}</span>
              </div>
              <hr className="border-surface-200" />
              <div className="flex justify-between text-xl font-bold">
                <span className="text-secondary-800">Grand Total</span>
                <span className="text-primary-700">₹ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-surface-200">
            <div>
              <div className="h-16 border-b-2 border-secondary-300 mb-2"></div>
              <p className="text-xs text-secondary-400">Authorized Signature</p>
            </div>
            <div>
              <div className="h-16 border-b-2 border-secondary-300 mb-2"></div>
              <p className="text-xs text-secondary-400">Customer Signature</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-surface-200 text-center">
            <p className="text-xs text-secondary-400">Thank you for your business! • This is a computer-generated invoice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
