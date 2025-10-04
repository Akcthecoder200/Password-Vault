import { useEffect, useState } from "react";
import { useRouter } from "next/router";

// Function to generate a random password using Web Crypto API
export function generatePassword({
  length = 12,
  includeSymbols = true,
  includeNumbers = true,
  includeLowercase = true,
  includeUppercase = true,
  excludeSimilarChars = false,
}) {
  // Check if we're in a browser environment with crypto support
  const hasCrypto =
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.getRandomValues;

  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()_-+={}[]|:;<>,.?/~";

  // Characters that look similar
  const similarChars = "il1Lo0O";

  let validChars = "";

  if (includeLowercase) validChars += lowercaseChars;
  if (includeUppercase) validChars += uppercaseChars;
  if (includeNumbers) validChars += numberChars;
  if (includeSymbols) validChars += symbolChars;

  if (excludeSimilarChars) {
    validChars = validChars
      .split("")
      .filter((char) => !similarChars.includes(char))
      .join("");
  }

  if (validChars.length === 0) return "";

  let password = "";
  const charactersLength = validChars.length;

  // Use Web Crypto API for secure random values if available
  if (hasCrypto) {
    // Create an array to hold random values
    const randomValues = new Uint32Array(length);

    // Fill the array with random values
    window.crypto.getRandomValues(randomValues);

    // Use the random values to select characters
    for (let i = 0; i < length; i++) {
      // Use modulo to get a valid index in the character set
      const randomIndex = randomValues[i] % charactersLength;
      password += validChars.charAt(randomIndex);
    }
  } else {
    // Fallback to Math.random() if crypto is not available
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      password += validChars.charAt(randomIndex);
    }
  }

  return password;
}

// Function to measure password strength
export function checkPasswordStrength(password) {
  if (!password) return { score: 0, feedback: "No password provided" };

  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  let score = 0;

  // Length check
  if (length > 8) score += 1;
  if (length > 12) score += 1;
  if (length > 16) score += 1;

  // Character variety check
  if (hasLower) score += 1;
  if (hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSymbol) score += 1;

  // Cap score at 5
  score = Math.min(5, score);

  // Provide feedback based on score
  let feedback = "";
  switch (score) {
    case 0:
    case 1:
      feedback = "Very Weak";
      break;
    case 2:
      feedback = "Weak";
      break;
    case 3:
      feedback = "Moderate";
      break;
    case 4:
      feedback = "Strong";
      break;
    case 5:
      feedback = "Very Strong";
      break;
    default:
      feedback = "Unknown";
  }

  return { score, feedback };
}

// Copy to clipboard with auto-clear
export function useCopyToClipboard(resetInterval = 15000) {
  // 15 seconds default
  const [isCopied, setIsCopied] = useState(false);
  const [clearTimer, setClearTimer] = useState(null);

  const copyToClipboard = async (text) => {
    if (!text) return;

    try {
      // Copy text to clipboard
      await navigator.clipboard.writeText(text);
      setIsCopied(true);

      // Set up auto-clear of clipboard after the reset interval
      if (clearTimer) clearTimeout(clearTimer);

      const timer = setTimeout(() => {
        // Clear clipboard by writing an empty string
        navigator.clipboard
          .writeText("")
          .catch((err) => console.error("Failed to clear clipboard:", err));
      }, resetInterval);

      setClearTimer(timer);
    } catch (error) {
      console.error("Failed to copy: ", error);
      setIsCopied(false);
    }
  };

  useEffect(() => {
    if (isCopied) {
      // Reset the copied state after a shorter duration (visual feedback)
      const feedbackTimer = setTimeout(() => {
        setIsCopied(false);
      }, 3000); // Reset the UI indicator after 3 seconds

      return () => {
        clearTimeout(feedbackTimer);
        if (clearTimer) clearTimeout(clearTimer);
      };
    }
  }, [isCopied, clearTimer]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, [clearTimer]);

  return [isCopied, copyToClipboard];
}
