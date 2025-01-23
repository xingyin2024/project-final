import User from '../models/userModel.js';
import bcrypt from 'bcrypt-nodejs';
import { handleMongoError } from '../utils/handleMongoError.js';

// POST (create) a new user
const registerUser = async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, role } = req.body;
    // DO NOT STORE PLAINTEXT PASSWORDS
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      role,
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: savedUser._id,
        accessToken: savedUser.accessToken,
      },
    });
  } catch (error) {
    handleMongoError(error, res, 'Could not create user');
  }
};

// POST login
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
    }

    const user = username
      ? await User.findOne({ username })
      : await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role, // Add role to response
          accessToken: user.accessToken,
        },
      });
    } else {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    handleMongoError(error, res, 'Failed to log in');
  }
};

const getUsers = async (req, res) => {
  try {
    const user = req.user;
    // Add authentication middleware to restrict access to admins
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const allUsers = await User.find();
    res.status(200).json({ success: true, data: allUsers });
  } catch (error) {
    handleMongoError(error, res, 'Failed to fetch users');
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    handleMongoError(error, res, 'Failed to fetch user');
  }
};

// PATCH user by ID
const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating password directly
    if (updates.password) {
      const salt = bcrypt.genSaltSync();
      updates.password = bcrypt.hashSync(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true, // Return the updated document
      runValidators: true, // Validate data before updating
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: updatedUser._id,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    handleMongoError(error, res, 'Failed to update user');
  }
};

// DELETE user by ID
const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: { id: deletedUser._id },
    });
  } catch (error) {
    handleMongoError(error, res, 'Failed to delete user');
  }
};

export {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
