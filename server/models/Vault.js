import mongoose from "mongoose";

const VaultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true, // Add index for faster queries by userId
  },
  ciphertext: {
    type: String,
    required: [true, "Encrypted content is required"],
  },
  nonce: {
    type: String,
    required: [true, "Encryption nonce is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update the updatedAt field
VaultSchema.pre("save", function (next) {
  if (this.isModified("ciphertext")) {
    this.updatedAt = Date.now();
  }
  next();
});

const Vault = mongoose.model("Vault", VaultSchema);

export default Vault;
