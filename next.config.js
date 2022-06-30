/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '/personal-webview',
}

module.exports = nextConfig
