import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Using the custom image from favicon folder */}
        <link
          rel="icon"
          href="/favicon/passwrd vault img.jpg"
          type="image/jpeg"
        />

        {/* For broader compatibility, we also add a few additional tags */}
        <link
          rel="shortcut icon"
          href="/favicon/passwrd vault img.jpg"
          type="image/jpeg"
        />
        <link rel="apple-touch-icon" href="/favicon/passwrd vault img.jpg" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
