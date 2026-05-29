/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1MB; anything bigger than that should use a route handler,
      // but bumping this keeps small/medium uploads through actions safe.
      bodySizeLimit: "10mb",
    },
    // Optimizes packages for faster server-side rendering.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

export default nextConfig;
