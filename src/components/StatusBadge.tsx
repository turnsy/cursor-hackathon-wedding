import type { InvoiceStatus, JobInvoiceStatus } from "@/lib/types";

const LABELS: Record<JobInvoiceStatus, string> = {
  not_created: "Not sent",
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  skipped: "Skipped",
};

const STYLES: Record<JobInvoiceStatus, string> = {
  not_created: "bg-slate-100 text-slate-600 ring-slate-200",
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  sent: "bg-blue-50 text-blue-700 ring-blue-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  skipped: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({
  status,
}: {
  status: JobInvoiceStatus | InvoiceStatus;
}) {
  const key = status as JobInvoiceStatus;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[key]}`}
    >
      {LABELS[key]}
    </span>
  );
}
