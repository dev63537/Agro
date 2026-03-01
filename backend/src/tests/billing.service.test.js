jest.mock('../../src/models/StockBatch', () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
}));

const StockBatch = require('../../src/models/StockBatch');
const { deductStockForItem } = require('../../src/services/billing.service');

describe('deductStockForItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('throws before mutating batches when total stock is insufficient', async () => {
    const batchA = { qty: 5, save: jest.fn().mockResolvedValue() };
    const batchB = { qty: 2, save: jest.fn().mockResolvedValue() };

    StockBatch.aggregate.mockResolvedValue([{ totalQty: 7 }]);
    StockBatch.find.mockReturnValue({
      sort: jest.fn().mockResolvedValue([batchA, batchB]),
    });

    await expect(
      deductStockForItem('shop-1', 'product-1', 8)
    ).rejects.toMatchObject({ status: 400, message: 'Insufficient stock' });

    expect(StockBatch.find).not.toHaveBeenCalled();
    expect(batchA.qty).toBe(5);
    expect(batchB.qty).toBe(2);
    expect(batchA.save).not.toHaveBeenCalled();
    expect(batchB.save).not.toHaveBeenCalled();
  });
});
