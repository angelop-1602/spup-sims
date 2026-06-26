/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/recruitment/:path*",
        destination: "https://sims.spup.space/api/v1/recruitment/:path*",
      },
      {
        source: "/api/v1/core/:path*",
        destination: "https://sims.spup.space/api/v1/core/:path*",
        source: '/api/v1/hrms/:path*',
        destination: 'https://sims.spup.space/api/v1/hrms/:path*',
      },
    ]
  },
}

export default nextConfig