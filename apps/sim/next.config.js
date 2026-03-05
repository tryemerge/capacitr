/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@capacitr/facilitator', '@capacitr/database'],
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/claude-agent-sdk', 'postgres'],
  },
};
module.exports = nextConfig;
