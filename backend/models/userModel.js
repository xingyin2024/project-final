import mongoose from "mongoose";
import crypto from "crypto";

// Defining schema for a User
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength:[2, "Username must be at least 2 characters long"]
  },
  password: {
    type: String,
    required: true,   
    minlength:[6, "Password must be at least 6 characters long"]
  },
  firstName: {
    type: String,
    required: true,
    trim: true,    
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
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

module.exports = User;