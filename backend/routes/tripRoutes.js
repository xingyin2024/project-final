import express from "express";
import { createTrip, getTrips, updateTrip, getTripById } from "../controllers/tripController.js";
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Update trip
router.patch("/:id", authenticateUser, updateTrip);

// Create a new trip
router.post("/", authenticateUser, createTrip);

// Get trips (admin sees all, users see their own)
router.get("/", authenticateUser, getTrips);

// Get a single trip by ID
router.get("/:id", authenticateUser, getTripById);

export { router as tripRoutes };