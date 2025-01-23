import express from 'express';
import {
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateUser, getUsers);

// Get user by ID
router.get('/:id', authenticateUser, getUserById);

// Update user by ID
router.patch('/:id', authenticateUser, updateUserById);

// Delete user by ID
router.delete('/:id', authenticateUser, deleteUserById);

export { router as userRoutes };
