/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@capacitr/facilitator'],
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/claude-agent-sdk'],
  },
};
module.exports = nextConfig;
