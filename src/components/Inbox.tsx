"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { shortTime } from "@/lib/format";

export function Inbox() {
  const state = useStore();
  const emails = [...state.emails].reverse();
  const [openId, setOpenId] = useState<string | null>(null);

  const open = emails.find((e) => e.id === openId) ?? null;

  if (emails.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-slate-600">Inbox is empty.</p>
        <p className="mt-1 text-sm text-slate-400">
          When Matt sends an invoice, the customer&apos;s emailed copy shows up
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {/* list */}
      <ul className="md:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {emails.map((e) => {
          const isOpen = e.id === openId;
          return (
            <li key={e.id}>
              <button
                onClick={() => setOpenId(e.id)}
                className={`flex w-full flex-col items-start gap-0.5 border-b border-slate-100 px-4 py-3 text-left transition ${
                  isOpen ? "bg-slate-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">
                    Matt Photography
                  </span>
                  <span className="text-xs text-slate-400">
                    {shortTime(e.createdAt)}
                  </span>
                </div>
                <span className="truncate text-sm text-slate-700">
                  {e.subject}
                </span>
                <span className="truncate text-xs text-slate-400">
                  {e.preview}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* reading pane */}
      <div className="md:col-span-3">
        {open ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              To: {open.to}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {open.subject}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              From Matt Photography &middot; billing@mattphoto.com
            </p>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <p>Hi,</p>
              <p>
                Thanks again! {open.preview} You can review the details and pay
                securely online using the button below.
              </p>
              <Link
                href={`/invoice/${open.invoiceId}`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto"
              >
                View &amp; Pay Invoice
              </Link>
              <p className="pt-2 text-slate-500">— Matt Photography</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[12rem] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
            Select an email to read it.
          </div>
        )}
      </div>
    </div>
  );
}
