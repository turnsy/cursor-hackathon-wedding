"use client";

import { useState } from "react";
import Link from "next/link";
import { getEmailForInvoice, getInvoiceForJob, useStore } from "@/lib/store";
import { money } from "@/lib/format";
import type { JobInvoiceStatus } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

type Filter = "all" | JobInvoiceStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "not_created", label: "Not sent" },
  { id: "sent", label: "Sent" },
  { id: "paid", label: "Paid" },
  { id: "skipped", label: "Skipped" },
];

export function InvoiceLedger() {
  const state = useStore();
  const [filter, setFilter] = useState<Filter>("all");

  const rows = state.jobs.filter((job) =>
    filter === "all" ? true : job.invoiceStatus === filter,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Invoices &amp; receipts
          </h2>
          <p className="text-xs text-slate-400">
            Every detected job and where its invoice stands.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === f.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-slate-400">
          No invoices match this filter.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((job) => {
                const invoice = getInvoiceForJob(state, job.id);
                const email = invoice
                  ? getEmailForInvoice(state, invoice.id)
                  : null;
                return (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {job.clientName}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{job.eventType}</td>
                    <td className="px-5 py-3 text-slate-500">{job.source}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      {money(job.amountDue)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={job.invoiceStatus} />
                    </td>
                    <td className="px-5 py-3">
                      {invoice ? (
                        <div className="flex flex-col">
                          <Link
                            href={invoice.paymentUrl}
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {invoice.id}
                          </Link>
                          <span className="text-xs text-slate-400">
                            {invoice.provider.replace("mock_", "")}
                            {email ? " \u00b7 Emailed" : ""}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
