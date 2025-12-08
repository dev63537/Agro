import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../lib/apiClient'
import PDFViewer from '../../components/PDFViewer'

export default function InvoiceView() {
  const { id } = useParams()
  const [bill, setBill] = useState(null)

  useEffect(()=> {
    (async ()=> {
      try {
        const res = await api.get(`/billing/${id}`)
        setBill(res.data.bill)
      } catch (err) {
        console.error(err)
      }
    })()
  }, [id])

  if (!bill) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Invoice {bill.billNo}</h2>
      <div className="mb-4">
        <a href={bill.invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-600">Open PDF</a>
      </div>
      <PDFViewer url={bill.invoiceUrl} />
    </div>
  )
}
