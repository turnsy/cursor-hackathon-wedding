import { integrations } from "@/lib/seed";

// Short initials used as a stand-in for each provider's logo.
function initials(name: string): string {
  return name
    .replace(/\(.*\)/, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function IntegrationsPanel() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Connected backends
        </h2>
        <p className="text-xs text-slate-400">
          Matt&apos;s existing tools. Mocked for the demo; each maps to a real
          OAuth adapter in production.
        </p>
      </div>
      <ul className="divide-y divide-slate-100">
        {integrations.map((it) => (
          <li key={it.id} className="flex items-center gap-3 px-5 py-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              {initials(it.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {it.name}
              </p>
              <p className="truncate text-xs text-slate-400">
                {it.category} &middot; {it.accountLabel}
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
              <span className="mt-1 text-[11px] text-slate-400">
                {it.lastSyncLabel}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
