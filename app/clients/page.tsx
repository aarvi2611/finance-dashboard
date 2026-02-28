"use client"

import { DashboardShell } from "@/components/dashboard-shell"
import { ClientsTable } from "@/components/clients-table"

export default function ClientsPage() {
  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">
            Clients
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your client directory.
          </p>
        </div>
        <ClientsTable />
      </div>
    </DashboardShell>
  )
}
