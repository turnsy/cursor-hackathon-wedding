import { tool } from "ai";
import { z } from "zod";
import { logger, serializeError } from "@/lib/logger";
import { sendInvoiceEmail } from "@/lib/invoice-email";
import {
  createInvoice,
  deleteInvoice,
  listInvoices,
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

  list_invoices: tool({
    description:
      "Search and list invoices with pagination. Filter by query (email or title), or specific email/title fields.",
    inputSchema: z.object({
      page: z
        .number()
        .int()
        .min(1)
        .optional()
        .describe("Page number (1-based). Defaults to 1."),
      pageSize: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .describe("Results per page. Defaults to 10, max 50."),
      query: z
        .string()
        .optional()
        .describe("Search term matched against email and title"),
      email: z
        .string()
        .optional()
        .describe("Filter by recipient email (partial match)"),
      title: z
        .string()
        .optional()
        .describe("Filter by invoice title (partial match)"),
    }),
    execute: async ({ page, pageSize, query, email, title }) => {
      const result = await listInvoices({ page, pageSize, query, email, title });
      return {
        success: true,
        ...result,
      };
    },
  }),

  send_invoice: tool({
    description:
      "Send an existing invoice to its recipient via email from your Gmail account. Does not modify the database.",
    inputSchema: z.object({
      id: z.string().uuid().describe("Invoice ID to send"),
    }),
    execute: async ({ id }) => {
      logger.info("send_invoice tool invoked", {
        scope: "send_invoice_tool",
        invoiceId: id,
      });

      try {
        const result = await sendInvoiceEmail(id);

        logger.info("send_invoice tool completed", {
          scope: "send_invoice_tool",
          invoiceId: id,
          messageId: result.messageId,
          provider: result.provider,
          from: result.from,
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
