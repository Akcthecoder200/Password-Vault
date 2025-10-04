// Middleware for JWT authentication
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

/**
 * Protect routes - Verify JWT token and set user in request
 */
const protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user from decoded token and exclude password
      req.user = await User.findById(decoded.id).select("-passwordHash");

      next();
    } catch (error) {
      console.error("Auth error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export { protect };
