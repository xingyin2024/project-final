const express = require('express');
const { registerUser, loginUser } = require('../controllers/userController');
const router = express.Router();

// Registration Route
router.post('/register', registerUser);

// Login Route
router.post('/login', loginUser);

export { router as userRoutes};
