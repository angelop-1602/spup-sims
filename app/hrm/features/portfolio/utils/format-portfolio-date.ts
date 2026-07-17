export function formatPortfolioDate(dateString: string | null | undefined) {
  if (!dateString) return "—"

  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
