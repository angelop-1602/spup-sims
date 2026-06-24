import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const metrics = [
  {
    label: "Employees",
    value: "0",
  },
  {
    label: "Applicants",
    value: "0",
  },
  {
    label: "Pending Reviews",
    value: "0",
  },
]

export default function HrmDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">
          HRM Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Human resource management overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="rounded-lg">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
