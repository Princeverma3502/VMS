import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// 1. Protect Middleware
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, token failed'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }
});

// 2. Admin Middleware
export const admin = asyncHandler(async (req, res, next) => {
  if (req.user) {
    if (req.user.isSuperAdmin === true) {
      return next();
    }

    const role = (req.user.role || '').toLowerCase().trim();
    if (role === 'secretary' || role === 'admin' || role === 'administrator') {
      return next();
    }
  }

  res.status(403);
  return next(new Error('Not authorized as an admin'));
});

// 3. Authorize Middleware — accepts specific allowed roles
export const authorize = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }

    if (req.user.isSuperAdmin) return next();

    const userRole = (req.user.role || '').toLowerCase().trim();
    const allowed = allowedRoles.map(r => r.toLowerCase().trim());

    if (!allowed.includes(userRole)) {
      res.status(403);
      return next(new Error(`User role '${req.user.role}' is not authorized`));
    }

    next();
  });
};