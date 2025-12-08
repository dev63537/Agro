import React from 'react'

export default function PDFViewer({ url }) {
  if (!url) return null
  return (
    <div className="bg-white p-4 rounded shadow">
      <iframe src={url} title="Invoice" width="100%" height="600px" />
    </div>
  )
}
