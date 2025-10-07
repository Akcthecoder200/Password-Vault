import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { generateToken, generateRandomString } from "../utils/crypto.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", async (req, res) => {
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
});

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token + encryption salt
 * @access  Public
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });

    // Check user exists and password is correct
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        encSalt: user.encSalt,
        token: generateToken(user),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: Retrieves the profile information for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                 createdAt:
 *                   type: string
 *                   format: date-time
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
router.get("/profile", protect, async (req, res) => {
  try {
    // User is already set in req from the protect middleware
    const user = req.user;

    if (user) {
      res.json({
        _id: user._id,
        email: user.email,
        encSalt: user.encSalt,
        createdAt: user.createdAt,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
