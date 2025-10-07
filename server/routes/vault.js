import express from "express";
import { Vault } from "../models/index.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * @openapi
 * /api/vault:
 *   get:
 *     tags:
 *       - Vault
 *     summary: Get all vault entries
 *     description: Retrieves all vault entries for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of vault entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VaultItem'
 *       401:
 *         description: Not authorized, no token or invalid token
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
 * @openapi
 * /api/vault/{id}:
 *   get:
 *     tags:
 *       - Vault
 *     summary: Get a specific vault entry
 *     description: Retrieves a specific vault entry by ID for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the vault entry to retrieve
 *     responses:
 *       200:
 *         description: Vault entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VaultItem'
 *       401:
 *         description: Not authorized, no token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vault entry not found
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
 * @openapi
 * /api/vault:
 *   post:
 *     tags:
 *       - Vault
 *     summary: Create a new vault entry
 *     description: Creates a new encrypted vault entry for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ciphertext
 *               - nonce
 *             properties:
 *               ciphertext:
 *                 type: string
 *                 description: Encrypted vault data
 *                 example: encrypted-data
 *               nonce:
 *                 type: string
 *                 description: Encryption nonce
 *                 example: encryption-nonce
 *     responses:
 *       201:
 *         description: Vault entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VaultItem'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authorized, no token or invalid token
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
 * @openapi
 * /api/vault/{id}:
 *   put:
 *     tags:
 *       - Vault
 *     summary: Update a vault entry
 *     description: Updates an existing vault entry by ID for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the vault entry to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ciphertext
 *               - nonce
 *             properties:
 *               ciphertext:
 *                 type: string
 *                 description: Encrypted vault data
 *                 example: encrypted-data
 *               nonce:
 *                 type: string
 *                 description: Encryption nonce
 *                 example: encryption-nonce
 *     responses:
 *       200:
 *         description: Vault entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VaultItem'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Not authorized, no token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vault entry not found
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
 * @openapi
 * /api/vault/{id}:
 *   delete:
 *     tags:
 *       - Vault
 *     summary: Delete a vault entry
 *     description: Deletes a specific vault entry by ID for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the vault entry to delete
 *     responses:
 *       200:
 *         description: Vault entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vault entry removed
 *       401:
 *         description: Not authorized, no token or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vault entry not found
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
