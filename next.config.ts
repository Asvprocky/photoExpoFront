import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // 빌드 시 ESLint 무시
  },
  async rewrites() {
    // Cors 우회 Next.js 프록시(rewrite)
    return [
      {
        source: "/api/:path*",
        destination: "http://15.165.161.240:8080/:path*",
      },
    ];
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
