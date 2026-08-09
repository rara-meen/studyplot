import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn(
      "MONGODB_URI is not set. Skipping database connection. Set MONGODB_URI in your .env file to connect to MongoDB Atlas."
    );
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    // Log the real reason for diagnostics, but don't crash the whole
    // process — a single bad/unreachable MONGODB_URI shouldn't take down
    // the entire API (health checks, static routes, etc). Requests that
    // actually need the database will still fail safely via the
    // Mongoose buffering timeout, which errorHandler turns into a clean
    // "database unreachable" response instead of a raw stack trace.
    console.error(`MongoDB connection error: ${error.message}`);
  }
};

export default connectDB;
