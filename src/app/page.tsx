"use client";

import Link from "next/link";
import { JobCard } from "@/components/JobCard";
import { TopNav } from "@/components/TopNav";
import { useStore } from "@/lib/store";

export default function HomePage() {
  const state = useStore();
  const jobs = state.jobs;

  const pending = jobs.filter(
    (j) => j.invoiceStatus === "not_created" || j.invoiceStatus === "draft",
  ).length;

  return (
    <>
      <TopNav showReset />
      <main className="mx-auto w-full max-w-5xl px-5 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Detected jobs
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Completed jobs from Matt&apos;s Google Calendar and Trello.
              {pending > 0 ? (
                <>
                  {" "}
                  <span className="font-medium text-slate-700">
                    {pending} need invoicing.
                  </span>
                </>
              ) : (
                " Everything is handled."
              )}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Go to dashboard
          </Link>
        </header>

        {jobs.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-sm font-medium text-slate-600">
              No jobs detected yet.
            </p>
            <p className="mt-1 text-sm text-slate-400">
              When a Calendar event or Trello card is marked complete, it shows
              up here.
            </p>
          </div>
        ) : (
          <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
