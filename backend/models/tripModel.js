import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: [2, "Trip Code must be at least 2 characters long"],
    maxlength: [50, "Trip Code can't be more than 50 characters"],
  },
  location: {
    city: { type: String },
    country: { type: String, required: true },
  },
  tripDate: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },  
  hotelBreakfastDays: { type: Number, default: 0 }, // Validated in middleware
  mileageKm: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["approved", "awaiting approval", "not submitted"],
    default: "not submitted"
  },
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creation: {
    createdBy: { type: String }, 
    createdAt: { type: Date, default: Date.now },
  },  
  submission: {
    updatedAt: { type: Date, default: null }, 
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Reference to Admin User
    approvedAt: { type: Date, default: null }, 
  },  
  calculatedData: {
    totalDays: { type: Number}, // Optional, generated from frontend
    totalAmount: { type: Number }, // Optional, generated from frontend
  },    
});

const Trip = mongoose.model("Trip", tripSchema);

module.exports = Trip;