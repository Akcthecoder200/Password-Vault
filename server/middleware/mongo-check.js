import mongoose from "mongoose";

/**
 * Check if MongoDB is connected
 * @returns {boolean} true if connected, false otherwise
 */
export function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Handle route with MongoDB connection check
 * @param {Function} handler - The route handler function
 * @returns {Function} Middleware that checks MongoDB connection before executing the handler
 */
export function withMongoCheck(handler) {
  return async (req, res, next) => {
    if (!isMongoConnected()) {
      console.warn("MongoDB not connected, route execution skipped");
      return res.status(503).json({
        error: "Database unavailable",
        message:
          "The database is currently unavailable. Please try again later.",
      });
    }

    // If connected, proceed with the original handler
    return handler(req, res, next);
  };
}
