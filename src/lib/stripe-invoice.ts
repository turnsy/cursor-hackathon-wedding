import Stripe from "stripe";
import { formatInvoiceTotal, getInvoice } from "@/lib/invoices";
import type { LineItem } from "@/lib/supabase/database.types";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  return new Stripe(secretKey);
}

async function findOrCreateCustomer(stripe: Stripe, email: string) {
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    return existing.data[0];
  }

  return stripe.customers.create({ email });
}

export async function sendInvoiceViaStripe(invoiceId: string) {
  const invoice = await getInvoice(invoiceId);
  const lineItems = invoice.line_items as LineItem[];
  const stripe = getStripeClient();
  const currency = process.env.STRIPE_CURRENCY ?? "usd";
  const daysUntilDue = Number(process.env.STRIPE_DAYS_UNTIL_DUE ?? "30");

  const customer = await findOrCreateCustomer(stripe, invoice.email);

  for (const item of lineItems) {
    await stripe.invoiceItems.create({
      customer: customer.id,
      amount: Math.round(Number(item.amount) * 100),
      currency,
      description: item.description,
    });
  }

  const stripeInvoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: daysUntilDue,
    description: invoice.title,
    metadata: {
      supabase_invoice_id: invoice.id,
    },
  });

  const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);
  const sent = await stripe.invoices.sendInvoice(finalized.id);

  return {
    invoiceId: invoice.id,
    email: invoice.email,
    stripeInvoiceId: sent.id,
    stripeCustomerId: customer.id,
    hostedInvoiceUrl: sent.hosted_invoice_url,
    invoicePdf: sent.invoice_pdf,
    status: sent.status,
    total: formatInvoiceTotal(lineItems),
  };
}
