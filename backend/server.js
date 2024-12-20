import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";
import listEndpoints from "express-list-endpoints";
import dotenv from "dotenv";

// Import models and middleware
import User from "./models/userModel";
import Trip from "./models/tripModel";
import { registerValidationRules, validate } from "./middleware/validation";
import { authenticateUser, authenticateAdmin } from "./middleware/auth";

// Load environment variables
dotenv.config();

// MongoDB connection
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/traktamente";
// console.log("MongoDB Connection String:", mongoUrl);  
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Reusable error handler
const handleMongoError = (error, res, message = "Database operation failed") => {
  console.error(error);
  res.status(500).json({ success: false, message, errors: error.message });
};

// Middleware to check MongoDB connection
app.use((req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: "Service unavailable." })
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// Routes

// Register endpoint | Create user with req.body
app.post(
  "/register",
  registerValidationRules,
  validate,
  async (req, res) => {
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
  }
);

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!password || (!username && !email)) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const user = username
      ? await User.findOne({ username })
      : await User.findOne({ email });

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
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Get all users (admin only)
app.get(
  "/users",
  authenticateUser,
  authenticateAdmin,
    async (req, res) => {
    try {
      const allUsers = await User.find();
      res.status(200).json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

// Get trips (admin sees all, users see their own)
app.get(
  "/trips",
  authenticateUser,
  async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const user = req.user;

      const filter = user.role === "admin" ? {} : { userId: user._id };
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
  }
);

// Create a new trip
app.post(
  "/trips",
  authenticateUser,
  async (req, res) => {
    try {
      const {
        title,
        location,
        tripDate,
        hotelBreakfastDays = 0,
        mileageKm = 0,
        status = "not submitted",
        calculatedData,
        submission = {}, // Allow submission field from request
      } = req.body;

      const user = req.user;

      const trip = new Trip({
        title,
        location,
        tripDate,
        hotelBreakfastDays,
        mileageKm,
        status,
        userID: user._id,
        creation: {
          createdBy: `${req.user.firstName} ${req.user.lastName}`,
          createdAt: new Date(),
        },
        calculatedData,
        submission: {
          updatedAt: submission.updatedAt || null,
          approvedBy: submission.approvedBy || null,
          approvedAt: submission.approvedAt || null,
        },        
      });

      const savedTrip = await trip.save();

      res.status(201).json({
        success: true,
        message: "Trip created successfully",
        data: savedTrip,
      });
    } catch (error) {
      handleMongoError(error, res, "Failed to create trip");
    }
  }
);

// Update trip
app.patch(
  "/trips/:id",
  authenticateUser,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const user = req.user;

      // Ensure the user is the owner of the trip or an admin
      const trip = await Trip.findById(id);

      if (!trip) {
        return res.status(404).json({ success: false, message: "Trip not found" });
      }

      // Ensure the user is the owner of the trip or an admin
      if (trip.userID.toString() !== user._id.toString() && user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // Apply updates
      Object.assign(trip, updates);
      trip.submission.updatedAt = new Date(); // Update the modification timestamp

      const updatedTrip = await trip.save();

      res.status(200).json({
        success: true,
        message: "Trip updated successfully",
        data: updatedTrip,
      });
    } catch (error) {
      handleMongoError(error, res, "Failed to update trip");
    }
  }
);

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
