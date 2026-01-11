import { body, validationResult } from 'express-validator';

// Validation Rules for Registration
export const registerValidation = [
  body('name')
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .trim()
    .escape(),
  
  body('email')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  // Middleware to check errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation Rules for Login
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please include a valid email'),
  
  body('password')
    .exists()
    .withMessage('Password is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];