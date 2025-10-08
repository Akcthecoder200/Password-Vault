// Import libsodium directly for more direct control
import _sodium from "libsodium-wrappers";

/**
 * Encryption utilities for client-side encryption using libsodium
 */

// Track initialization state
let isReady = false;
let sodium = null;
let initializationPromise = null;

/**
 * Initialize sodium library (with caching for better performance)
 * @returns {Promise<object>} - Initialized sodium object
 */
async function initSodium() {
  // If sodium is already initialized, return it immediately
  if (isReady) return sodium;

  // If initialization is in progress, return the existing promise
  if (initializationPromise) return initializationPromise;

  // Start initialization
  initializationPromise = (async () => {
    try {
      console.log("Initializing sodium library...");
      const startTime = performance.now();

      // Wait for sodium to initialize
      await _sodium.ready;
      sodium = _sodium;
      isReady = true;

      const endTime = performance.now();
      console.log(
        `Sodium initialization complete in ${(endTime - startTime).toFixed(
          2
        )}ms`
      );

      return sodium;
    } catch (error) {
      console.error("Failed to initialize libsodium:", error);
      // Reset initialization promise so it can be retried
      initializationPromise = null;
      throw new Error("Encryption library failed to initialize");
    }
  })();

  return initializationPromise;
}

// Cache for derived keys to avoid repeated expensive derivations
const keyCache = new Map();

// Flag to track if we've had to recover from a wrong key error
let hasRecoveredFromWrongKey = false;

/**
 * Derives an encryption key from password and salt
 * @param {string} password - User's password
 * @param {string} salt - Salt retrieved from the server
 * @returns {Uint8Array} - Derived encryption key
 */
export async function deriveEncryptionKey(password, salt) {
  try {
    // Generate a cache key (don't store actual passwords in cache keys)
    const cacheKey = `${btoa(password.slice(0, 2))}:${salt.slice(0, 10)}`;

    // Check if we have a cached key
    if (keyCache.has(cacheKey)) {
      console.log("Using cached encryption key");
      return keyCache.get(cacheKey);
    }

    console.log("Deriving encryption key - this may take a moment");
    const startTime = performance.now();
    const sodium = await initSodium();

    let key;
    if (typeof sodium.crypto_pwhash !== "function") {
      console.warn("crypto_pwhash not available, using alternative method");
      // Use the original alternative method to maintain compatibility
      key = deriveKeyAlternative(sodium, password, salt);
    } else {
      // IMPORTANT: Keep the original parameters exactly the same to maintain compatibility
      // with existing encrypted data. Changing these parameters would result in a different key
      // and break decryption of existing data.
      const passwordBuffer = sodium.from_string(password);
      const saltBuffer = sodium.from_base64(salt);

      // Use the original default parameters for compatibility with existing data
      key = sodium.crypto_pwhash(
        sodium.crypto_secretbox_KEYBYTES,
        passwordBuffer,
        saltBuffer,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_DEFAULT
      );
    }

    const endTime = performance.now();
    console.log(
      `Key derivation completed in ${(endTime - startTime).toFixed(2)}ms`
    );

    // Cache the derived key
    keyCache.set(cacheKey, key);

    // Limit cache size to avoid memory issues
    if (keyCache.size > 5) {
      // Remove the oldest entry
      const firstKey = keyCache.keys().next().value;
      keyCache.delete(firstKey);
    }

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
  // IMPORTANT: Keep the original iterations count to maintain compatibility
  const iterations = 10000; // Original value for compatibility
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
    // Don't log every encryption to reduce console noise
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
    // Basic validation
    if (!encryptedItem || !encryptedItem.ciphertext || !encryptedItem.nonce) {
      console.error("Invalid encrypted item:", encryptedItem);
      throw new Error("Invalid encrypted item format");
    }

    if (!key || !(key instanceof Uint8Array) || key.length !== 32) {
      console.error(
        "Invalid encryption key:",
        key ? "wrong format" : "missing"
      );
      throw new Error("Invalid encryption key format");
    }

    const sodium = await initSodium();

    try {
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
    } catch (sodiumError) {
      // Preserve the original error message which includes important info like "wrong secret key"
      console.error("Sodium decryption error:", sodiumError);
      throw sodiumError;
    }
  } catch (error) {
    if (error.message && error.message.includes("wrong secret key")) {
      console.error(
        "Decryption failed - wrong secret key error indicates possible key derivation parameter mismatch"
      );
      // Rethrow the original error to preserve the "wrong secret key" message for recovery logic
      throw error;
    } else {
      console.error("Decryption failed:", error);
      throw new Error(
        "Failed to decrypt vault item. The encryption key may be incorrect."
      );
    }
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
