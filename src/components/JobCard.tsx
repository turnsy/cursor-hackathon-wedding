"use client";

import { useRouter } from "next/navigation";
import { askMattBySms } from "@/lib/store";
import type { Job } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function money(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

const SOURCE_DOT: Record<Job["source"], string> = {
  "Google Calendar": "bg-blue-500",
  Trello: "bg-sky-500",
};

export function JobCard({ job }: { job: Job }) {
  const router = useRouter();

  function handleAsk() {
    askMattBySms(job.id);
    router.push("/sms");
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {job.clientName}
          </h3>
          <p className="text-sm text-slate-500">{job.eventType}</p>
        </div>
        <StatusBadge status={job.invoiceStatus} />
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-900">
          {money(job.amountDue)}
        </span>
        <span className="text-sm text-slate-400">due</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
        <span>{job.completedDateLabel}</span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full ${SOURCE_DOT[job.source]}`}
            aria-hidden
          />
          {job.source}
        </span>
      </div>

      <div className="mt-3 text-xs text-slate-400">
        {job.customerEmail} &middot; {job.customerPhone}
      </div>

      <button
        onClick={handleAsk}
        className="mt-5 inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        Ask Matt by SMS
      </button>
    </div>
  );
}
