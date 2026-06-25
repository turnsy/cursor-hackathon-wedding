import { Resend } from "resend";
import {
  formatInvoiceHtml,
  formatInvoiceTotal,
  getInvoice,
} from "@/lib/invoices";
import type { LineItem } from "@/lib/supabase/database.types";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }
  return new Resend(apiKey);
}

export async function sendInvoiceEmail(invoiceId: string) {
  const invoice = await getInvoice(invoiceId);
  const lineItems = invoice.line_items as LineItem[];
  const total = formatInvoiceTotal(lineItems);
  const from =
    process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const resend = getResendClient();
  const { data, error } = await resend.emails.send({
    from,
    to: invoice.email,
    subject: `Invoice: ${invoice.title}`,
    html: formatInvoiceHtml({
      title: invoice.title,
      date: invoice.date,
      line_items: lineItems,
    }),
    text: [
      invoice.title,
      `Date: ${invoice.date}`,
      "",
      ...lineItems.map(
        (item) =>
          `${item.description}: $${Number(item.amount).toFixed(2)}`,
      ),
      "",
      `Total: $${total.toFixed(2)}`,
    ].join("\n"),
  });

  if (error) {
    throw new Error(`Failed to send invoice email: ${error.message}`);
  }

  return {
    invoiceId: invoice.id,
    email: invoice.email,
    messageId: data?.id,
    total,
  };
}
