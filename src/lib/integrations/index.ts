import type { Invoice, Job } from "../types";

/**
 * Integration boundary.
 *
 * Every external system is hidden behind one of these interfaces so the demo
 * (mock) implementations and the future production (real API) implementations
 * share the exact same signatures. Swapping mock -> real is a wiring change,
 * not a rewrite of the UI or flow logic.
 */

export interface CalendarService {
  getCompletedJobs(): Promise<Job[]>;
}

export interface TrelloService {
  getCompletedJobs(): Promise<Job[]>;
}

export interface SmsProvider {
  sendMessage(to: string, body: string): Promise<void>;
}

export interface InvoiceProvider {
  createInvoice(job: Job): Promise<Invoice>;
}

export interface EmailProvider {
  sendInvoiceEmail(to: string, invoice: Invoice): Promise<void>;
}

export interface PaymentProvider {
  markPaid(invoiceId: string): Promise<void>;
}
