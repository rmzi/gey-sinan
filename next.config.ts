import type { NextConfig } from "next";
// @ts-expect-error - next-pwa lacks type definitions
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Use webpack for PWA support
  turbopack: {},
};

export default withPWA(nextConfig);
