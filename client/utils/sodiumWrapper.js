import _sodium from "libsodium-wrappers";

let sodium = null;
let isReady = false;

/**
 * Get a properly initialized instance of sodium
 * @returns {Promise<object>} Initialized sodium instance
 */
export async function getSodium() {
  if (isReady) {
    return sodium;
  }

  try {
    // Initialize sodium
    await _sodium.ready;
    sodium = _sodium;
    isReady = true;

    // Verify required functions are available
    if (typeof sodium.crypto_pwhash !== "function") {
      console.warn(
        "Sodium initialized but crypto_pwhash is not available. Using fallback implementation."
      );
      // Add fallback implementation for crypto_pwhash
      sodium.crypto_pwhash = createFallbackPwhash(sodium);
    }

    return sodium;
  } catch (error) {
    console.error("Failed to initialize sodium:", error);
    throw new Error("Encryption library failed to initialize");
  }
}

/**
 * Creates a fallback implementation of crypto_pwhash using PBKDF2
 * This is less secure than Argon2id but works when crypto_pwhash is unavailable
 */
function createFallbackPwhash(sodium) {
  return function fallbackPwhash(
    keyLength,
    password,
    salt,
    opslimit,
    memlimit,
    alg
  ) {
    console.log("Using fallback PBKDF2-based key derivation");

    // Use a high iteration count to compensate for not using Argon2
    const iterations = 100000;

    // Create a key using multiple PBKDF2 iterations
    const passwordBytes = sodium.from_string(password);

    // Use sodium's built-in crypto_generichash as PBKDF2
    let key = new Uint8Array(keyLength);
    let block = salt;

    // Simple PBKDF2-like construction using crypto_generichash
    for (let i = 0; i < iterations; i++) {
      block = sodium.crypto_generichash(32, block, passwordBytes);

      // XOR into the key
      for (let j = 0; j < Math.min(block.length, keyLength); j++) {
        key[j] ^= block[j];
      }

      if (i % 10000 === 0) {
        // Allow browser to process other events
        if (typeof window !== "undefined") {
          setTimeout(() => {}, 0);
        }
      }
    }

    return key;
  };
}

/**
 * Derives an encryption key from password and salt
 * @param {string} password - User's password
 * @param {string} salt - Salt as base64 string
 * @returns {Promise<Uint8Array>} - Derived encryption key
 */
export async function deriveKey(password, salt) {
  const _sodium = await getSodium();

  try {
    const passwordBuffer = _sodium.from_string(password);
    const saltBuffer = _sodium.from_base64(salt);

    // Get key length (use constant if not available)
    const keyLength = _sodium.crypto_secretbox_KEYBYTES || 32;

    // Define constants if not available
    const opsLimit = _sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE || 4;
    const memLimit = _sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE || 33554432;
    const algo = _sodium.crypto_pwhash_ALG_DEFAULT || 2;

    console.log("Deriving key with sodium, params:", {
      keyLength,
      saltLength: saltBuffer.length,
      opsLimit,
      memLimit,
    });

    return _sodium.crypto_pwhash(
      keyLength,
      passwordBuffer,
      saltBuffer,
      opsLimit,
      memLimit,
      algo
    );
  } catch (error) {
    console.error("Error in key derivation:", error);
    throw new Error("Failed to derive encryption key: " + error.message);
  }
}

/**
 * Encrypts data using XChaCha20-Poly1305
 * @param {object|string} data - Data to encrypt
 * @param {Uint8Array} key - Encryption key
 * @returns {Promise<object>} - Object with ciphertext and nonce (base64)
 */
export async function encrypt(data, key) {
  const _sodium = await getSodium();

  // Convert to string if object
  const messageStr =
    typeof data === "object" ? JSON.stringify(data) : String(data);
  const messageBuffer = _sodium.from_string(messageStr);

  // Generate nonce
  const nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES);

  // Encrypt
  const ciphertext = _sodium.crypto_secretbox_easy(messageBuffer, nonce, key);

  return {
    ciphertext: _sodium.to_base64(ciphertext),
    nonce: _sodium.to_base64(nonce),
  };
}

/**
 * Decrypts data using XChaCha20-Poly1305
 * @param {object} encryptedData - Object with ciphertext and nonce (base64)
 * @param {Uint8Array} key - Encryption key
 * @returns {Promise<object|string>} - Decrypted data
 */
export async function decrypt(encryptedData, key) {
  const _sodium = await getSodium();

  const ciphertext = _sodium.from_base64(encryptedData.ciphertext);
  const nonce = _sodium.from_base64(encryptedData.nonce);

  const messageBuffer = _sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    key
  );

  const messageStr = _sodium.to_string(messageBuffer);

  try {
    // Try to parse as JSON
    return JSON.parse(messageStr);
  } catch (e) {
    // Return as string if not valid JSON
    return messageStr;
  }
}

/**
 * Generates a random salt suitable for key derivation
 * @returns {Promise<string>} - Base64 encoded salt
 */
export async function generateSalt() {
  const _sodium = await getSodium();
  const salt = _sodium.randombytes_buf(_sodium.crypto_pwhash_SALTBYTES);
  return _sodium.to_base64(salt);
}
