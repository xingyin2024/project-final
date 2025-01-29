// Reusable error handler
export const handleMongoError = (
  error,
  res,
  message = 'Database operation failed'
) => {
  res.status(500).json({ success: false, message, errors: error.message });
};
