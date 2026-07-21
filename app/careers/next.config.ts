/** @type {import('next').NextConfig} */
const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://sims.spup.space"

const nextConfig = {
  async rewrites() {
    const base = API_BASE_URL.replace(/\/+$/, "")

    return [
      {
        source: "/api/v1/applicant/:path*",
        destination: `${base}/api/v1/applicant/:path*`,
      },
    ]
  },
}

export default nextConfig
