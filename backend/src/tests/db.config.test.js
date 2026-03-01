const { shouldDisableRetryWrites, buildMongoUri } = require('../../src/config/db');

describe('db config helpers', () => {
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

  describe('buildMongoUri', () => {
    test('adds retryWrites=false when missing', () => {
      expect(buildMongoUri('mongodb://localhost:27017/agro')).toBe(
        'mongodb://localhost:27017/agro?retryWrites=false'
      );
    });

    test('preserves retryWrites=false when already present', () => {
      expect(buildMongoUri('mongodb://localhost:27017/agro?retryWrites=false')).toBe(
        'mongodb://localhost:27017/agro?retryWrites=false'
      );
    });

    test('overrides retryWrites=true to false', () => {
      expect(buildMongoUri('mongodb://localhost:27017/agro?retryWrites=true')).toBe(
        'mongodb://localhost:27017/agro?retryWrites=false'
      );
    });
  });
});
