const PDFDocument = require('pdfkit');
const streamBuffers = require('stream-buffers');

const generateInvoicePDFBuffer = async ({ bill, shop, farmer }) => {
  // bill: Bill mongoose doc or plain object
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const writableStreamBuffer = new streamBuffers.WritableStreamBuffer({
    initialSize: (100 * 1024),   // start at 100 kilobytes.
    incrementAmount: (10 * 1024) // grow by 10 kilobytes each time buffer overflows.
  });

  doc.pipe(writableStreamBuffer);

  // Header
  doc.fontSize(18).text(shop.name || 'Shop', { align: 'left' });
  doc.fontSize(10).text(shop.address || '', { align: 'left' });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice: ${bill.billNo}`, { align: 'right' });
  doc.text(`Date: ${new Date(bill.createdAt).toLocaleString()}`, { align: 'right' });
  doc.moveDown();

  doc.fontSize(12).text('Bill To:', { underline: true });
  doc.fontSize(10).text(`${farmer.name}`);
  if (farmer.village) doc.text(`${farmer.village}`);
  if (farmer.phone) doc.text(`Phone: ${farmer.phone}`);
  doc.moveDown();

  // Table headers
  doc.fontSize(10);
  const tableTop = doc.y;
  doc.text('Item', 40, tableTop);
  doc.text('Qty', 300, tableTop);
  doc.text('Unit Price', 350, tableTop, { width: 80, align: 'right' });
  doc.text('GST%', 440, tableTop, { width: 40, align: 'right' });
  doc.text('Total', 480, tableTop, { width: 80, align: 'right' });
  doc.moveDown();

  // Items
  bill.items.forEach((it) => {
    const y = doc.y;
    doc.text(it.name, 40, y);
    doc.text(it.qty.toString(), 300, y);
    doc.text(it.unitPrice.toFixed(2), 350, y, { width: 80, align: 'right' });
    doc.text(it.gstPercent.toFixed(2), 440, y, { width: 40, align: 'right' });
    doc.text(it.total.toFixed(2), 480, y, { width: 80, align: 'right' });
    doc.moveDown();
  });

  doc.moveDown(1);
  doc.text(`Subtotal: ${bill.subTotal.toFixed(2)}`, { align: 'right' });
  doc.text(`GST: ${bill.gstTotal.toFixed(2)}`, { align: 'right' });
  doc.text(`Total: ${bill.totalAmount.toFixed(2)}`, { align: 'right' });

  doc.moveDown(2);
  if (bill.signatureUrl) {
    try {
      // signatureUrl might be an absolute URL or a local path. For local path we may need to read file.
      if (bill.signatureUrl.startsWith('/uploads')) {
        // attempt to embed local file
        const fs = require('fs');
        const path = require('path');
        const localPath = path.join(__dirname, '..', '..', bill.signatureUrl);
        if (fs.existsSync(localPath)) {
          doc.text('Signature:', { align: 'left' });
          doc.image(localPath, { width: 200 });
        }
      } else {
        // remote URL not embedded (pdfkit can't embed remote without download). Skip embedding remote.
        doc.text('Signature: (attached)', { align: 'left' });
      }
    } catch (err) {
      // ignore signature embedding errors
    }
  }

  doc.end();

  const buffer = writableStreamBuffer.getContents();
  return buffer;
};

module.exports = { generateInvoicePDFBuffer };
