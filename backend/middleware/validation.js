import { check, validationResult } from "express-validator";

// Validation rules for user registration
const registerValidationRules = [
  check("username")
    .isLength({ min: 2 })
    .withMessage("Username is too short"),
  check("email")
    .isEmail()
    .withMessage("Invalid email"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export { registerValidationRules, validate };
