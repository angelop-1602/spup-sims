/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/recruitment/:path*",
        destination: "https://sims.spup.space/api/v1/recruitment/:path*",
      },
    ]
  },
}

export default nextConfig