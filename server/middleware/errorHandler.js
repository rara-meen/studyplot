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

  // Mongo/Mongoose can't reach the database (missing/invalid MONGODB_URI,
  // network issue, buffering timeout, etc). Never leak the raw driver
  // message (it can contain connection strings, host names, etc) — always
  // show a generic, safe message instead, regardless of environment.
  const isDbConnectionError =
    err.name === "MongooseServerSelectionError" ||
    err.name === "MongoServerSelectionError" ||
    err.name === "MongoNetworkError" ||
    err.name === "MongoTimeoutError" ||
    (err.name === "MongooseError" && /buffering timed out/i.test(err.message || "")) ||
    (err.message && /ECONNREFUSED|ENOTFOUND|whitelist|IP that isn't whitelisted/i.test(err.message));

  if (isDbConnectionError) {
    statusCode = 503;
    message = "We're having trouble reaching the database right now. Please try again in a moment.";
  }

  // Duplicate key error (e.g. a race between the pre-check and the insert
  // both hitting the unique email/username index at the same time).
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {})[0];
    message =
      field === "username"
        ? "That username is already taken."
        : "An account with that email already exists.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
