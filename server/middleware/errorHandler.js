export const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode && err.statusCode !== 200 ? err.statusCode : 500;
  let message = err.message || "Internal server error.";

  // Malformed MongoDB ObjectId (e.g. GET /api/documents/not-a-valid-id)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Document not found.";
  }

  // Multer file-size / upload errors
  if (err.name === "MulterError") {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "That file is too large. Please upload a PDF up to 20MB."
        : "There was a problem uploading your file. Please try again.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
