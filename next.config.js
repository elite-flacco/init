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
};

export default nextConfig;
