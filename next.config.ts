import type { NextConfig } from "next";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  async rewrites() {
    return [
      {
        source: "/jira-proxy/:path*",
        destination: `https://${process.env.NEXT_PUBLIC_JIRA_DOMAIN}/:path*`,
      },
    ];
  },
};

export default withFlowbiteReact(nextConfig);