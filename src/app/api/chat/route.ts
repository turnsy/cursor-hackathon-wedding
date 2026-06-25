import { gateway } from "@ai-sdk/gateway";
import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from "ai";
import { invoiceTools } from "@/lib/invoice-tools";

export const maxDuration = 60;

const systemPrompt = `You are an invoice assistant. Help users create, update, delete, and send invoices.

Use the available tools to manage invoices in the database:
- create_invoice: create a new invoice
- update_invoice: modify an existing invoice by ID
- delete_invoice: remove an invoice by ID
- list_invoices: search and list invoices with pagination
- send_invoice: email an invoice to its recipient

Line items are description/amount pairs (string description, numeric dollar amount).
When creating invoices, confirm the details with the user if anything is ambiguous.
After tool calls, summarize what was done clearly.`;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: gateway("anthropic/claude-sonnet-4.6"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: invoiceTools,
    stopWhen: stepCountIs(10),
  });

  return result.toUIMessageStreamResponse();
}
