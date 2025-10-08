import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { generateToken, generateRandomString } from "../utils/crypto.js";
import { protect } from "../middleware/auth.js";
import { withMongoCheck } from "../middleware/mongo-check.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account and returns user data with authentication token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 60d21b4667d0d8992e610c85
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 encSalt:
 *                   type: string
 *                   example: a1b2c3d4e5f6g7h8
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: User already exists or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", withMongoCheck(async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate salt for client-side encryption (different from bcrypt salt)
    const encSalt = generateRandomString(16);

    // Create user (bcrypt hashing happens in the pre-save hook)
    const user = await User.create({
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      encSalt,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        encSalt: user.encSalt,
        token: generateToken(user),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}));

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login a user
 *     description: Authenticates a user and returns user data with authentication token and encryption salt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 60d21b4667d0d8992e610c85
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *                 encSalt:
 *                   type: string
 *                   example: a1b2c3d4e5f6g7h8
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/login", withMongoCheck(async (req, res) => {
  try {
    const startTime = process.hrtime();
    const { email, password } = req.body;

    // Find user - with lean() for better performance since we don't need a full mongoose document
    const user = await User.findOne({ email });
    
    if (!user) {
      // Use consistent timing to prevent timing attacks
      await bcrypt.compare(password, "$2a$10$invalidhashforsecurityreasons");
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password is correct
    if (await user.matchPassword(password)) {
      // Prepare response before generating token for better perceived performance
      const response = {
        _id: user._id,
        email: user.email,
        encSalt: user.encSalt,
        token: generateToken(user),
      };
      
      const endTime = process.hrtime(startTime);
      const duration = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
      console.log(`Login successful for ${email} in ${duration}ms`);
      
      res.json(response);
    } else {
      const endTime = process.hrtime(startTime);
      const duration = (endTime[0] * 1000 + endTime[1] / 1000000).toFixed(2);
      console.log(`Failed login attempt for ${email} in ${duration}ms`);
      
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}));

/**
 * @openapi
 * /api/auth/verify:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Verify user token
 *     description: Verifies the JWT token and returns user data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 60d21b4667d0d8992e610c85
 *                     email:
 *                       type: string
 *                       example: user@example.com
 *                     name:
 *                       type: string
 *                       example: user
 *       401:
 *         description: Not authorized, no token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/verify", protect, withMongoCheck(async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user._id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name || user.email.split("@")[0], // Use email prefix as name if name is not set
      },
    });
  } catch (error) {
    console.error("Token verification error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
}));

export default router;
