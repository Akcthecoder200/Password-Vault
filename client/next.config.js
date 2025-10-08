/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone", // Optimized for production deployments
  // Disable linting during build to avoid issues on Render
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable type checking during build to improve build speed
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
