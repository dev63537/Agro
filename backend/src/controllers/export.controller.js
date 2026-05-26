/**
 * Simple CSV/Excel export controller — no external libs needed.
 * Exports bills, farmers, and stock as CSV (opens in Excel).
 */
const Bill         = require('../models/Bill');
const Farmer       = require('../models/Farmer');
const StockBatch   = require('../models/StockBatch');
const YearlyLedger = require('../models/YearlyLedger');

// Helper: convert array of objects to CSV string
function toCSV(headers, rows) {
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const str = String(v).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str}"`
      : str;
  };
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ];
  return lines.join('\r\n');
}

function sendCSV(res, filename, csv) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send('\uFEFF' + csv); // BOM for Excel UTF-8
}

// 🔹 Export Bills
exports.exportBills = async (req, res) => {
  try {
    const { from, to, status } = req.query;
    const query = { shopId: req.shopId || req.shop._id };
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to)   { const d = new Date(to); d.setHours(23,59,59,999); query.createdAt.$lte = d; }
    }
    if (status && status !== 'all') query.paymentStatus = status;

    const bills = await Bill.find(query)
      .populate('farmerId', 'name village phone farmerCode')
      .sort({ createdAt: -1 });

    const headers = ['billNo','date','farmerName','village','phone','farmerCode','totalAmount','amountPaid','balanceDue','paymentStatus','paymentType','itemCount'];
    const rows = bills.map((b) => ({
      billNo:        b.billNo,
      date:          new Date(b.createdAt).toLocaleDateString('en-IN'),
      farmerName:    b.farmerId?.name || '',
      village:       b.farmerId?.village || '',
      phone:         b.farmerId?.phone || '',
      farmerCode:    b.farmerId?.farmerCode || '',
      totalAmount:   b.totalAmount,
      amountPaid:    b.amountPaid || 0,
      balanceDue:    b.balanceDue || 0,
      paymentStatus: b.paymentStatus || 'unpaid',
      paymentType:   b.paymentType || '',
      itemCount:     (b.items || []).length,
    }));

    const date = new Date().toISOString().split('T')[0];
    sendCSV(res, `bills_export_${date}.csv`, toCSV(headers, rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Export Farmers
exports.exportFarmers = async (req, res) => {
  try {
    const shopId = req.shopId || req.shop._id;
    const farmers = await Farmer.find({ shopId }).sort({ name: 1 });

    const headers = ['farmerCode','name','phone','village','active','creditLimit','pendingDues'];
    const rows = farmers.map((f) => ({
      farmerCode:  f.farmerCode || '',
      name:        f.name,
      phone:       f.phone || '',
      village:     f.village || '',
      active:      f.active ? 'Yes' : 'No',
      creditLimit: f.creditLimit || 0,
      pendingDues: f.pendingDues || 0,
    }));

    const date = new Date().toISOString().split('T')[0];
    sendCSV(res, `farmers_export_${date}.csv`, toCSV(headers, rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Export Stock
exports.exportStock = async (req, res) => {
  try {
    const shopId = req.shopId || req.shop._id;
    const stock = await StockBatch.find({ shopId })
      .populate('productId', 'name unit price lowStockThreshold')
      .sort({ createdAt: -1 });

    const headers = ['productName','unit','batchPrice','qty','purchaseDate','expiryDate','lowStockThreshold'];
    const rows = stock.map((s) => ({
      productName:       s.productId?.name || '',
      unit:              s.productId?.unit || '',
      batchPrice:        s.pricePerUnit || s.productId?.price || '',
      qty:               s.qty,
      purchaseDate:      new Date(s.createdAt).toLocaleDateString('en-IN'),
      expiryDate:        s.expiryDate ? new Date(s.expiryDate).toLocaleDateString('en-IN') : '',
      lowStockThreshold: s.productId?.lowStockThreshold || 10,
    }));

    const date = new Date().toISOString().split('T')[0];
    sendCSV(res, `stock_export_${date}.csv`, toCSV(headers, rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Export Outstanding Dues
exports.exportDues = async (req, res) => {
  try {
    const shopId = req.shopId || req.shop._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const ledgers = await YearlyLedger.find({ shopId, year, totalDue: { $gt: 0 } })
      .populate('farmerId', 'name phone village farmerCode')
      .sort({ totalDue: -1 });

    const headers = ['farmerCode','farmerName','village','phone','year','totalDue','status'];
    const rows = ledgers
      .filter(l => l.farmerId)
      .map((l) => ({
        farmerCode: l.farmerId.farmerCode || '',
        farmerName: l.farmerId.name,
        village:    l.farmerId.village || '',
        phone:      l.farmerId.phone || '',
        year:       l.year,
        totalDue:   l.totalDue,
        status:     l.status,
      }));

    const date = new Date().toISOString().split('T')[0];
    sendCSV(res, `outstanding_dues_${year}_${date}.csv`, toCSV(headers, rows));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
