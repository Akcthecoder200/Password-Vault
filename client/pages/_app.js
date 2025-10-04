import "../styles/globals.css";
import { AuthProvider } from "../utils/auth";
import Layout from "../components/layout/Layout";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
