/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
