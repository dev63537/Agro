const Farmer = require('../models/Farmer');

// LIST
const listFarmers = async (req, res) => {
  const farmers = await Farmer.find({
    shopId: req.shop._id,
    isDeleted: { $ne: true }, // #17 exclude soft-deleted
  }).lean().sort({ createdAt: -1 });

  const YearlyLedger = require('../models/YearlyLedger');
  const ledgers = await YearlyLedger.find({
    shopId: req.shop._id,
    totalDue: { $gt: 0 }
  }).lean();

  const farmerDuesMap = ledgers.reduce((acc, l) => {
    const fId = l.farmerId.toString();
    acc[fId] = (acc[fId] || 0) + l.totalDue;
    return acc;
  }, {});

  const result = farmers.map(f => ({
    ...f,
    pendingDues: farmerDuesMap[f._id.toString()] || 0
  }));

  res.json({ farmers: result });
};

// GET SINGLE (FOR EDIT)
const getFarmer = async (req, res) => {
  const { id } = req.params;

  const farmer = await Farmer.findOne({
    _id: id,
    shopId: req.shop._id,
  });

  if (!farmer) {
    return res.status(404).json({ error: 'Farmer not found' });
  }

  res.json({ farmer });
};

// CREATE
const createFarmer = async (req, res) => {
  const { name, phone, village, address } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name required' });
  }

  // Auto-generate farmer code (F-001, F-002, etc.)
  const farmerCount = await Farmer.countDocuments({ shopId: req.shop._id });
  const farmerCode = `F-${String(farmerCount + 1).padStart(3, '0')}`;

  const farmer = await Farmer.create({
    name,
    phone,
    village,
    address,
    farmerCode,
    shopId: req.shop._id,
  });

  res.status(201).json({ farmer });
};

// UPDATE
const updateFarmer = async (req, res) => {
  const { id } = req.params;

  const farmer = await Farmer.findOneAndUpdate(
    { _id: id, shopId: req.shop._id },
    req.body,
    { new: true }
  );

  if (!farmer) {
    return res.status(404).json({ error: 'Farmer not found' });
  }

  res.json({ farmer });
};

// SEND REMINDER
const sendReminder = async (req, res) => {
  const { id } = req.params;

  const farmer = await Farmer.findOne({
    _id: id,
    shopId: req.shop._id,
  });

  if (!farmer) {
    return res.status(404).json({ error: 'Farmer not found' });
  }

  // Integration point for SMS/WhatsApp
  console.log(`[MOCK] Reminder sent to farmer ${farmer.name} (${farmer.phone})`);

  res.json({ message: 'Reminder sent successfully' });
};

// SOFT DELETE (#17)
const deleteFarmer = async (req, res) => {
  const { id } = req.params;
  const farmer = await Farmer.findOne({ _id: id, shopId: req.shop._id });
  if (!farmer) return res.status(404).json({ error: 'Farmer not found' });

  // Block if they have pending dues
  if ((farmer.pendingDues || 0) > 0) {
    return res.status(400).json({
      error: `Cannot delete ${farmer.name} — they have pending dues of ₹${farmer.pendingDues.toLocaleString()}. Clear dues first.`
    });
  }

  farmer.isDeleted = true;
  farmer.deletedAt = new Date();
  farmer.active    = false;
  await farmer.save();

  res.json({ message: `${farmer.name} has been removed. Their billing history is preserved.` });
};

module.exports = {
  listFarmers,
  getFarmer,
  createFarmer,
  updateFarmer,
  sendReminder,
  deleteFarmer,
};
