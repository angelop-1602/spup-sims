/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/hrms/:path*',
        destination: 'https://sims.spup.space/api/v1/hrms/:path*',
      },
    ]
  },
}

export default nextConfig