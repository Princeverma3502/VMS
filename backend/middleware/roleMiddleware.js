// Middleware to accept an array of allowed roles
// Usage: allowRoles('Secretary', 'Domain Head')
export const allowRoles = (...roles) => {
  return (req, res, next) => {
    // req.user is set by the previous 'protect' middleware
    if (!req.user) {
      res.status(401);
      throw new Error('User not authenticated');
    }

    // Case-insensitive role matching
    const userRole = (req.user.role || '').toLowerCase().trim();
    const allowed = roles.map(r => (r || '').toLowerCase().trim());

    if (!allowed.includes(userRole)) {
      res.status(403); // 403 Forbidden
      throw new Error(`User role '${req.user.role}' is not authorized to access this route.`);
    }

    next();
  };
};