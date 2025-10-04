import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/index.js";
import { generateToken, generateRandomString } from "../utils/crypto.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
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
 * @route   POST /api/auth/login
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

export default router;
