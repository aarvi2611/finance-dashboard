"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { InvoicesTable } from "@/components/invoices-table"

export default function InvoicesPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, manage, and export your invoices.
          </p>
        </div>
        <InvoicesTable />
      </div>
    </DashboardShell>
  )
}
