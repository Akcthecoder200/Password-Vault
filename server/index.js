import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import setupSwagger from "./config/swagger.js";

// Print environment info for debugging (without sensitive data)
console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
console.log(`MongoDB URI set: ${process.env.MONGODB_URI ? 'Yes' : 'No'}`);
console.log(`PORT: ${process.env.PORT || '4000'}`);
console.log(`JWT_SECRET set: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);

// Connect to MongoDB - we'll make this async but not block server startup
(async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB during startup:", error.message);
    // Server will still start, but MongoDB operations will fail until connection is established
  }
})();

const app = express();

// CORS configuration for production
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          "https://password-vault-frontend.onrender.com",
          "https://password-vault-frontend.onrender.com/",
          process.env.FRONTEND_URL,
          process.env.FRONTEND_URL
            ? process.env.FRONTEND_URL.replace(/\/+$/, "")
            : null,
          // Add any additional frontend URLs here
        ].filter(Boolean)
      : ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));

// Security headers
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Request logging for all environments
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  // Log detailed request information
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  console.log(`  Origin: ${req.headers.origin || "unknown"}`);
  console.log(`  User-Agent: ${req.headers["user-agent"] || "unknown"}`);

  // Log response when it completes
  res.on("finish", () => {
    console.log(
      `[${timestamp}] Response: ${res.statusCode} ${res.statusMessage}`
    );
  });

  next();
});

// Root route for easy testing
app.get("/", (req, res) => {
  res.json({
    message: "Password Vault API is running",
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/auth",
      "/api/users",
      "/api/vault",
      "/api-docs",
    ],
  });
});

/**
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Server health check
 *     description: Verify the API is running
 *     responses:
 *       200:
 *         description: API is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Enhanced health check route for Render that checks database connectivity
app.get("/health", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1; // 1 = connected
  
  // Always return 200 for Render health check to prevent restarts
  res.json({
    status: "ok",
    server: "running",
    timestamp: new Date().toISOString(),
    database: isDbConnected ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

// Debug endpoint to help troubleshoot API connectivity issues
app.get("/api/debug", (req, res) => {
  res.json({
    cors: {
      origin: corsOptions.origin,
      methods: corsOptions.methods,
      allowedHeaders: corsOptions.allowedHeaders,
    },
    environment: process.env.NODE_ENV,
    requestInfo: {
      origin: req.headers.origin || "not provided",
      host: req.headers.host,
      userAgent: req.headers["user-agent"],
    },
    timestamp: new Date().toISOString(),
    // Don't include sensitive info like JWT_SECRET
  });
});

// Import routes
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import vaultRoutes from "./routes/vault.js";

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/vault", vaultRoutes);

// Setup Swagger
setupSwagger(app);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
