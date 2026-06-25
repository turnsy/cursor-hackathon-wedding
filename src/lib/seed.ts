import type { ActivityEvent, DemoState, Integration, Job } from "./types";

// Hardcoded mock jobs. In production these would come from the
// Google Calendar / Trello adapters (see lib/integrations).
export const seedJobs: Job[] = [
  {
    id: "job_sarah",
    clientName: "Sarah Johnson",
    eventType: "Wedding Photography",
    completedDateLabel: "Completed yesterday",
    amountDue: 2400,
    customerPhone: "+15555550123",
    customerEmail: "sarah@example.com",
    source: "Google Calendar",
    invoiceStatus: "not_created",
  },
  {
    id: "job_daniel",
    clientName: "Daniel Lee",
    eventType: "Engagement Shoot",
    completedDateLabel: "Completed two days ago",
    amountDue: 450,
    customerPhone: "+15555550124",
    customerEmail: "daniel@example.com",
    source: "Trello",
    invoiceStatus: "not_created",
  },
  {
    id: "job_priya",
    clientName: "Priya Shah",
    eventType: "Wedding Deposit",
    completedDateLabel: "Completed today",
    amountDue: 1000,
    customerPhone: "+15555550125",
    customerEmail: "priya@example.com",
    source: "Google Calendar",
    invoiceStatus: "not_created",
  },
];

// Mocked backend connections shown on Matt's dashboard. Visual-only:
// in production each maps to a real OAuth-authenticated adapter.
export const integrations: Integration[] = [
  {
    id: "google_calendar",
    name: "Google Calendar",
    category: "Job source",
    accountLabel: "matt@mattphoto.com",
    status: "connected",
    lastSyncLabel: "Synced 2 min ago",
  },
  {
    id: "trello",
    name: "Trello",
    category: "Job source",
    accountLabel: "Matt Photography board",
    status: "connected",
    lastSyncLabel: "Synced 5 min ago",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    category: "Invoicing",
    accountLabel: "Matt Photography LLC",
    status: "connected",
    lastSyncLabel: "Synced 1 min ago",
  },
  {
    id: "stripe",
    name: "Stripe",
    category: "Payments",
    accountLabel: "acct_mattphoto",
    status: "connected",
    lastSyncLabel: "Live",
  },
  {
    id: "twilio",
    name: "Twilio",
    category: "SMS",
    accountLabel: "+1 (555) 010-2233",
    status: "connected",
    lastSyncLabel: "Live",
  },
  {
    id: "sendgrid",
    name: "Email (SendGrid)",
    category: "Email",
    accountLabel: "billing@mattphoto.com",
    status: "connected",
    lastSyncLabel: "Live",
  },
];

function shortId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createInitialState(): DemoState {
  const jobs = seedJobs.map((job) => ({ ...job }));
  const now = Date.now();

  // Seed one "job detected" event per job so the activity feed is non-empty.
  const events: ActivityEvent[] = jobs.map((job, i) => ({
    id: shortId("evt"),
    kind: "job_detected",
    label: `Detected completed job: ${job.clientName} (${job.eventType}) from ${job.source}`,
    jobId: job.id,
    createdAt: new Date(now - (jobs.length - i) * 60_000).toISOString(),
  }));

  return {
    jobs,
    invoices: [],
    messages: [],
    emails: [],
    events,
    activeJobId: null,
  };
}
