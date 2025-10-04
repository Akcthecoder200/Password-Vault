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

// Method to validate password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
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
