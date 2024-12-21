import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import dotenv from "dotenv";

import { checkDbConnection } from "./middleware/checkDbConnection";
import { errorHandler } from "./middleware/errorHandler"

import { userRoutes } from "./routes/userRoutes";
import { tripRoutes } from "./routes/tripRoutes";

// Load environment variables
dotenv.config();

// MongoDB connection
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/traktamente";
// console.log("MongoDB Connection String:", mongoUrl);  
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// Middleware to check MongoDB connection
app.use(checkDbConnection);

// Middleware Error handler
app.use(errorHandler);

// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);

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
