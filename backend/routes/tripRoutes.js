import express from "express";
import { createTrip, getTrips, updateTrip } from "../controllers/tripController";
import { authenticateUser } from "./middleware/auth";

const router = express.Router();

// Update trip
router.patch("/:id", authenticateUser, updateTrip);

// Create a new trip
router.post("/", authenticateUser, createTrip);

// Get trips (admin sees all, users see their own)
router.get("/", authenticateUser, getTrips);

export { router as tripRoutes };