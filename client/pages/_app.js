import "../styles/globals.css";
// Uncomment the line below if Tailwind CSS fails to load during deployment
// import "../styles/tailwind-fallback";
import { AuthProvider } from "../utils/auth";
import { EncryptionProvider } from "../utils/encryptionContext";
import Layout from "../components/layout/Layout";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <EncryptionProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </EncryptionProvider>
    </AuthProvider>
  );
}
