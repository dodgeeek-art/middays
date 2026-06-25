import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development" || process.env.VERCEL !== "1",
  register: true,
});

const nextConfig: NextConfig = {
  experimental: {
    // @ts-expect-error: allowedDevOrigins is not typed in ExperimentalConfig but used by next-pwa/runtime
    allowedDevOrigins: ["192.168.1.161"],
  },
  turbopack: {},
};

export default withPWA(nextConfig);
