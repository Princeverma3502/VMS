import asyncHandler from 'express-async-handler';

export const superAdminProtect = asyncHandler(async (req, res, next) => {
  // Assuming 'protect' middleware already ran and attached req.user
  if (req.user && req.user.isSuperAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('⛔ ACCESS DENIED: Super Admin privileges required.');
  }
});