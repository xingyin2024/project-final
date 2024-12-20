import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt-nodejs";
import crypto from "crypto";
import listEndpoints from "express-list-endpoints";
import dotenv from "dotenv"; // Import dotenv for environment variables

dotenv.config();// Load environment variables from the .env file

// Defining port and connecting to mongoose
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/traktamente";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// Defining schema for a User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "co-worker"],
    default:"co-worker"
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex"),
  }
});

const User = mongoose.model("User", userSchema);







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

// Routes
app.get("/users", (req, res) => {
  res.json({ message: "this is the users data api" })
});

app.post("/users", async (req, res) => {
  try {
    const { username, password, firstName, lastName, email, role } = req.body;
    // DO NOT STORE PLAINTEXT PASSWORDS
    const salt = bcrypt.genSaltSync();
    const user = new User({ username, password: bcrypt.hashSync(password, salt), firstName, lastName, email, role })
    user.save()
    res.status(201).json({
      success: true,
      message: "User created",
      id: user._id,
      accessToken: user.accessToken,
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not create user",
      errors: error,
    })
  }
});

app.get("/secrets", (req, res) => {
  res.json({ message: "this is a secret message" })
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
