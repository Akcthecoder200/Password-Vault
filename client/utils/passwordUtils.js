import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

// Function to generate a random password
export function generatePassword({
  length = 12,
  includeSymbols = true,
  includeNumbers = true,
  includeLowercase = true,
  includeUppercase = true,
  excludeSimilarChars = false,
}) {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_-+={}[]|:;<>,.?/~';
  
  // Characters that look similar
  const similarChars = 'il1Lo0O';
  
  let validChars = '';
  
  if (includeLowercase) validChars += lowercaseChars;
  if (includeUppercase) validChars += uppercaseChars;
  if (includeNumbers) validChars += numberChars;
  if (includeSymbols) validChars += symbolChars;
  
  if (excludeSimilarChars) {
    validChars = validChars
      .split('')
      .filter(char => !similarChars.includes(char))
      .join('');
  }
  
  if (validChars.length === 0) return '';
  
  let password = '';
  const charactersLength = validChars.length;
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    password += validChars.charAt(randomIndex);
  }
  
  return password;
}

// Function to measure password strength
export function checkPasswordStrength(password) {
  if (!password) return { score: 0, feedback: 'No password provided' };
  
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
  let feedback = '';
  switch (score) {
    case 0:
    case 1:
      feedback = 'Very Weak';
      break;
    case 2:
      feedback = 'Weak';
      break;
    case 3:
      feedback = 'Moderate';
      break;
    case 4:
      feedback = 'Strong';
      break;
    case 5:
      feedback = 'Very Strong';
      break;
    default:
      feedback = 'Unknown';
  }
  
  return { score, feedback };
}

// Copy to clipboard with auto-clear
export function useCopyToClipboard(resetInterval = 3000) {
  const [isCopied, setIsCopied] = useState(false);
  
  const copyToClipboard = async (text) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (error) {
      console.error('Failed to copy: ', error);
      setIsCopied(false);
    }
  };
  
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, resetInterval);
      
      return () => clearTimeout(timer);
    }
  }, [isCopied, resetInterval]);
  
  return [isCopied, copyToClipboard];
}