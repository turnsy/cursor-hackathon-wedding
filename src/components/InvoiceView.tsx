"use client";

import Link from "next/link";
import { getInvoiceById, payInvoice, useStore } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";

function money(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export function InvoiceView({ invoiceId }: { invoiceId: string }) {
  const state = useStore();
  const invoice = getInvoiceById(state, invoiceId);

  if (!invoice) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-slate-600">Invoice not found.</p>
        <p className="mt-1 text-sm text-slate-400">
          This invoice may not have been sent yet, or the demo was reset.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const paid = invoice.status === "paid";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between bg-slate-900 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-sm font-bold">
            MP
          </span>
          <div>
            <p className="text-base font-semibold">Matt Photography</p>
            <p className="text-xs text-slate-300">Invoice {invoice.id}</p>
          </div>
        </div>
        <StatusBadge status={invoice.status} />
      </div>

      <div className="px-6 py-6">
        {paid && (
          <div className="mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
            Payment received. Thank you.
          </div>
        )}

        <dl className="divide-y divide-slate-100 text-sm">
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500">Billed to</dt>
            <dd className="font-medium text-slate-900">{invoice.clientName}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500">Service</dt>
            <dd className="font-medium text-slate-900">
              {invoice.serviceDescription}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500">Due date</dt>
            <dd className="font-medium text-slate-900">{invoice.dueDate}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">
              {invoice.customerEmail}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-5">
          <span className="text-sm text-slate-500">Amount due</span>
          <span className="text-3xl font-bold text-slate-900">
            {money(invoice.amount)}
          </span>
        </div>

        <button
          onClick={() => payInvoice(invoice.id)}
          disabled={paid}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {paid ? "Paid" : `Pay Invoice ${money(invoice.amount)}`}
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">
          Secure payment simulated for demo &middot; {invoice.provider}
        </p>
      </div>
    </div>
  );
}
