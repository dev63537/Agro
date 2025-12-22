const Product = require('../models/Product');

// ✅ List all products (shop scoped)
const listProducts = async (req, res) => {
  const products = await Product.find({
    shopId: req.shop._id,
  }).sort({ createdAt: -1 });

  res.json({ products });
};

// ✅ Get single product (for edit)
const getProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOne({
    _id: id,
    shopId: req.shop._id,
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ product });
};

// ✅ Create product
const createProduct = async (req, res) => {
  const { name, price } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price required' });
  }

  const product = await Product.create({
    ...req.body,
    shopId: req.shop._id,
  });

  res.status(201).json({ product });
};

// ✅ Update product
const updateProduct = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findOneAndUpdate(
    { _id: id, shopId: req.shop._id },
    req.body,
    { new: true }
  );

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json({ product });
};

module.exports = {
  listProducts,
  getProduct,     
  createProduct,
  updateProduct,
};
