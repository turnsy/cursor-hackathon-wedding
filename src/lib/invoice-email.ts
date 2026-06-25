import { Resend } from "resend";
import { formatInvoiceTotal, getInvoice } from "@/lib/invoices";
import { logger, serializeError } from "@/lib/logger";
import type { LineItem } from "@/lib/supabase/database.types";

const LOG_SCOPE = "send_invoice";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  return new Resend(apiKey);
}

function formatInvoiceHtml(invoice: {
  id: string;
  title: string;
  date: string;
  line_items: LineItem[];
}) {
  const lineItems = invoice.line_items;
  const rows = lineItems
    .map(
      (item) =>
        `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${item.description}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${Number(item.amount).toFixed(2)}</td></tr>`,
    )
    .join("");
  const total = formatInvoiceTotal(lineItems);

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <h1 style="margin-bottom:8px;">${invoice.title}</h1>
      <p style="color:#666;margin-top:0;">Date: ${invoice.date}</p>
      <p style="color:#666;">Invoice ID: ${invoice.id}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:24px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #111;">Description</th>
            <th style="text-align:right;padding:8px;border-bottom:2px solid #111;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td style="padding:12px 8px;font-weight:bold;">Total</td>
            <td style="padding:12px 8px;font-weight:bold;text-align:right;">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function formatInvoiceText(invoice: {
  id: string;
  title: string;
  date: string;
  line_items: LineItem[];
}) {
  const lineItems = invoice.line_items;
  const total = formatInvoiceTotal(lineItems);

  return [
    invoice.title,
    `Date: ${invoice.date}`,
    `Invoice ID: ${invoice.id}`,
    "",
    ...lineItems.map(
      (item) => `${item.description}: $${Number(item.amount).toFixed(2)}`,
    ),
    "",
    `Total: $${total.toFixed(2)}`,
  ].join("\n");
}

export async function sendInvoiceEmail(invoiceId: string) {
  let step = "start";

  logger.info("Starting invoice email send", {
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

    step = "init_resend";
    const resend = getResendClient();
    const from =
      process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

    logger.info("Initialized Resend client", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      from,
    });

    step = "send_email";
    const { data, error } = await resend.emails.send({
      from,
      to: invoice.email,
      subject: `Invoice: ${invoice.title}`,
      html: formatInvoiceHtml({
        id: invoice.id,
        title: invoice.title,
        date: invoice.date,
        line_items: lineItems,
      }),
      text: formatInvoiceText({
        id: invoice.id,
        title: invoice.title,
        date: invoice.date,
        line_items: lineItems,
      }),
    });

    if (error) {
      logger.error("Resend API returned an error", {
        scope: LOG_SCOPE,
        invoiceId,
        step,
        error: serializeError(error),
      });
      throw new Error(`Failed to send invoice email: ${error.message}`);
    }

    logger.info("Sent invoice email", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      email: invoice.email,
      messageId: data?.id,
      total: formatInvoiceTotal(lineItems),
    });

    return {
      invoiceId: invoice.id,
      email: invoice.email,
      messageId: data?.id,
      provider: "resend" as const,
      total: formatInvoiceTotal(lineItems),
    };
  } catch (error) {
    logger.error("Invoice email send failed", {
      scope: LOG_SCOPE,
      invoiceId,
      step,
      error: serializeError(error),
    });
    throw error;
  }
}
