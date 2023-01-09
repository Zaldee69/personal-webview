/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  assetPrefix: "",
  i18n: {
    locales: ["id", "en"],
    defaultLocale: "id",
    localeDetection: false
  }
}

module.exports = nextConfig;
