/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@capacitr/database'],
  experimental: {
    serverComponentsExternalPackages: ['postgres'],
  },
};
module.exports = nextConfig;
