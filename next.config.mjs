/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  images: { unoptimized: true },
  poweredByHeader: false,
  async headers() {
    return ["/admin/:path*", "/api/admin/:path*"].map((source) => ({
      source, headers: [{ key: "Cache-Control", value: "private, no-store" }],
    }));
  },
};

export default nextConfig;
