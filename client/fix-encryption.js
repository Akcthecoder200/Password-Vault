// Test script for libsodium-wrappers
// Run with: node fix-encryption.js

async function testSodium() {
  console.log("Testing libsodium-wrappers...");

  try {
    // Import libsodium
    console.log("Importing libsodium-wrappers...");
    const sodium = require("libsodium-wrappers");

    // Wait for sodium to initialize
    console.log("Waiting for sodium to initialize...");
    await sodium.ready;
    console.log("Sodium initialized successfully!");

    // Check if key crypto functions exist
    console.log("\nChecking for required functions:");
    const requiredFunctions = [
      "crypto_pwhash",
      "crypto_secretbox_easy",
      "crypto_secretbox_open_easy",
      "from_string",
      "to_string",
      "from_base64",
      "to_base64",
      "randombytes_buf",
    ];

    let allFunctionsAvailable = true;

    for (const funcName of requiredFunctions) {
      const available = typeof sodium[funcName] === "function";
      console.log(
        `- ${funcName}: ${available ? "Available ✅" : "MISSING ❌"}`
      );
      if (!available) allFunctionsAvailable = false;
    }

    if (!allFunctionsAvailable) {
      console.error(
        "\n❌ Some required functions are missing! You need to reinstall libsodium-wrappers."
      );
      console.log(
        "\nPlease run: npm uninstall libsodium-wrappers && npm install libsodium-wrappers@0.7.11"
      );
      return;
    }

    // Test key derivation
    console.log("\nTesting key derivation...");
    const testPassword = "test-password";
    const testSalt = sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

    console.log("- Deriving key from password and salt...");
    const key = sodium.crypto_pwhash(
      sodium.crypto_secretbox_KEYBYTES,
      sodium.from_string(testPassword),
      testSalt,
      sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
      sodium.crypto_pwhash_ALG_DEFAULT
    );

    console.log("- Key derived successfully!");

    // Test encryption and decryption
    console.log("\nTesting encryption and decryption...");
    const testMessage = "This is a secret message!";
    const messageBuffer = sodium.from_string(testMessage);

    console.log("- Generating nonce...");
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);

    console.log("- Encrypting message...");
    const ciphertext = sodium.crypto_secretbox_easy(messageBuffer, nonce, key);

    console.log("- Decrypting message...");
    const decrypted = sodium.crypto_secretbox_open_easy(ciphertext, nonce, key);
    const decryptedMessage = sodium.to_string(decrypted);

    console.log("- Original message:", testMessage);
    console.log("- Decrypted message:", decryptedMessage);
    console.log(
      "- Test passed:",
      testMessage === decryptedMessage ? "✅" : "❌"
    );

    console.log(
      "\n✅ All tests passed! libsodium-wrappers is working correctly!"
    );
    console.log(
      "\nIf your app is still having issues, make sure you're importing libsodium correctly:"
    );
    console.log(
      "Use: import sodium from 'libsodium-wrappers'; (NOT import * as sodium)"
    );
    console.log(
      "And make sure to await sodium.ready before using any functions."
    );
  } catch (error) {
    console.error("\n❌ Test failed with error:", error);
    console.log("\nPlease try reinstalling libsodium-wrappers:");
    console.log(
      "npm uninstall libsodium-wrappers && npm install libsodium-wrappers@0.7.11"
    );
  }
}

testSodium();
