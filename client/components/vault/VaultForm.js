import { useState, useEffect } from "react";
import {
  generatePassword,
  checkPasswordStrength,
} from "../../utils/passwordUtils";
import Button from "../Button";

export default function VaultForm({
  initialData = {
    siteName: "",
    siteUrl: "",
    username: "",
    password: "",
    notes: "",
  },
  onSubmit,
  onCancel,
  isEditing = false,
}) {
  const [formData, setFormData] = useState(initialData);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  });
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  const [passwordOptions, setPasswordOptions] = useState({
    length: 16,
    includeSymbols: true,
    includeNumbers: true,
    includeLowercase: true,
    includeUppercase: true,
    excludeSimilarChars: false,
  });

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(checkPasswordStrength(formData.password));
    }
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPasswordOptions((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleGeneratePassword = () => {
    const password = generatePassword(passwordOptions);
    setFormData((prev) => ({ ...prev, password }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleGenerateOptions = () => {
    setIsGeneratingPassword(!isGeneratingPassword);
  };

  // Get color based on password strength score
  const getStrengthColor = (score) => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-green-600";
      default:
        return "bg-gray-300";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="siteName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Site Name*
        </label>
        <input
          id="siteName"
          name="siteName"
          type="text"
          required
          value={formData.siteName}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Google, Facebook, Twitter, etc."
        />
      </div>

      <div>
        <label
          htmlFor="siteUrl"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Site URL
        </label>
        <input
          id="siteUrl"
          name="siteUrl"
          type="text"
          value={formData.siteUrl}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Username/Email*
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="john.doe@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Password*
        </label>
        <div className="flex space-x-2">
          <input
            id="password"
            name="password"
            type="text"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          <Button
            type="button"
            variant="secondary"
            className="whitespace-nowrap"
            onClick={toggleGenerateOptions}
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

        {/* Password generator options */}
        {isGeneratingPassword && (
          <div className="mt-3 p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Password Generator
            </h4>

            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">
                Length: {passwordOptions.length}
              </label>
              <input
                type="range"
                name="length"
                min="8"
                max="32"
                value={passwordOptions.length}
                onChange={handlePasswordOptionsChange}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeUppercase"
                  name="includeUppercase"
                  checked={passwordOptions.includeUppercase}
                  onChange={handlePasswordOptionsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="includeUppercase"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Uppercase (A-Z)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeLowercase"
                  name="includeLowercase"
                  checked={passwordOptions.includeLowercase}
                  onChange={handlePasswordOptionsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="includeLowercase"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Lowercase (a-z)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeNumbers"
                  name="includeNumbers"
                  checked={passwordOptions.includeNumbers}
                  onChange={handlePasswordOptionsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="includeNumbers"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Numbers (0-9)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeSymbols"
                  name="includeSymbols"
                  checked={passwordOptions.includeSymbols}
                  onChange={handlePasswordOptionsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="includeSymbols"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Symbols (!@#$%^&*)
                </label>
              </div>

              <div className="flex items-center col-span-2">
                <input
                  type="checkbox"
                  id="excludeSimilarChars"
                  name="excludeSimilarChars"
                  checked={passwordOptions.excludeSimilarChars}
                  onChange={handlePasswordOptionsChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="excludeSimilarChars"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Exclude similar characters (i, l, 1, L, o, 0, O)
                </label>
              </div>
            </div>

            <div className="mt-3">
              <Button
                type="button"
                onClick={handleGeneratePassword}
                className="w-full"
              >
                Generate Password
              </Button>
            </div>
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Additional information..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{isEditing ? "Update" : "Save"}</Button>
      </div>
    </form>
  );
}
