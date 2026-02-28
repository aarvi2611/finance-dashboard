"use client"

import { DashboardSidebar } from "@/components/dashboard-sidebar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
