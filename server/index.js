import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Import routes
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import vaultRoutes from "./routes/vault.js";

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/vault", vaultRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
