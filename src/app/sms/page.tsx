"use client";

import { PhoneChat } from "@/components/PhoneChat";
import { TopNav } from "@/components/TopNav";

export default function SmsPage() {
  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl px-5 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Matt&apos;s phone
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            SMS approval simulator. Reply SEND, EDIT, or SKIP.
          </p>
        </header>

        <PhoneChat />
      </main>
    </>
  );
}
