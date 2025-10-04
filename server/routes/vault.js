import express from "express";
import { Vault } from "../models/index.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   GET /api/vault
 * @desc    Get all user's vault entries
 * @access  Private
 */
router.get("/", protect, async (req, res) => {
  try {
    // Find all vault entries for the authenticated user
    const vaults = await Vault.find({ userId: req.user._id });

    if (vaults && vaults.length > 0) {
      res.json(vaults);
    } else {
      // No vault entries yet - return empty array
      res.json([]);
    }
  } catch (error) {
    console.error("Vault retrieval error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   GET /api/vault/:id
 * @desc    Get a specific vault entry
 * @access  Private
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const vault = await Vault.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!vault) {
      return res.status(404).json({ message: "Vault entry not found" });
    }

    res.json(vault);
  } catch (error) {
    console.error("Vault retrieval error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/vault
 * @desc    Create a new vault entry
 * @access  Private
 */
router.post("/", protect, async (req, res) => {
  try {
    const { ciphertext, nonce } = req.body;

    // Validate inputs
    if (!ciphertext || !nonce) {
      return res
        .status(400)
        .json({ message: "Ciphertext and nonce are required" });
    }

    // Create new vault entry
    const newVault = await Vault.create({
      userId: req.user._id,
      ciphertext,
      nonce,
    });

    res.status(201).json(newVault);
  } catch (error) {
    console.error("Vault creation error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   PUT /api/vault/:id
 * @desc    Update a vault entry
 * @access  Private
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const { ciphertext, nonce } = req.body;

    // Validate inputs
    if (!ciphertext || !nonce) {
      return res
        .status(400)
        .json({ message: "Ciphertext and nonce are required" });
    }

    // Find vault entry and verify ownership
    let vault = await Vault.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!vault) {
      return res.status(404).json({ message: "Vault entry not found" });
    }

    // Update vault entry
    vault = await Vault.findByIdAndUpdate(
      req.params.id,
      {
        ciphertext,
        nonce,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    res.json(vault);
  } catch (error) {
    console.error("Vault update error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   DELETE /api/vault/:id
 * @desc    Delete a vault entry
 * @access  Private
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    // Find vault entry and verify ownership
    const vault = await Vault.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!vault) {
      return res.status(404).json({ message: "Vault entry not found" });
    }

    // Delete the entry
    await vault.deleteOne();
    res.json({ message: "Vault entry removed" });
  } catch (error) {
    console.error("Vault deletion error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
