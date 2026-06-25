import Stripe from "stripe";
import { formatInvoiceTotal, getInvoice } from "@/lib/invoices";
import { logger, serializeError } from "@/lib/logger";
import type { LineItem } from "@/lib/supabase/database.types";

const LOG_SCOPE = "send_invoice";

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY environment variable");
  }

  return new Stripe(secretKey);
}

async function findOrCreateCustomer(stripe: Stripe, email: string) {
  logger.info("Looking up Stripe customer", { scope: LOG_SCOPE, email });

  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    logger.info("Found existing Stripe customer", {
      scope: LOG_SCOPE,
      email,
      stripeCustomerId: existing.data[0].id,
    });
    return existing.data[0];
  }

  const customer = await stripe.customers.create({ email });
  logger.info("Created Stripe customer", {
    scope: LOG_SCOPE,
    email,
    stripeCustomerId: customer.id,
  });
  return customer;
}

export async function sendInvoiceViaStripe(invoiceId: string) {
  let step = "start";

  logger.info("Starting Stripe invoice send", {
    scope: LOG_SCOPE,
    invoiceId,
    step,
  });

  try {
    step = "load_invoice";
    const invoice = await getInvoice(invoiceId);
    const lineItems = invoice.line_items as LineItem[];

    logger.info("Loaded invoice from Supabase", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      email: invoice.email,
      title: invoice.title,
      lineItemCount: lineItems.length,
      total: formatInvoiceTotal(lineItems),
    });

    if (lineItems.length === 0) {
      throw new Error("Invoice has no line items");
    }

    step = "init_stripe";
    const stripe = getStripeClient();
    const currency = process.env.STRIPE_CURRENCY ?? "usd";
    const daysUntilDue = Number(process.env.STRIPE_DAYS_UNTIL_DUE ?? "30");

    logger.info("Initialized Stripe client", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      currency,
      daysUntilDue,
      stripeKeyPrefix: process.env.STRIPE_SECRET_KEY?.slice(0, 7),
    });

    step = "find_or_create_customer";
    const customer = await findOrCreateCustomer(stripe, invoice.email);

    step = "create_invoice_items";
    for (const [index, item] of lineItems.entries()) {
      const amountCents = Math.round(Number(item.amount) * 100);

      logger.info("Creating Stripe invoice item", {
        scope: LOG_SCOPE,
        invoiceId,
        step,
        index,
        description: item.description,
        amount: item.amount,
        amountCents,
        currency,
        stripeCustomerId: customer.id,
      });

      if (amountCents <= 0) {
        throw new Error(
          `Line item "${item.description}" must have an amount greater than zero`,
        );
      }

      const invoiceItem = await stripe.invoiceItems.create({
        customer: customer.id,
        amount: amountCents,
        currency,
        description: item.description,
      });

      logger.info("Created Stripe invoice item", {
        scope: LOG_SCOPE,
        invoiceId,
        step,
        index,
        stripeInvoiceItemId: invoiceItem.id,
      });
    }

    step = "create_invoice";
    const stripeInvoice = await stripe.invoices.create({
      customer: customer.id,
      collection_method: "send_invoice",
      days_until_due: daysUntilDue,
      description: invoice.title,
      metadata: {
        supabase_invoice_id: invoice.id,
      },
    });

    logger.info("Created Stripe invoice draft", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      stripeInvoiceId: stripeInvoice.id,
      stripeCustomerId: customer.id,
    });

    step = "finalize_invoice";
    const finalized = await stripe.invoices.finalizeInvoice(stripeInvoice.id);

    logger.info("Finalized Stripe invoice", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      stripeInvoiceId: finalized.id,
      status: finalized.status,
      hostedInvoiceUrl: finalized.hosted_invoice_url,
    });

    step = "send_invoice";
    const sent = await stripe.invoices.sendInvoice(finalized.id);

    logger.info("Sent Stripe invoice", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      stripeInvoiceId: sent.id,
      email: invoice.email,
      status: sent.status,
      hostedInvoiceUrl: sent.hosted_invoice_url,
      invoicePdf: sent.invoice_pdf,
    });

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
  } catch (error) {
    logger.error("Stripe invoice send failed", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      error: serializeError(error),
    });
    throw error;
  }
}
