// Reusable error handler
export const handleMongoError = (error, res, message = "Database operation failed") => {
  console.error(error);// Log the error for debugging
  res.status(500).json({ success: false, message, errors: error.message });
};
