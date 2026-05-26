const Shop = require('../models/Shop');

// GET /api/shops/settings — get current shop's settings
exports.getSettings = async (req, res) => {
  try {
    const shop = await Shop.findById(req.shop._id).select(
      'name ownerName email phone address gstNumber gstPercent businessAddress businessPhone businessEmail invoicePrefix invoiceFooter logoUrl plan status expiryDate'
    );
    if (!shop) return res.status(404).json({ error: 'Shop not found' });
    res.json({ shop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/shops/settings — update shop business/GST settings
exports.updateSettings = async (req, res) => {
  try {
    const allowed = [
      'gstNumber', 'gstPercent', 'businessAddress',
      'businessPhone', 'businessEmail', 'invoicePrefix',
      'invoiceFooter', 'logoUrl', 'ownerName', 'phone', 'address',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Validate gstPercent range
    if (updates.gstPercent !== undefined) {
      const g = Number(updates.gstPercent);
      if (isNaN(g) || g < 0 || g > 100)
        return res.status(400).json({ error: 'gstPercent must be 0–100' });
      updates.gstPercent = g;
    }

    const shop = await Shop.findByIdAndUpdate(
      req.shop._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Settings saved successfully!', shop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
