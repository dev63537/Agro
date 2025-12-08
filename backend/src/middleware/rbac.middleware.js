const permit = (...allowedRoles) => (req, res, next) => {
  const role = (req.user && req.user.role) || 'anonymous';
  if (allowedRoles.includes(role)) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden - insufficient permissions' });
};

module.exports = { permit };

