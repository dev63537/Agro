const startOfYear = (year) => new Date(`${year}-01-01T00:00:00Z`);
const endOfYear = (year) => new Date(`${year}-12-31T23:59:59Z`);

module.exports = { startOfYear, endOfYear };
