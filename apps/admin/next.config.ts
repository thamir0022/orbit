import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@orbit/ui", "@orbit/http-client"],
};

export default nextConfig;
