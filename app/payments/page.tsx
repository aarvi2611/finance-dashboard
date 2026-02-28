"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { PaymentsTable } from "@/components/payments-table"

export default function PaymentsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Payments
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track and record payments against your invoices.
          </p>
        </div>
        <PaymentsTable />
      </div>
    </DashboardShell>
  )
}
