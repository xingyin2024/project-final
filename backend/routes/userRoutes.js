import express from "express";
import { getUsers } from "../controllers/userController.js";
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get("/", authenticateUser, getUsers);

export { router as userRoutes };