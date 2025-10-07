/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - passwordHash
 *         - encSalt
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 60d21b4667d0d8992e610c85
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: user@example.com
 *         passwordHash:
 *           type: string
 *           description: Hashed password (not returned in API responses)
 *         encSalt:
 *           type: string
 *           description: Salt used for client-side encryption
 *           example: a1b2c3d4e5f6g7h8
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the user was created
 *           example: 2023-01-01T00:00:00.000Z
 *
 *     Vault:
 *       type: object
 *       required:
 *         - userId
 *         - ciphertext
 *         - nonce
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *           example: 60d21b4667d0d8992e610c85
 *         userId:
 *           type: string
 *           description: Reference to the user who owns this vault entry
 *           example: 60d21b4667d0d8992e610c85
 *         ciphertext:
 *           type: string
 *           description: Encrypted vault content
 *           example: encrypted-data-string
 *         nonce:
 *           type: string
 *           description: Encryption nonce
 *           example: encryption-nonce-string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the vault entry was created
 *           example: 2023-01-01T00:00:00.000Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: When the vault entry was last updated
 *           example: 2023-01-01T00:00:00.000Z
 */

// Export all models
import User from "./User.js";
import Vault from "./Vault.js";

export { User, Vault };
