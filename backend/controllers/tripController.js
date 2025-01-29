import Trip from '../models/tripModel.js';
import mongoose from 'mongoose';
import { handleMongoError } from '../utils/handleMongoError.js';

// POST (create) a new trip
const createTrip = async (req, res) => {
  try {
    const {
      title,
      location,
      tripDate,
      hotelBreakfastDays = 0,
      mileageKm = 0,
      status = 'not submitted',
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
      message: 'Trip created successfully',
      data: savedTrip,
    });
  } catch (error) {
    handleMongoError(error, res, 'Failed to create trip');
  }
};

// Get trips (admin sees all, users see their own)
const getTrips = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const user = req.user;

    // Validate userId if provided
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid userId' });
    }

    // Determine filter logic
    let filter;
    if (user.role === 'admin') {
      filter = userId ? { userId } : {}; // Correct field name
    } else {
      filter = { userId: user._id }; // Correct field name
    }

    if (status) {
      filter.status = status;
    }

    const trips = await Trip.find(filter)
      .populate('userId', 'firstName lastName')
      .populate('submission.approvedBy', 'firstName lastName email'); // Populate only specific fields

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    handleMongoError(error, res, 'Failed to fetch trips');
  }
};

// GET a trip by :id
const getTripById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // Get authenticated user from middleware

    // Validate trip ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid trip ID' });
    }

    const trip = await Trip.findById(id)
      .populate('userId', 'firstName lastName')
      .populate('submission.approvedBy', 'firstName lastName email');

    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    // Check if the user is authorized to access this trip
    if (
      user.role !== 'admin' &&
      !trip.userId.equals(user._id) // Use Mongoose's `equals` method for ObjectId comparison
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch trip' });
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
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    // Role-based logic
    if (user.role === 'admin') {
      // Admin-specific logic
      if (
        updates.status === 'approved' &&
        trip.status === 'awaiting approval'
      ) {
        // Only update `approvedBy` if the status is changing to `approved`
        updates.submission = updates.submission || {};
        updates.submission.approvedBy = user._id.toString();
        updates.submission.approvedAt = new Date();
      }
    } else {
      // Non-admin users
      if (updates.submission?.approvedBy || updates.status === 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot approve trips.',
        });
      }

      // Ensure the user is the owner of the trip or an admin
      if (
        trip.userId.toString() !== user._id.toString() &&
        user.role !== 'admin'
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Access denied' });
      }
    }

    // Apply updates
    Object.assign(trip, updates);
    trip.submission.updatedAt = new Date(); // Update the modification timestamp

    const updatedTrip = await trip.save();

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully',
      data: updatedTrip,
    });
  } catch (error) {
    handleMongoError(error, res, 'Failed to update trip');
  }
};

// DELETE a trip by :id
const deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user; // The authenticated user

    // Validate trip ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid trip ID' });
    }

    // Find the trip
    const trip = await Trip.findById(id);

    if (!trip) {
      return res
        .status(404)
        .json({ success: false, message: 'Trip not found' });
    }

    // Check ownership or admin role
    if (user.role !== 'admin' && !trip.userId.equals(user._id)) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied. Not your trip.' });
    }

    await Trip.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Trip deleted successfully',
    });
  } catch (error) {
    handleMongoError(error, res, 'Failed to delete trip');
  }
};

export { createTrip, getTrips, updateTrip, getTripById, deleteTrip };
