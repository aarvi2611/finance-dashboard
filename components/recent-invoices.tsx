"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getInvoices, getClients, getInvoiceGrandTotal, type InvoiceStatus } from "@/lib/data"

const statusBadge: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "bg-success/15 text-success border-success/20" },
  sent: { label: "Sent", className: "bg-primary/15 text-primary border-primary/20" },
  overdue: { label: "Overdue", className: "bg-destructive/15 text-destructive border-destructive/20" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
}

export function RecentInvoices() {
  const recentInvoices = useMemo(() => {
    const invoices = getInvoices()
    const clients = getClients()
    return invoices.slice(0, 5).map((inv) => ({
      ...inv,
      client: clients.find((c) => c.id === inv.clientId),
      total: getInvoiceGrandTotal(inv),
    }))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-card-foreground">Recent Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {recentInvoices.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {inv.number}
                </span>
                <span className="text-xs text-muted-foreground">
                  {inv.client?.name ?? "Unknown"} &middot; {inv.client?.company}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={statusBadge[inv.status].className}>
                  {statusBadge[inv.status].label}
                </Badge>
                <span className="text-sm font-semibold tabular-nums text-foreground font-mono">
                  ${inv.total.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
