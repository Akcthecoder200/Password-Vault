import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import setupSwagger from "./config/swagger.js";

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

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
