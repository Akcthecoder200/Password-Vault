import Navbar from "./Navbar";
import Head from "next/head";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>Password Vault - Secure Password Manager</title>
        <meta
          name="description"
          content="A secure, client-side encrypted password manager to safely store all your passwords"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Using custom favicon image */}
        <link
          rel="icon"
          href="/favicon/passwrd vault img.jpg"
          type="image/jpeg"
        />
      </Head>
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">{children}</main>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>
            Password Vault © {new Date().getFullYear()} - Secure your passwords
            safely
          </p>
        </div>
      </footer>
    </div>
  );
}
