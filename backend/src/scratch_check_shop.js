const mongoose = require('mongoose');
const Shop = require('./models/Shop');
require('dotenv').config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    const shops = await Shop.find({});
    console.log('Total shops found:', shops.length);
    for (const shop of shops) {
      console.log('Shop ID:', shop._id);
      console.log('Name:', shop.name);
      console.log('OwnerName:', shop.ownerName);
      console.log('Email:', shop.email);
      console.log('Phone:', shop.phone);
      console.log('Address:', shop.address);
      console.log('BusinessEmail:', shop.businessEmail);
      console.log('BusinessPhone:', shop.businessPhone);
      console.log('BusinessAddress:', shop.businessAddress);
      console.log('GST Number:', shop.gstNumber);
      console.log('GST Percent:', shop.gstPercent);
      console.log('Invoice Prefix:', shop.invoicePrefix);
      console.log('Invoice Footer:', shop.invoiceFooter);
      console.log('------------------------------');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
