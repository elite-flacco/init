/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // During development, we might have type errors while migrating
    ignoreBuildErrors: false,
  },
  eslint: {
    // During development, we might have linting errors while migrating
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig