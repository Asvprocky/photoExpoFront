import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 무시
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aws-s3-photoexpo.s3.ap-northeast-2.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
