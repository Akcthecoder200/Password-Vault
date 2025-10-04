// Import libsodium directly for more direct control
import _sodium from "libsodium-wrappers";

/**
 * Encryption utilities for client-side encryption using libsodium
 */

// Track initialization state
let isReady = false;
let sodium = null;

/**
 * Initialize sodium library
 * @returns {Promise<object>} - Initialized sodium object
 */
async function initSodium() {
  if (isReady) return sodium;

  try {
    // Wait for sodium to initialize
    await _sodium.ready;
    sodium = _sodium;
    isReady = true;
    return sodium;
  } catch (error) {
    console.error("Failed to initialize libsodium:", error);
    throw new Error("Encryption library failed to initialize");
  }
}

/**
 * Derives an encryption key from password and salt
 * @param {string} password - User's password
 * @param {string} salt - Salt retrieved from the server
 * @returns {Uint8Array} - Derived encryption key
 */
export async function deriveEncryptionKey(password, salt) {
  try {
    console.log("Deriving encryption key");
    const sodium = await initSodium();

    if (typeof sodium.crypto_pwhash !== "function") {
      console.warn("crypto_pwhash not available, using alternative method");
      // Use PBKDF2-like construction with crypto_generichash
      return deriveKeyAlternative(sodium, password, salt);
    }

    // Standard method using Argon2id via crypto_pwhash
    const passwordBuffer = sodium.from_string(password);
    const saltBuffer = sodium.from_base64(salt);

    const key = sodium.crypto_pwhash(
      sodium.crypto_secretbox_KEYBYTES,
      passwordBuffer,
      saltBuffer,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    );

    console.log("Key derivation successful");
    return key;
  } catch (error) {
    console.error("Key derivation failed:", error);
    throw error;
  }
}

/**
 * Alternative key derivation when crypto_pwhash is not available
 * @param {object} sodium - Initialized sodium object
 * @param {string} password - User's password
 * @param {string} salt - Base64 encoded salt
 * @returns {Uint8Array} - Derived key
 */
function deriveKeyAlternative(sodium, password, salt) {
  console.log("Using alternative key derivation method");
  const passwordBuffer = sodium.from_string(password);
  const saltBuffer = sodium.from_base64(salt);
  const keyLength = sodium.crypto_secretbox_KEYBYTES;

  // Create a key using multiple hash iterations (PBKDF2-like)
  const iterations = 10000;
  let key = new Uint8Array(keyLength);

  // Initial material
  let material = new Uint8Array([...saltBuffer, ...passwordBuffer]);

  // Perform multiple iterations
  for (let i = 0; i < iterations; i++) {
    // Add counter to the material
    const counterBuffer = new Uint8Array(4);
    new DataView(counterBuffer.buffer).setUint32(0, i, false);
    material = new Uint8Array([...material, ...counterBuffer]);

    // Hash the material
    const hash = sodium.crypto_generichash(keyLength, material);

    // XOR into the key
    for (let j = 0; j < keyLength; j++) {
      key[j] ^= hash[j];
    }
  }

  return key;
}

/**
 * Encrypts a vault item using XChaCha20-Poly1305
 * @param {Object} item - Vault item to encrypt
 * @param {Uint8Array} key - Encryption key
 * @returns {Object} - Encrypted item with ciphertext and nonce
 */
export async function encryptVaultItem(item, key) {
  try {
    console.log("Encrypting vault item");
    const sodium = await initSodium();

    // Convert to string if object
    const messageStr =
      typeof item === "object" ? JSON.stringify(item) : String(item);
    const messageBuffer = sodium.from_string(messageStr);

    // Generate nonce
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    // Encrypt
    const ciphertext = sodium.crypto_secretbox_easy(messageBuffer, nonce, key);

    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce),
    };
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

/**
 * Decrypts a vault item using XChaCha20-Poly1305
 * @param {Object} encryptedItem - Encrypted item with ciphertext and nonce
 * @param {Uint8Array} key - Encryption key
 * @returns {Object} - Decrypted vault item
 */
export async function decryptVaultItem(encryptedItem, key) {
  try {
    console.log("Decrypting vault item");
    const sodium = await initSodium();

    const ciphertext = sodium.from_base64(encryptedItem.ciphertext);
    const nonce = sodium.from_base64(encryptedItem.nonce);

    const messageBuffer = sodium.crypto_secretbox_open_easy(
      ciphertext,
      nonce,
      key
    );

    const messageStr = sodium.to_string(messageBuffer);

    try {
      // Try to parse as JSON
      return JSON.parse(messageStr);
    } catch (e) {
      // Return as string if not valid JSON
      return messageStr;
    }
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error(
      "Failed to decrypt vault item. The encryption key may be incorrect."
    );
  }
}

/**
 * Generates a random encryption salt
 * @returns {string} - Base64 encoded salt
 */
export async function generateEncryptionSalt() {
  try {
    console.log("Generating encryption salt");
    const sodium = await initSodium();

    // Generate salt
    const saltBytes = sodium.randombytes_buf(
      sodium.crypto_pwhash_SALTBYTES || 16
    );
    return sodium.to_base64(saltBytes);
  } catch (error) {
    console.error("Salt generation failed:", error);
    throw error;
  }
}
