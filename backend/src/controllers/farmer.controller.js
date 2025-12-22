const Farmer = require('../models/Farmer');

const listFarmers = async (req, res) => {
  const farmers = await Farmer.find({
    shopId: req.shop._id, // ✅ FIX
  }).sort({ createdAt: -1 });

  res.json({ farmers });
};

const createFarmer = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const farmer = await Farmer.create({
    ...req.body,
    shopId: req.shop._id,
  });

  res.status(201).json({ farmer });
};

const updateFarmer = async (req, res) => {
  const { id } = req.params;

  const farmer = await Farmer.findOneAndUpdate(
    { _id: id, shopId: req.shop._id }, // ✅ FIX
    req.body,
    { new: true }
  );

  if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
  res.json({ farmer });
};

module.exports = { listFarmers, createFarmer, updateFarmer };
