import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";
import { registerValidationRules, validate } from "../middleware/validation.js";

const router = express.Router();

// Register endpoint | Create user with req.body
router.post("/register", registerValidationRules, validate, registerUser);

// Login endpoint
router.post("/login", loginUser);

export { router as authRoutes };