/** @type {import('next').NextConfig} */
const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");
const runtimeCaching = require("next-pwa/cache");

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching,
  sw: "/service-worker.js",
});

const nextConfig = {
  env: {
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    SERVER_API_URI: process.env.SERVER_API_URI,
  },
  images: {
    domains: [
      "sw-jungle-s3.s3.ap-northeast-2.amazonaws.com",
      "encrypted-tbn0.gstatic.com",
      "search.pstatic.net",
      "cdn.pixabay.com",
      "i.imgur.com",
      "ca.slack-edge.com",
    ],
    remotePatterns: [
      {
        // protocol: 'https',
        hostname: "sw-jungle-s3.s3.ap-northeast-2.amazonaws.com",
        // port: '',
        // pathname: '/account123/**',
      },
    ],
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: process.env.SOURCE_URL,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
