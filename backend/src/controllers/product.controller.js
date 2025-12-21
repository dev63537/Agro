const Product = require('../models/Product');

const listProducts = async (req, res) => {
  const products = await Product.find({
    shopId: req.shop._id, 
  }).sort({ createdAt: -1 });

  res.json({ products });
};



const createProduct = async (req, res) => {
  const { name, sku, unit, price, gstPercent, category, description } = req.body;
  if (!name || (price === undefined)) return res.status(400).json({ error: 'name and price required' });

  const product = await Product.create({
    ...req.body,
    shopId: req.shop._id,
  });


  res.status(201).json({ product });
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const product = await Product.findOneAndUpdate({ _id: id, shopId: req.shopId }, data, { new: true });
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
};

module.exports = { listProducts, createProduct, updateProduct };
