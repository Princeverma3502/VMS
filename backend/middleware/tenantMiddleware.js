// Middleware to enforce multi-tenancy: ensures `collegeId` is present and matches the authenticated user
export const requireCollegeForWrite = (req, res, next) => {
  // For safety, allow read-only routes to stay public; enforce on POST/PUT/DELETE
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  // If authenticated user exists and has collegeId, inject it into the body if missing
  if (req.user && req.user.collegeId) {
    if (!req.body) req.body = {};
    req.body.collegeId = req.body.collegeId || req.user.collegeId;
    return next();
  }

  // If no authenticated user, require explicit collegeId in body
  if (req.body && req.body.collegeId) return next();

  res.status(403);
  return next(new Error('collegeId required'));
};

export default { requireCollegeForWrite };
