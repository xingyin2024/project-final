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

const port = process.env.PORT || 8080;
const app = express();

// Middlewares to enable cors and json body parsing
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
