const calculateGST = (amount, gstPercent) => {
  const gst = (amount * gstPercent) / 100;
  return gst;
};

module.exports = { calculateGST };
