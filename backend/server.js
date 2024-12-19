import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import dotenv from "dotenv";

dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/traktamente";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const port = process.env.PORT || 8080;
const app = express();

app.use(cors());
app.use(express.json());

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
