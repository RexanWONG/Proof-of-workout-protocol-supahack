require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "",
  env: {
    NEXT_STRAVA_CLIENT_ID: process.env.NEXT_STRAVA_CLIENT_ID,
    NEXT_PROJECT_ID: process.env.NEXT_PROJECT_ID,
    NEXT_PROJECT_SECRET_KEY: process.env.NEXT_PROJECT_SECRET_KEY
  },
};

module.exports = nextConfig;
