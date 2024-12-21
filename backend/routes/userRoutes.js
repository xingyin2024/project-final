import express from "express";
import { registerUser, loginUser, getUsers } from "../controllers/userController";
import { registerValidationRules, validate } from "../middleware/validation";
import { authenticateUser } from "./middleware/auth";

const router = express.Router();

// Register endpoint | Create user with req.body
router.post("/register", registerValidationRules, validate, registerUser);

// Login endpoint
router.post("/login", loginUser);

// Get all users (admin only)
router.get("/", authenticateUser, getUsers);

export { router as userRoutes };