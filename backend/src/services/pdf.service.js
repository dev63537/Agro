const PDFDocument = require("pdfkit");

/**
 * Generate Invoice PDF as BUFFER
 */
const generateInvoicePDFBuffer = async ({ bill, shop, farmer }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const buffer = Buffer.concat(chunks);
        resolve(buffer); // ✅ THIS IS THE KEY
      });

      // ===== PDF CONTENT =====
      doc.fontSize(18).text(shop.name || "Agro Billing", { align: "center" });
      doc.moveDown();

      doc.fontSize(12).text(`Invoice No: ${bill.billNo}`);
      doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString()}`);
      doc.moveDown();

      doc.text(`Farmer: ${farmer.name}`);
      doc.text(`Village: ${farmer.village || "-"}`);
      doc.moveDown();

      doc.text("Items:");
      doc.moveDown(0.5);

      bill.items.forEach((item, i) => {
        doc.text(
          `${i + 1}. ${item.name} | Qty: ${item.qty} | ₹${item.total.toFixed(2)}`
        );
      });

      doc.moveDown();
      doc.text(`Subtotal: ₹${bill.subTotal.toFixed(2)}`);
      doc.text(`GST: ₹${bill.gstTotal.toFixed(2)}`);
      doc.fontSize(14).text(`Total: ₹${bill.totalAmount.toFixed(2)}`);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateInvoicePDFBuffer,
};
