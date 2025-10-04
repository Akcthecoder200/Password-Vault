import { useState, useEffect } from 'react';
import { generatePassword, checkPasswordStrength } from '../../utils/passwordUtils';
import { useCopyToClipboard } from '../../utils/passwordUtils';
import Button from '../Button';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: '' });
  const [isCopied, copyToClipboard] = useCopyToClipboard();
  
  const [options, setOptions] = useState({
    length: 16,
    includeSymbols: true,
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: true,
    excludeSimilarChars: false,
  });
  
  // Generate a password initially
  useEffect(() => {
    handleGeneratePassword();
  }, []);
  
  // Check password strength when password changes
  useEffect(() => {
    if (password) {
      setPasswordStrength(checkPasswordStrength(password));
    }
  }, [password]);
  
  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value),
    }));
  };
  
  const handleGeneratePassword = () => {
    // Ensure at least one character type is selected
    if (!options.includeSymbols && !options.includeNumbers && 
        !options.includeLowercase && !options.includeUppercase) {
      setOptions(prev => ({ ...prev, includeLowercase: true }));
      return;
    }
    
    const newPassword = generatePassword(options);
    setPassword(newPassword);
  };
  
  const handleCopyPassword = () => {
    if (password) {
      copyToClipboard(password);
    }
  };
  
  // Get color based on password strength score
  const getStrengthColor = (score) => {
    switch (score) {
      case 0: case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-green-600';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Password Generator</h2>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          Generated Password
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            id="password"
            value={password}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleCopyPassword}
            variant="secondary"
            className="whitespace-nowrap"
          >
            {isCopied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            onClick={handleGeneratePassword}
            variant="primary"
            className="whitespace-nowrap"
          >
            Generate
          </Button>
        </div>
        
        {/* Password strength indicator */}
        <div className="mt-2">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStrengthColor(passwordStrength.score)}`}
              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
            />
          </div>
          <p className="text-xs mt-1 text-gray-600">
            Strength: {passwordStrength.feedback}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password Length: {options.length}
          </label>
          <input
            type="range"
            name="length"
            min="8"
            max="32"
            value={options.length}
            onChange={handleOptionChange}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>8</span>
            <span>20</span>
            <span>32</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeUppercase"
              name="includeUppercase"
              checked={options.includeUppercase}
              onChange={handleOptionChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeUppercase" className="ml-2 block text-sm text-gray-700">
              Include uppercase letters (A-Z)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeLowercase"
              name="includeLowercase"
              checked={options.includeLowercase}
              onChange={handleOptionChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeLowercase" className="ml-2 block text-sm text-gray-700">
              Include lowercase letters (a-z)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeNumbers"
              name="includeNumbers"
              checked={options.includeNumbers}
              onChange={handleOptionChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeNumbers" className="ml-2 block text-sm text-gray-700">
              Include numbers (0-9)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeSymbols"
              name="includeSymbols"
              checked={options.includeSymbols}
              onChange={handleOptionChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="includeSymbols" className="ml-2 block text-sm text-gray-700">
              Include symbols (!@#$%^&*)
            </label>
          </div>
          
          <div className="flex items-center col-span-full">
            <input
              type="checkbox"
              id="excludeSimilarChars"
              name="excludeSimilarChars"
              checked={options.excludeSimilarChars}
              onChange={handleOptionChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="excludeSimilarChars" className="ml-2 block text-sm text-gray-700">
              Exclude similar characters (i, l, 1, L, o, 0, O)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}