"use client";

import { Inbox } from "@/components/Inbox";
import { TopNav } from "@/components/TopNav";

export default function InboxPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-4xl px-5 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer inbox
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            The customer&apos;s mailbox. Emailed invoices arrive here (mock email
            delivery).
          </p>
        </header>
        <Inbox />
      </main>
    </>
  );
}
