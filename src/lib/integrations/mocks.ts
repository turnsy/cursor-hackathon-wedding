import { seedJobs } from "../seed";
import type { Invoice, Job } from "../types";
import type {
  CalendarService,
  EmailProvider,
  InvoiceProvider,
  PaymentProvider,
  SmsProvider,
  TrelloService,
} from "./index";

// Tiny id helper for the demo. Real providers return their own ids.
function shortId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

export class MockCalendarService implements CalendarService {
  async getCompletedJobs(): Promise<Job[]> {
    // TODO: real Google Calendar. Authenticate the owner via OAuth 2.0, then
    // list completed events and map them into Job objects.
    return seedJobs.filter((j) => j.source === "Google Calendar");
  }
}

export class MockTrelloService implements TrelloService {
  async getCompletedJobs(): Promise<Job[]> {
    // TODO: real Trello. Authenticate via OAuth, read cards from a "Done" list,
    // and map them into Job objects.
    return seedJobs.filter((j) => j.source === "Trello");
  }
}

export class MockSmsProvider implements SmsProvider {
  async sendMessage(to: string, body: string): Promise<void> {
    // TODO: real Twilio. Use the Messages API with an API key to text `to`.
    // In the demo, messages are rendered in the in-app SMS simulator instead.
    console.log(`[MockSms] -> ${to}: ${body}`);
  }
}

export class MockInvoiceProvider implements InvoiceProvider {
  async createInvoice(job: Job): Promise<Invoice> {
    // TODO: real QuickBooks / Stripe. Authenticate via OAuth and create a real
    // invoice; return its id and hosted payment URL.
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
}

export class MockEmailProvider implements EmailProvider {
  async sendInvoiceEmail(to: string, invoice: Invoice): Promise<void> {
    // TODO: real email. Send via SendGrid / Postmark, or QuickBooks' built-in
    // invoice email. In the demo, the message is rendered in /inbox instead.
    console.log(`[MockEmail] -> ${to}: Invoice ${invoice.id} (${invoice.paymentUrl})`);
  }
}

export class MockPaymentProvider implements PaymentProvider {
  async markPaid(invoiceId: string): Promise<void> {
    // TODO: real Stripe. Payment confirmation would arrive via a webhook;
    // here the customer clicking "Pay" stands in for that webhook.
    console.log(`[MockPayment] invoice ${invoiceId} marked paid`);
  }
}

export const calendarService = new MockCalendarService();
export const trelloService = new MockTrelloService();
export const smsProvider = new MockSmsProvider();
export const invoiceProvider = new MockInvoiceProvider();
export const emailProvider = new MockEmailProvider();
export const paymentProvider = new MockPaymentProvider();
