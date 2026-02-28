"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { DashboardShell } from "@/components/dashboard-shell";
import { OverviewStats } from "@/components/overview-stats";
import { OverviewCharts } from "@/components/overview-charts";
import { RecentInvoices } from "@/components/recent-invoices";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return null;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <OverviewStats />
        <OverviewCharts />
        <RecentInvoices />
      </div>
    </DashboardShell>
  );
}