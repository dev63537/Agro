const { shouldDisableRetryWrites } = require('../../src/config/db');

describe('shouldDisableRetryWrites', () => {
  test('returns true when retryWrites param is missing', () => {
    expect(
      shouldDisableRetryWrites('mongodb://localhost:27017/agro')
    ).toBe(true);
  });

  test('returns false when retryWrites is explicitly false', () => {
    expect(
      shouldDisableRetryWrites('mongodb://localhost:27017/agro?retryWrites=false')
    ).toBe(false);
  });

  test('returns true when retryWrites is true', () => {
    expect(
      shouldDisableRetryWrites('mongodb://localhost:27017/agro?retryWrites=true')
    ).toBe(true);
  });
});
