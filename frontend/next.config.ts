import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // uncomment the following lines in case you want to ignore typescript and eslint errors
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        hostname: '**',
      },
    ],
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: '/media/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_MEDIA}/media/:path*`, // Proxy to Media
  //     },
  //   ];
  // },
};

export default nextConfig;