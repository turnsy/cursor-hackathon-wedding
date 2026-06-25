import { tool } from "ai";
import { z } from "zod";
import { logger, serializeError } from "@/lib/logger";
import { sendInvoiceViaStripe } from "@/lib/stripe-invoice";
import {
  createInvoice,
  deleteInvoice,
  updateInvoice,
} from "@/lib/invoices";

const lineItemSchema = z.object({
  description: z.string().describe("Line item description"),
  amount: z.number().describe("Line item amount in dollars"),
});

export const invoiceTools = {
  create_invoice: tool({
    description:
      "Create a new invoice with recipient email, title, date, and line items.",
    inputSchema: z.object({
      email: z.string().email().describe("Recipient email address"),
      title: z.string().describe("Invoice title"),
      date: z
        .string()
        .optional()
        .describe("Invoice date in YYYY-MM-DD format"),
      lineItems: z
        .array(lineItemSchema)
        .min(1)
        .describe("Invoice line items as description/amount pairs"),
    }),
    execute: async ({ email, title, date, lineItems }) => {
      const invoice = await createInvoice({ email, title, date, lineItems });
      return {
        success: true,
        invoice,
      };
    },
  }),

  update_invoice: tool({
    description:
      "Update an existing invoice by ID. Only provided fields are changed.",
    inputSchema: z.object({
      id: z.string().uuid().describe("Invoice ID"),
      email: z.string().email().optional().describe("Updated recipient email"),
      title: z.string().optional().describe("Updated invoice title"),
      date: z
        .string()
        .optional()
        .describe("Updated invoice date in YYYY-MM-DD format"),
      lineItems: z
        .array(lineItemSchema)
        .optional()
        .describe("Updated line items"),
    }),
    execute: async ({ id, email, title, date, lineItems }) => {
      const invoice = await updateInvoice({
        id,
        email,
        title,
        date,
        lineItems,
      });
      return {
        success: true,
        invoice,
      };
    },
  }),

  delete_invoice: tool({
    description: "Delete an invoice by ID.",
    inputSchema: z.object({
      id: z.string().uuid().describe("Invoice ID to delete"),
    }),
    execute: async ({ id }) => {
      const invoice = await deleteInvoice(id);
      return {
        success: true,
        deleted: invoice,
      };
    },
  }),

  send_invoice: tool({
    description:
      "Send an existing invoice to its recipient via Stripe. Emails a hosted invoice with payment link. Does not modify the database.",
    inputSchema: z.object({
      id: z.string().uuid().describe("Invoice ID to send"),
    }),
    execute: async ({ id }) => {
      logger.info("send_invoice tool invoked", {
        scope: "send_invoice_tool",
        invoiceId: id,
      });

      try {
        const result = await sendInvoiceViaStripe(id);

        logger.info("send_invoice tool completed", {
          scope: "send_invoice_tool",
          invoiceId: id,
          stripeInvoiceId: result.stripeInvoiceId,
          status: result.status,
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        const details = serializeError(error);

        logger.error("send_invoice tool failed", {
          scope: "send_invoice_tool",
          invoiceId: id,
          error: details,
        });

        return {
          success: false,
          invoiceId: id,
          error: details.message ?? "Failed to send invoice",
          details,
        };
      }
    },
  }),
};
