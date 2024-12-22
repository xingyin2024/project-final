import Trip from "../models/tripModel.js";
import mongoose from "mongoose";
import { handleMongoError } from "../utils/handleMongoError.js";
import { getPagination } from "../utils/pagination.js";

// POST (create) a new trip
const createTrip = async (req, res) => {
  try {
    const {
      title,
      location,
      tripDate,
      hotelBreakfastDays = 0,
      mileageKm = 0,
      status = "not submitted",
      calculatedData,        
    } = req.body;

    const user = req.user;

    const trip = new Trip({
      title,
      location,
      tripDate,
      hotelBreakfastDays,
      mileageKm,
      status,
      userId: req.user._id, // Auto-set from authenticated user
      creation: {
        createdBy: `${req.user.firstName} ${req.user.lastName}`,
        createdAt: new Date(),
      },
      calculatedData,        
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
};

// Get trips (admin sees all, users see their own)
const getTrips = async (req, res) => {
  try {
    const { status, userId, page, limit } = req.query;
    const user = req.user;
    const { page: sanitizedPage, limit: sanitizedLimit } = getPagination(page, limit);

    // Validate userId if provided
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Determine filter logic
    let filter;
    if (user.role === "admin") {
      filter = userId ? { userID: userId } : {};
    } else {
      filter = { userID: user._id };
    }

    if (status) {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .skip((sanitizedPage - 1) * sanitizedLimit)
      .limit(sanitizedLimit)
      .populate("userId", "firstName lastName")
      .populate("submission.approvedBy", "firstName lastName email"); // Populate only specific fields

    const totalTrips = await Trip.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: trips,
      currentPage: sanitizedPage,
      totalPages: Math.ceil(totalTrips / sanitizedLimit),
    });
  } catch (error) {
    handleMongoError(error, res, "Failed to fetch trips");
  }
};

// PATCH (update) a trip by :id
const updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user;

    // Ensure the user is the owner of the trip or an admin
    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }
      
    // Restrict approval updates to the logged-in admin
    if (updates.submission?.approvedBy) {
      if (user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Access denied: Only admins can approve trips." });
      }
      if (updates.submission.approvedBy !== user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: "Invalid operation: `approvedBy` must match the logged-in admin's ID.",
        });
      }
    }
      
    // Ensure the user is the owner of the trip or an admin
    if (trip.userId.toString() !== user._id.toString() && user.role !== "admin") {
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
};

export { createTrip, getTrips, updateTrip };
