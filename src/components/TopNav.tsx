"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { resetDemo } from "@/lib/store";

const LINKS = [
  { href: "/", label: "Jobs" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sms", label: "Matt's phone" },
  { href: "/inbox", label: "Inbox" },
];

export function TopNav({ showReset = false }: { showReset?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
            IM
          </span>
          <span className="text-sm font-bold tracking-tight text-slate-900">
            InvoiceMate
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {LINKS.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {showReset && (
            <button
              onClick={resetDemo}
              className="ml-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Reset
            </button>
          )}
        </nav>
      </div>
    </div>
  );
}
