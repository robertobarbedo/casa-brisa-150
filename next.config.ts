import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Garante que o CSV de preços viaje junto no deploy (ele é lido no servidor).
  outputFileTracingIncludes: {
    "/**": ["./public/prices.csv"],
  },
};

export default nextConfig;
