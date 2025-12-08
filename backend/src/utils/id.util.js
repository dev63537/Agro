const Bill = require('../models/Bill');
const Shop = require('../models/Shop');

/**
 * Generate sequential bill number per shop: SHOPCODE-YYYY-XXXX
 * We generate by counting bills for current year and incrementing.
 */
const generateBillNo = async (shopId) => {
  const shop = await Shop.findById(shopId);
  const code = (shop && shop.code) ? shop.code.toUpperCase() : `SHOP${String(shopId).slice(-4).toUpperCase()}`;
  const year = new Date().getFullYear();
  const count = await Bill.countDocuments({ shopId, createdAt: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) } });
  const seq = (count + 1).toString().padStart(4, '0');
  return `${code}-${year}-${seq}`;
};

module.exports = { generateBillNo };
