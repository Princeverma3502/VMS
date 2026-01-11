import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 1. Protect Middleware
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      next();
    } catch (error) {
      console.error("Protect Middleware Error:", error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

// 2. Admin Middleware (DEBUG MODE ENABLED)
export const admin = (req, res, next) => {
  // 1. Log what the server sees (Check your terminal for this!)
  console.log("------------------------------------------------");
  console.log("🛡️ ADMIN CHECK INITIATED");
  console.log("User Name:", req.user?.name);
  console.log("User Role (DB):", req.user?.role);
  console.log("Is SuperAdmin?", req.user?.isSuperAdmin);
  console.log("------------------------------------------------");

  if (req.user) {
    // 2. Check for Super Admin Flag
    if (req.user.isSuperAdmin === true) {
      console.log("✅ Access Granted (Super Admin)");
      return next();
    }

    // 3. Robust Role Check (Case Insensitive & Trimmed)
    // This handles "Secretary", "secretary", "Admin", "admin ", etc.
    const role = (req.user.role || "").toLowerCase().trim();
    
    if (role === 'secretary' || role === 'admin' || role === 'administrator') {
      console.log("✅ Access Granted (Role Match)");
      return next();
    }
  }

  // 4. Deny Access
  console.log("❌ Access Denied: User is not an admin.");
  res.status(403);
  throw new Error('Not authorized as an admin');
};

// 3. Authorize Middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized');
    }

    if (req.user.isSuperAdmin) return next();

    const userRole = (req.user.role || "").toLowerCase().trim();
    const allowed = allowedRoles.map(r => r.toLowerCase().trim());

    if (!allowed.includes(userRole)) {
      res.status(403);
      throw new Error(`User role '${req.user.role}' is not authorized`);
    }

    next();
  };
};