import asyncHandler from 'express-async-handler';

// Middleware to accept an array of allowed roles
// Usage: allowRoles('Secretary', 'Domain Head')
export const allowRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    // req.user is set by the previous 'protect' middleware
    if (!req.user) {
      res.status(401);
      return next(new Error('User not authenticated'));
    }

    // Super admin bypasses all role checks
    if (req.user.isSuperAdmin) return next();

    // Case-insensitive role matching
    const userRole = (req.user.role || '').toLowerCase().trim();
    const allowed = roles.map(r => (r || '').toLowerCase().trim());

    if (!allowed.includes(userRole)) {
      res.status(403);
      return next(new Error(`User role '${req.user.role}' is not authorized to access this route.`));
    }

    next();
  });
};