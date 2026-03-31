// Middleware to enforce multi-tenancy: ensures `collegeId` is present and matches the authenticated user
export const requireCollegeForWrite = (req, res, next) => {
  // For safety, allow read-only routes to stay public; enforce on POST/PUT/DELETE
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  // If authenticated user exists and has collegeId, enforce it logically
  if (req.user && req.user.collegeId) {
    if (!req.body) req.body = {};
    
    // Prevent overriding to another collegeId unless superAdmin
    if (req.body.collegeId && 
        req.body.collegeId.toString() !== req.user.collegeId.toString() && 
        !req.user.isSuperAdmin) {
      res.status(403);
      return next(new Error('Cannot write data for a different college or tenant'));
    }
    
    // Enforce their own collegeId
    req.body.collegeId = req.user.collegeId;
    return next();
  }

  // If no authenticated user, require explicit collegeId in body
  if (req.body && req.body.collegeId) return next();

  res.status(403);
  return next(new Error('collegeId required'));
};

export default { requireCollegeForWrite };
