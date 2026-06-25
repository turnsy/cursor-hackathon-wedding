"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { InvoiceView } from "@/components/InvoiceView";

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  return (
    <main className="mx-auto w-full max-w-md px-5 py-12">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Customer invoice
        </p>
        <Link
          href="/sms"
          className="text-xs font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          Back to Matt&apos;s phone
        </Link>
      </div>
      <InvoiceView invoiceId={id} />
    </main>
  );
}
