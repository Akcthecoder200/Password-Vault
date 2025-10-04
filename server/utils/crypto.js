import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Generate a cryptographically secure random string
 * @param {number} length Length of the string to generate
 * @returns {string} Random string in hex format
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate JWT token for user authentication
 * @param {Object} user User document from MongoDB
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export { generateRandomString, generateToken };
