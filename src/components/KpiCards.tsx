"use client";

import { getStats, useStore } from "@/lib/store";
import { money } from "@/lib/format";

export function KpiCards() {
  const state = useStore();
  const { collected, outstanding, counts } = getStats(state);
  const needsInvoicing = counts.not_created + counts.draft;

  const cards = [
    {
      label: "Collected",
      value: money(collected),
      hint: `${counts.paid} paid`,
      accent: "text-emerald-600",
    },
    {
      label: "Awaiting payment",
      value: money(outstanding),
      hint: `${counts.sent} sent`,
      accent: "text-blue-600",
    },
    {
      label: "Needs invoicing",
      value: String(needsInvoicing),
      hint: needsInvoicing === 1 ? "job" : "jobs",
      accent: "text-amber-600",
    },
    {
      label: "Skipped",
      value: String(counts.skipped),
      hint: counts.skipped === 1 ? "job" : "jobs",
      accent: "text-rose-600",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {c.label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${c.accent}`}>{c.value}</p>
          <p className="mt-1 text-xs text-slate-400">{c.hint}</p>
        </div>
      ))}
    </section>
  );
}
