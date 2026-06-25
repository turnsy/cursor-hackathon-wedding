"use client";

import { ActivityFeed } from "@/components/ActivityFeed";
import { IntegrationsPanel } from "@/components/IntegrationsPanel";
import { InvoiceLedger } from "@/components/InvoiceLedger";
import { KpiCards } from "@/components/KpiCards";
import { TopNav } from "@/components/TopNav";

export default function DashboardPage() {
  return (
    <>
      <TopNav showReset />
      <main className="mx-auto w-full max-w-6xl px-5 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Matt&apos;s dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review every invoice, see what&apos;s been paid, and check your
            connected tools.
          </p>
        </header>

        <KpiCards />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <InvoiceLedger />
          </div>
          <div className="space-y-6">
            <IntegrationsPanel />
            <ActivityFeed />
          </div>
        </div>
      </main>
    </>
  );
}
