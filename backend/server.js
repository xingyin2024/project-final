import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";
import listEndpoints from "express-list-endpoints";
import dotenv from "dotenv"; // Import dotenv for environment variables

import { User } from "./models/userModel";
import { registerValidationRules, validate } from "./middleware/validation";
import { authenticateUser, authenticateAdmin } from "./middleware/auth";

dotenv.config();// Load environment variables from the .env file

// Defining port and connecting to mongoose
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/traktamente";
// console.log("MongoDB Connection String:", mongoUrl);  
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: "Service unavailable." })
  }
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Routes

// Endpoint for Register | Create user with req.body
app.post("/register", registerValidationRules, validate);
app.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, role } = req.body;
    // DO NOT STORE PLAINTEXT PASSWORDS
    const salt = bcrypt.genSaltSync();
    const hashedPassword=bcrypt.hashSync(password, salt)
    const user = new User({
      username,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      role,
    });

    user.save()
    res.status(201).json({
      success: true,
      message: "Register successfully",
      id: user._id,
      accessToken: user.accessToken,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not create user",
      errors: error.message,
    })
  }
});

// Endpoint for login
app.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = username
      ? await User.findOne({ username })
      : await User.findOne({ email });

    if (user && bcrypt.compareSync(password, user.password)) {
      return res.status(200).json({
        id: user._id,
        username: user.username,
        firstName: user.firstName,
        email: user.email,
        accessToken: user.accessToken,
      });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get all users only allowned for admin user
app.get("/users", authenticateUser, authenticateAdmin);
app.get("/users", async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Route for create trips
app.get("/trips", authenticateUser);
app.get("/trips", async (req, res) => {
  try {
    const { userId, status, page = 1, limit = 10 } = req.query;

    const filter = userId ? { userId } : {};
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalTrips = await Trip.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: trips,
      currentPage: Number(page),
      totalPages: Math.ceil(totalTrips / limit),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trips" });
  }
});

// App endpoints documentation
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app);
  res.send({
    message: "Welcome to my API endpoints - Traktamente",
    endpoints: endpoints,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
