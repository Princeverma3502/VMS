import { body, validationResult } from 'express-validator';

export const ngoValidation = [
  body('name')
    .not()
    .isEmpty()
    .withMessage('NGO Name is required')
    .trim(),

  body('description')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];