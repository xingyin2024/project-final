import User from "../models/userModel.js";
import bcrypt from "bcrypt-nodejs";
import { handleMongoError } from "../utils/handleMongoError.js";

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
      message: "User registered successfully",
      data: {
        id: savedUser._id,
        accessToken: savedUser.accessToken,
      },
    });
  } catch (error) {
    handleMongoError(error, res, "Could not create user");
  }
};

// POST login
const loginUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = username
      ? await User.findOne({ username })
      : await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user && bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          email: user.email,
          accessToken: user.accessToken,
        },
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    handleMongoError(error, res, "Failed to log in");
  }
};

const getUsers = async (req, res) => {
  try {
    const user = req.user;
    // Add authentication middleware to restrict access to admins
    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const allUsers = await User.find();
    res.status(200).json({ success: true, data: allUsers });
  } catch (error) {
    handleMongoError(error, res, "Failed to fetch users");
  }
};

export { registerUser, loginUser, getUsers };