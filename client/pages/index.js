import Button from "../components/Button";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-primary-700 mb-8">
        Password Vault
      </h1>
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 space-y-4">
        <p className="text-gray-600">Welcome to your secure password manager</p>
        <div className="flex space-x-4">
          <Link href="/login" passHref>
            <Button variant="primary">Login</Button>
          </Link>
          <Link href="/register" passHref>
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
