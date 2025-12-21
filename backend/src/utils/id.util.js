const Bill = require("../models/Bill");

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

function padNumber(num, size = 6) {
  return String(num).padStart(size, "0");
}

/**
 * Generate Bill Number
 * Format: 2025DEC-000001
 */
async function generateBillNo(shopId) {
  const now = new Date();

  const year = now.getFullYear();
  const month = MONTHS[now.getMonth()];
  const prefix = `${year}${month}`;

  // Find last bill of this shop for this month
  const lastBill = await Bill.findOne({
    shopId,
    billNo: { $regex: `^${prefix}-` }
  })
    .sort({ createdAt: -1 })
    .select("billNo");

  let nextSeq = 1;

  if (lastBill?.billNo) {
    const lastSeq = parseInt(
      lastBill.billNo.split("-")[1],
      10
    );
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  return `${prefix}-${padNumber(nextSeq)}`;
}

module.exports = {
  generateBillNo
};
