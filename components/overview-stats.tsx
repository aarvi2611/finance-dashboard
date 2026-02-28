"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
} from "lucide-react"
import {
  getClients,
  getInvoices,
  getPayments,
  getInvoiceGrandTotal,
} from "@/lib/data"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-card-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export function OverviewStats() {
  const stats = useMemo(() => {
    const clients = getClients()
    const invoices = getInvoices()
    const payments = getPayments()

    const totalRevenue = invoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + getInvoiceGrandTotal(inv), 0)

    const totalOutstanding = invoices
      .filter((inv) => inv.status === "sent" || inv.status === "overdue")
      .reduce((sum, inv) => sum + getInvoiceGrandTotal(inv), 0)

    const overdueCount = invoices.filter((inv) => inv.status === "overdue").length
    const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)

    return { clients, invoices, totalRevenue, totalOutstanding, overdueCount, totalPayments }
  }, [])

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Revenue"
        value={`$${stats.totalRevenue.toLocaleString()}`}
        description={`From ${stats.invoices.filter((i) => i.status === "paid").length} paid invoices`}
        icon={<DollarSign className="size-4" />}
      />
      <StatCard
        title="Outstanding"
        value={`$${stats.totalOutstanding.toLocaleString()}`}
        description={`${stats.invoices.filter((i) => i.status === "sent").length} sent, ${stats.overdueCount} overdue`}
        icon={<FileText className="size-4" />}
      />
      <StatCard
        title="Total Clients"
        value={String(stats.clients.length)}
        description="Active clients"
        icon={<Users className="size-4" />}
      />
      <StatCard
        title="Overdue"
        value={String(stats.overdueCount)}
        description="Requires attention"
        icon={<AlertTriangle className="size-4" />}
      />
    </div>
  )
}
