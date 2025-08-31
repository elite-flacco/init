/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // During development, we might have type errors while migrating
    ignoreBuildErrors: true,
  },
  eslint: {
    // During development, we might have linting errors while migrating
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "pixabay.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
