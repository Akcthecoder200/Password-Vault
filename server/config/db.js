import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Validate MongoDB URI before connecting
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    console.log("Attempting to connect to MongoDB...");

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      heartbeatFrequencyMS: 30000, // Check connection every 30 seconds
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Add connection error handler
    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    // Add disconnection handler
    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    // Add reconnection handler
    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected successfully");
    });

    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    // On Render, don't exit the process immediately to allow for retries
    if (process.env.NODE_ENV === "production") {
      console.error(
        "Running in production - will continue to serve requests while MongoDB is unavailable"
      );
      // In production, we'll continue running but MongoDB operations will fail
      return null;
    } else {
      // In development, exit to make the error more obvious
      process.exit(1);
    }
  }
};

export default connectDB;
