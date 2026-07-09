/** @type {import('next').NextConfig} */
const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://sims.spup.space"

const nextConfig = {
  async rewrites() {
    const base = API_BASE_URL.replace(/\/+$/, "")

    return [
      {
        source: "/api/v1/recruitment/:path*",
        destination: `${base}/api/v1/recruitment/:path*`,
      },
      {
        source: "/api/v1/core/:path*",
        destination: `${base}/api/v1/core/:path*`,
      },
      {
        source: "/api/v1/hrms/:path*",
        destination: `${base}/api/v1/hrms/:path*`,
      },
      {
        source: "/api/v1/public/:path*",
        destination: `${base}/api/v1/public/:path*`,
      },
    ]
  },
}

export default nextConfig