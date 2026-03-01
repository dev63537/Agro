jest.mock('../../src/models/Bill', () => ({
  countDocuments: jest.fn(),
  create: jest.fn(),
}));
jest.mock('../../src/models/Product', () => ({
  findOne: jest.fn(),
}));
jest.mock('../../src/models/StockBatch', () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
}));
jest.mock('../../src/models/Farmer', () => ({
  findOne: jest.fn(),
}));
jest.mock('../../src/models/YearlyLedger', () => ({
  findOneAndUpdate: jest.fn(),
}));
jest.mock('../../src/services/s3.service', () => ({
  uploadBase64: jest.fn(),
  uploadBuffer: jest.fn(),
}));
jest.mock('../../src/services/pdf.service', () => ({
  generateInvoicePDFBuffer: jest.fn(),
}));
jest.mock('../../src/utils/id.util', () => ({
  generateBillNo: jest.fn(),
}));

const Farmer = require('../../src/models/Farmer');
const Product = require('../../src/models/Product');
const StockBatch = require('../../src/models/StockBatch');
const { createBill } = require('../../src/services/billing.service');

describe('createBill validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('rejects invalid item quantity before stock deduction', async () => {
    Farmer.findOne.mockResolvedValue({ _id: 'farmer-1', active: true, toObject: () => ({}) });
    Product.findOne.mockResolvedValue({
      _id: 'product-1',
      shopId: 'shop-1',
      name: 'Urea',
      price: 100,
      gstPercent: 5,
    });

    await expect(
      createBill({
        shop: { _id: 'shop-1', plan: 'FREE', toObject: () => ({}) },
        farmerId: 'farmer-1',
        items: [{ productId: 'product-1', qty: 0 }],
      })
    ).rejects.toMatchObject({ status: 400, message: 'Invalid item quantity' });

    expect(StockBatch.aggregate).not.toHaveBeenCalled();
  });
});
