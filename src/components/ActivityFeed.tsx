"use client";

import { useStore } from "@/lib/store";
import { relativeTime } from "@/lib/format";
import type { ActivityKind } from "@/lib/types";

const DOT: Record<ActivityKind, string> = {
  job_detected: "bg-slate-400",
  reminder_sent: "bg-violet-500",
  amount_edited: "bg-amber-500",
  due_edited: "bg-amber-500",
  invoice_sent: "bg-blue-500",
  invoice_emailed: "bg-sky-500",
  payment_received: "bg-emerald-500",
  job_skipped: "bg-rose-500",
};

export function ActivityFeed() {
  const state = useStore();
  const events = [...state.events].reverse();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Recent activity
        </h2>
        <p className="text-xs text-slate-400">
          Detections, reminders, sends, and payments.
        </p>
      </div>
      {events.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-slate-400">
          No activity yet.
        </div>
      ) : (
        <ul className="max-h-[26rem] divide-y divide-slate-100 overflow-y-auto">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-3 px-5 py-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[e.kind]}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">{e.label}</p>
                <p className="text-xs text-slate-400">
                  {relativeTime(e.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
