import { useState, useEffect } from "react";
import Button from "../components/Button";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../utils/auth";
import { useEncryption } from "../utils/encryptionContext";
import _sodium from "libsodium-wrappers"; // Import sodium for preloading

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sodiumLoaded, setSodiumLoaded] = useState(false);
  const { login } = useAuth();
  const { initializeEncryption } = useEncryption();
  const router = useRouter();

  // Preload sodium library when component mounts
  useEffect(() => {
    async function preloadSodium() {
      try {
        console.log("Preloading sodium library...");
        const startTime = performance.now();
        await _sodium.ready;
        const endTime = performance.now();
        console.log(
          `Sodium preloaded in ${(endTime - startTime).toFixed(2)}ms`
        );
        setSodiumLoaded(true);
      } catch (error) {
        console.error("Failed to preload sodium:", error);
      }
    }

    preloadSodium();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const startTime = performance.now();
    console.log("Login process started");

    try {
      // Skip sodium initialization check since we preloaded it
      if (!sodiumLoaded) {
        console.log("Waiting for sodium to load...");
        // Small timeout to give sodium a chance to finish loading if it hasn't already
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      console.log("Sending login request...");
      const result = await login(formData);
      console.log(
        `Login request completed in ${(performance.now() - startTime).toFixed(
          2
        )}ms`
      );

      if (result.success) {
        if (!result.encSalt) {
          setError(
            "Login successful but encryption salt is missing. Please contact support."
          );
          setIsLoading(false);
          return;
        }

        console.log("Initializing encryption...");
        const encInitStart = performance.now();

        // Initialize encryption with the user's password and salt
        const encryptionSuccess = await initializeEncryption(
          formData.password,
          result.encSalt
        );

        console.log(
          `Encryption initialized in ${(
            performance.now() - encInitStart
          ).toFixed(2)}ms`
        );

        if (!encryptionSuccess) {
          setError("Failed to initialize encryption. Please try again.");
          setIsLoading(false);
          return;
        }

        const totalTime = performance.now() - startTime;
        console.log(
          `Total login process completed in ${totalTime.toFixed(2)}ms`
        );

        router.push("/dashboard");
      } else {
        setError(
          result.message || "Login failed. Please check your credentials."
        );
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-primary-700 mb-2">
        Password Vault
      </h1>
      <p className="text-gray-500 mb-8">Secure access to your passwords</p>

      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Login</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="text-primary-600 hover:text-primary-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <Button
              className="w-full py-2.5"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
