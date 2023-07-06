/** @type {import('next').NextConfig} */

const nextConfig = {
  env: {
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    SERVER_API_URI: process.env.SERVER_API_URI,
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8800/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
