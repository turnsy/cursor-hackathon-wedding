"use client";

import { useSyncExternalStore } from "react";
import { createInitialState } from "./seed";
import type {
  ActivityEvent,
  ActivityKind,
  DemoState,
  Email,
  Invoice,
  Job,
  JobInvoiceStatus,
  Message,
} from "./types";

const STORAGE_KEY = "invoicemate_state_v2";

// SSR-safe baseline. The server and the first client render use this so
// hydration matches; real persisted state is loaded after mount.
const serverState: DemoState = createInitialState();

let state: DemoState = serverState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private-mode errors in the demo
  }
}

function loadFromStorage(): DemoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DemoState;
  } catch {
    return null;
  }
}

function setState(next: DemoState, options: { persist?: boolean } = {}) {
  state = next;
  if (options.persist !== false) persist();
  emit();
}

function ensureHydrated() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const loaded = loadFromStorage();
  if (loaded) {
    state = loaded;
  } else {
    persist();
  }
  // Live cross-page / cross-tab updates: when another page writes, refresh.
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    const loadedState = loadFromStorage();
    if (loadedState) {
      state = loadedState;
      emit();
    }
  });
  emit();
}

function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): DemoState {
  return state;
}

function getServerSnapshot(): DemoState {
  return serverState;
}

export function useStore(): DemoState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// --- helpers ---

function nowIso(): string {
  return new Date().toISOString();
}

function shortId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

function money(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

function addMessage(from: Message["from"], body: string): Message {
  return { id: shortId("msg"), from, body, createdAt: nowIso() };
}

function makeEvent(
  kind: ActivityKind,
  label: string,
  refs: { jobId?: string; invoiceId?: string } = {},
): ActivityEvent {
  return {
    id: shortId("evt"),
    kind,
    label,
    jobId: refs.jobId,
    invoiceId: refs.invoiceId,
    createdAt: nowIso(),
  };
}

function setJobStatus(
  jobs: Job[],
  jobId: string,
  invoiceStatus: JobInvoiceStatus,
): Job[] {
  return jobs.map((j) => (j.id === jobId ? { ...j, invoiceStatus } : j));
}

export function getActiveJob(s: DemoState): Job | null {
  return s.jobs.find((j) => j.id === s.activeJobId) ?? null;
}

export function getActiveInvoice(s: DemoState): Invoice | null {
  if (!s.activeJobId) return null;
  return s.invoices.find((inv) => inv.jobId === s.activeJobId) ?? null;
}

export function getInvoiceById(s: DemoState, id: string): Invoice | null {
  return s.invoices.find((inv) => inv.id === id) ?? null;
}

export function getInvoiceForJob(s: DemoState, jobId: string): Invoice | null {
  return s.invoices.find((inv) => inv.jobId === jobId) ?? null;
}

export function getEmailForInvoice(s: DemoState, invoiceId: string): Email | null {
  return s.emails.find((e) => e.invoiceId === invoiceId) ?? null;
}

export type DemoStats = {
  collected: number;
  outstanding: number;
  counts: Record<JobInvoiceStatus, number>;
};

export function getStats(s: DemoState): DemoStats {
  const counts: Record<JobInvoiceStatus, number> = {
    not_created: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    skipped: 0,
  };
  for (const job of s.jobs) counts[job.invoiceStatus] += 1;

  const collected = s.invoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const outstanding = s.invoices
    .filter((inv) => inv.status === "sent")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return { collected, outstanding, counts };
}

// --- actions ---

export function askMattBySms(jobId: string) {
  const job = state.jobs.find((j) => j.id === jobId);
  if (!job) return;

  const amountSuggestion = job.amountDue + 200;
  const body =
    `You finished ${job.clientName}'s ${job.eventType} job ${job.completedDateLabel
      .replace(/^Completed\s*/i, "")
      .trim()}. ` +
    `I found ${money(job.amountDue)} due. Send invoice now? ` +
    `Reply SEND, EDIT amount ${amountSuggestion}, or SKIP.`;

  setState({
    ...state,
    activeJobId: jobId,
    messages: [...state.messages, addMessage("agent", body)],
    events: [
      ...state.events,
      makeEvent("reminder_sent", `SMS reminder sent to Matt about ${job.clientName}`, {
        jobId,
      }),
    ],
  });
}

// Mock email creation. In production this is EmailProvider.sendInvoiceEmail().
function buildEmail(invoice: Invoice): Email {
  return {
    id: shortId("email"),
    to: invoice.customerEmail,
    subject: `Invoice from Matt Photography \u2014 ${money(invoice.amount)}`,
    preview: `Your invoice for ${invoice.serviceDescription} is ready. Tap to view and pay securely.`,
    invoiceId: invoice.id,
    createdAt: nowIso(),
  };
}

// Mock invoice creation. In production this is InvoiceProvider.createInvoice().
function buildInvoice(job: Job): Invoice {
  const id = shortId("inv");
  return {
    id,
    jobId: job.id,
    clientName: job.clientName,
    serviceDescription: job.eventType,
    amount: job.amountDue,
    dueDate: "Due on receipt",
    customerPhone: job.customerPhone,
    customerEmail: job.customerEmail,
    status: "draft",
    paymentUrl: `/invoice/${id}`,
    provider: "mock_quickbooks",
  };
}

// Append Matt's outgoing text immediately (so his bubble shows instantly while
// the agent "types"). The agent reply is produced by respondToMatt().
export function recordMattMessage(rawText: string) {
  const text = rawText.trim();
  if (!text) return;
  setState({ ...state, messages: [...state.messages, addMessage("matt", text)] });
}

export function respondToMatt(rawText: string) {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const job = getActiveJob(state);
  let messages = [...state.messages];

  if (!job) {
    messages = [
      ...messages,
      addMessage(
        "agent",
        "No active job yet. Open the dashboard and tap \u201CAsk Matt by SMS\u201D on a job first.",
      ),
    ];
    setState({ ...state, messages });
    return;
  }

  let jobs = state.jobs;
  let invoices = state.invoices;
  let emails = state.emails;
  let events = state.events;
  let existing = invoices.find((inv) => inv.jobId === job.id) ?? null;

  // EDIT amount <number>
  const amountMatch = lower.match(/^edit\s+amount\s+(\d+(?:\.\d+)?)/);
  if (amountMatch) {
    const newAmount = Number(amountMatch[1]);
    jobs = jobs.map((j) =>
      j.id === job.id ? { ...j, amountDue: newAmount } : j,
    );
    if (existing) {
      invoices = invoices.map((inv) =>
        inv.id === existing!.id ? { ...inv, amount: newAmount } : inv,
      );
    }
    messages = [
      ...messages,
      addMessage(
        "agent",
        `Updated amount to ${money(newAmount)}. Send invoice now? Reply SEND or SKIP.`,
      ),
    ];
    events = [
      ...events,
      makeEvent("amount_edited", `Amount for ${job.clientName} updated to ${money(newAmount)}`, {
        jobId: job.id,
      }),
    ];
    setState({ ...state, jobs, invoices, messages, events });
    return;
  }

  // EDIT due <text>
  const dueMatch = text.match(/^edit\s+due\s+(.+)/i);
  if (dueMatch) {
    const dueText = dueMatch[1].trim();
    if (existing) {
      invoices = invoices.map((inv) =>
        inv.id === existing!.id ? { ...inv, dueDate: dueText } : inv,
      );
    }
    messages = [
      ...messages,
      addMessage(
        "agent",
        `Updated due date to ${dueText}. Send invoice now? Reply SEND or SKIP.`,
      ),
    ];
    events = [
      ...events,
      makeEvent("due_edited", `Due date for ${job.clientName} updated to ${dueText}`, {
        jobId: job.id,
      }),
    ];
    setState({ ...state, jobs, invoices, messages, events });
    return;
  }

  // SEND
  if (lower === "send") {
    const currentJob = jobs.find((j) => j.id === job.id)!;
    if (!existing) {
      existing = buildInvoice(currentJob);
      invoices = [...invoices, existing];
    }
    const sentInvoice: Invoice = {
      ...existing,
      status: "sent",
      amount: currentJob.amountDue,
    };
    invoices = invoices.map((inv) =>
      inv.id === existing!.id ? sentInvoice : inv,
    );
    jobs = setJobStatus(jobs, job.id, "sent");

    // Also deliver the invoice by email (mock). See MockEmailProvider.
    const email = buildEmail(sentInvoice);
    emails = [...emails, email];

    messages = [
      ...messages,
      addMessage(
        "agent",
        `Invoice sent to ${currentJob.clientName} for ${money(
          currentJob.amountDue,
        )} by text and email (${currentJob.customerEmail}). Payment link: ${sentInvoice.paymentUrl}`,
      ),
    ];
    events = [
      ...events,
      makeEvent("invoice_sent", `Invoice ${sentInvoice.id} sent to ${currentJob.clientName} for ${money(currentJob.amountDue)}`, {
        jobId: job.id,
        invoiceId: sentInvoice.id,
      }),
      makeEvent("invoice_emailed", `Invoice emailed to ${currentJob.customerEmail}`, {
        jobId: job.id,
        invoiceId: sentInvoice.id,
      }),
    ];
    setState({ ...state, jobs, invoices, emails, messages, events });
    return;
  }

  // SKIP
  if (lower === "skip") {
    jobs = setJobStatus(jobs, job.id, "skipped");
    messages = [
      ...messages,
      addMessage("agent", "Okay, I will skip this invoice for now."),
    ];
    events = [
      ...events,
      makeEvent("job_skipped", `Skipped invoicing ${job.clientName}`, {
        jobId: job.id,
      }),
    ];
    setState({ ...state, jobs, invoices, messages, events });
    return;
  }

  // Fallback
  messages = [
    ...messages,
    addMessage(
      "agent",
      "I didn't understand. Reply SEND, EDIT amount 2600, EDIT due Friday, or SKIP.",
    ),
  ];
  setState({ ...state, jobs, invoices, messages });
}

// Convenience: record Matt's message and immediately produce the agent reply.
export function handleMattReply(rawText: string) {
  recordMattMessage(rawText);
  respondToMatt(rawText);
}

export function payInvoice(invoiceId: string) {
  const invoice = state.invoices.find((inv) => inv.id === invoiceId);
  if (!invoice || invoice.status === "paid") return;

  const invoices = state.invoices.map((inv) =>
    inv.id === invoiceId ? { ...inv, status: "paid" as const } : inv,
  );
  const jobs = setJobStatus(state.jobs, invoice.jobId, "paid");
  const messages = [
    ...state.messages,
    addMessage(
      "agent",
      `${invoice.clientName} paid ${money(invoice.amount)} for ${invoice.serviceDescription}.`,
    ),
  ];
  const events = [
    ...state.events,
    makeEvent("payment_received", `${invoice.clientName} paid ${money(invoice.amount)}`, {
      jobId: invoice.jobId,
      invoiceId: invoice.id,
    }),
  ];
  setState({ ...state, jobs, invoices, messages, events });
}

export function resetDemo() {
  setState({ ...createInitialState() });
}
