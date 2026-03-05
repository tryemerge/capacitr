/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@capacitr/database'],
  experimental: {
    serverComponentsExternalPackages: ['postgres'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'pino-pretty': false,
      'pino': false,
      '@react-native-async-storage/async-storage': false,
    };
    return config;
  },
};
module.exports = nextConfig;
