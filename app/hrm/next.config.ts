/** @type {import('next').NextConfig} */
const API_BASE_URL =
  process.env.API_BASE_URL ?? "https://sims.spup.space"

const nextConfig = {
  output: "standalone",
  // Pin the tracing root to this app; the host machine has an ancestor
  // lockfile that would otherwise make Next guess the monorepo root.
  outputFileTracingRoot: process.cwd(),
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