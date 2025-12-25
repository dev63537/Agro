import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../lib/apiClient";

export default function InvoiceView() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div>Loading invoice...</div>;
  if (!bill) return <div>Invoice not found</div>;

  return (
    <div className="bg-white p-6 rounded shadow max-w-xl">
      <h2 className="text-xl font-bold mb-2">
        Invoice {bill.billNo}
      </h2>

      <div className="mb-2">
        <strong>Total:</strong> ₹{bill.totalAmount}
      </div>

      {bill.invoiceUrl && (
        <a
          href={`http://localhost:4000${bill.invoiceUrl}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open PDF
        </a>
      )}
    </div>
  );
}
