export type JobSource = "Google Calendar" | "Trello";

export type JobInvoiceStatus =
  | "not_created"
  | "draft"
  | "sent"
  | "paid"
  | "skipped";

export type Job = {
  id: string;
  clientName: string;
  eventType: string;
  completedDateLabel: string;
  amountDue: number;
  customerPhone: string;
  customerEmail: string;
  source: JobSource;
  invoiceStatus: JobInvoiceStatus;
};

export type InvoiceStatus = "draft" | "sent" | "paid";

export type InvoiceProviderName = "mock_quickbooks" | "mock_stripe";

export type Invoice = {
  id: string;
  jobId: string;
  clientName: string;
  serviceDescription: string;
  amount: number;
  dueDate: string;
  customerPhone: string;
  customerEmail: string;
  status: InvoiceStatus;
  paymentUrl: string;
  provider: InvoiceProviderName;
};

export type Message = {
  id: string;
  from: "agent" | "matt";
  body: string;
  createdAt: string;
};

export type Email = {
  id: string;
  to: string;
  subject: string;
  preview: string;
  invoiceId: string;
  createdAt: string;
};

export type ActivityKind =
  | "job_detected"
  | "reminder_sent"
  | "amount_edited"
  | "due_edited"
  | "invoice_sent"
  | "invoice_emailed"
  | "payment_received"
  | "job_skipped";

export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  label: string;
  jobId?: string;
  invoiceId?: string;
  createdAt: string;
};

export type Integration = {
  id: string;
  name: string;
  category: string;
  accountLabel: string;
  status: "connected";
  lastSyncLabel: string;
};

export type DemoState = {
  jobs: Job[];
  invoices: Invoice[];
  messages: Message[];
  emails: Email[];
  events: ActivityEvent[];
  activeJobId: string | null;
};
