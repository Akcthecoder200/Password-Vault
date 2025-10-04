// fix-libsodium.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("Starting libsodium-wrappers fix script...");

// Check if running in the right directory
if (!fs.existsSync(path.join(process.cwd(), "package.json"))) {
  console.error(
    "Error: This script must be run from the client directory that contains package.json"
  );
  process.exit(1);
}

// Clean the current installation
console.log("\n1. Removing existing libsodium-wrappers...");
try {
  execSync("npm uninstall libsodium-wrappers", { stdio: "inherit" });
  console.log("✅ Removed existing libsodium-wrappers");
} catch (error) {
  console.error("Failed to uninstall:", error.message);
}

// Clear npm cache
console.log("\n2. Clearing npm cache...");
try {
  execSync("npm cache clean --force", { stdio: "inherit" });
  console.log("✅ Cleared npm cache");
} catch (error) {
  console.error("Failed to clear cache:", error.message);
}

// Install specific version with exact flag
console.log("\n3. Installing libsodium-wrappers@0.7.11...");
try {
  execSync("npm install --save-exact libsodium-wrappers@0.7.11", {
    stdio: "inherit",
  });
  console.log("✅ Installed libsodium-wrappers@0.7.11");
} catch (error) {
  console.error("Failed to install:", error.message);
}

// Create a simple test file
console.log("\n4. Creating and running a simple test...");
const testContent = `
const sodium = require('libsodium-wrappers');

async function testSodium() {
  try {
    await sodium.ready;
    console.log("✅ Sodium ready!");
    
    // Test if crypto_pwhash exists
    if (typeof sodium.crypto_pwhash === 'function') {
      console.log("✅ crypto_pwhash is available");
      
      // Test a simple key derivation
      const password = "test-password";
      const salt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);
      
      const key = sodium.crypto_pwhash(
        sodium.crypto_secretbox_KEYBYTES,
        sodium.from_string(password),
        salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_DEFAULT
      );
      
      console.log("✅ Key derivation successful!");
      return true;
    } else {
      console.error("❌ crypto_pwhash is NOT available!");
      return false;
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    return false;
  }
}

testSodium().then(success => {
  console.log(success ? "✅ All tests passed!" : "❌ Some tests failed!");
});
`;

const testFilePath = path.join(process.cwd(), "test-sodium.js");
fs.writeFileSync(testFilePath, testContent);

try {
  console.log("Running test...");
  const result = execSync("node test-sodium.js", { stdio: "inherit" });
  console.log("Test complete!");
} catch (error) {
  console.error("Test failed:", error.message);
}

console.log("\n5. Creating browser-compatible wrapper...");
const wrapperContent = `
import _sodium from 'libsodium-wrappers';

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
    return sodium;
  } catch (error) {
    console.error("Failed to initialize sodium:", error);
    throw new Error("Encryption library failed to initialize");
  }
}

/**
 * Derives an encryption key from password and salt
 * @param {string} password - User's password
 * @param {string} salt - Salt as base64 string
 * @returns {Promise<Uint8Array>} - Derived encryption key
 */
export async function deriveKey(password, salt) {
  const _sodium = await getSodium();
  
  const passwordBuffer = _sodium.from_string(password);
  const saltBuffer = _sodium.from_base64(salt);
  
  return _sodium.crypto_pwhash(
    _sodium.crypto_secretbox_KEYBYTES,
    passwordBuffer,
    saltBuffer,
    _sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
    _sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
    _sodium.crypto_pwhash_ALG_DEFAULT
  );
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
  const messageStr = typeof data === 'object' ? JSON.stringify(data) : String(data);
  const messageBuffer = _sodium.from_string(messageStr);
  
  // Generate nonce
  const nonce = _sodium.randombytes_buf(_sodium.crypto_secretbox_NONCEBYTES);
  
  // Encrypt
  const ciphertext = _sodium.crypto_secretbox_easy(messageBuffer, nonce, key);
  
  return {
    ciphertext: _sodium.to_base64(ciphertext),
    nonce: _sodium.to_base64(nonce)
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
`;

const wrapperFilePath = path.join(process.cwd(), "utils", "sodiumWrapper.js");
fs.writeFileSync(wrapperFilePath, wrapperContent);

console.log(`✅ Created browser-compatible wrapper at ${wrapperFilePath}`);

console.log("\n6. Next steps:");
console.log("- Restart your Next.js development server");
console.log("- Update your encryption.js to use the new sodiumWrapper.js");
console.log("- Check the test page at http://localhost:3000/test-sodium");
console.log("\nDone!");
