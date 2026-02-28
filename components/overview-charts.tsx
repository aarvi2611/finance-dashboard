"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { getInvoices, getInvoiceGrandTotal, type InvoiceStatus } from "@/lib/data"

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid: "oklch(0.55 0.16 155)",
  sent: "oklch(0.45 0.18 250)",
  overdue: "oklch(0.577 0.245 27.325)",
  draft: "oklch(0.50 0.02 250)",
}

export function OverviewCharts() {
  const { monthlyData, statusData } = useMemo(() => {
    const invoices = getInvoices()
    const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
    const monthMap: Record<string, number> = {}
    months.forEach((m) => (monthMap[m] = 0))

    invoices.forEach((inv) => {
      const date = new Date(inv.issueDate)
      const monthName = date.toLocaleString("en-US", { month: "short" })
      if (monthMap[monthName] !== undefined) {
        monthMap[monthName] += getInvoiceGrandTotal(inv)
      }
    })

    const monthly = months.map((m) => ({ month: m, amount: monthMap[m] }))

    const statusCount: Record<InvoiceStatus, number> = {
      paid: 0,
      sent: 0,
      overdue: 0,
      draft: 0,
    }
    invoices.forEach((inv) => {
      statusCount[inv.status] += getInvoiceGrandTotal(inv)
    })

    const status = (Object.entries(statusCount) as [InvoiceStatus, number][])
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: STATUS_COLORS[name],
      }))

    return { monthlyData: monthly, statusData: status }
  }, [])

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-card-foreground">Revenue by Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="oklch(0.91 0.008 250)"
                />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  stroke="oklch(0.50 0.02 250)"
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                  stroke="oklch(0.50 0.02 250)"
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.91 0.008 250)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill="oklch(0.45 0.18 250)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-card-foreground">Invoice Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.91 0.008 250)",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  formatter={(value: string) => (
                    <span style={{ color: "oklch(0.50 0.02 250)", fontSize: "13px" }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
