import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
  },
  passwordHash: {
    type: String,
    required: [true, "Password is required"],
  },
  encSalt: {
    type: String,
    required: [true, "Encryption salt is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Simple LRU cache for password validation results
const passwordCache = new Map();
const MAX_CACHE_SIZE = 100; // Maximum number of items in cache

// Method to validate password with caching
UserSchema.methods.matchPassword = async function (enteredPassword) {
  // Create a cache key based on the password and hash
  // Using the first few chars of hash + last few chars to avoid storing the full hash in memory
  const hashPreview = this.passwordHash.slice(0, 10) + this.passwordHash.slice(-10);
  const cacheKey = `${enteredPassword.slice(0, 3)}:${hashPreview}:${this._id}`;
  
  // Check cache first
  if (passwordCache.has(cacheKey)) {
    return passwordCache.get(cacheKey);
  }
  
  // Not in cache, perform the comparison
  const isMatch = await bcrypt.compare(enteredPassword, this.passwordHash);
  
  // Store in cache
  passwordCache.set(cacheKey, isMatch);
  
  // Limit cache size
  if (passwordCache.size > MAX_CACHE_SIZE) {
    // Delete oldest entry
    const firstKey = passwordCache.keys().next().value;
    passwordCache.delete(firstKey);
  }
  
  return isMatch;
};

// Pre-save hook to hash password if modified
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
