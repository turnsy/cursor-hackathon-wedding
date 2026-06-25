import type { Database, LineItem } from "@/lib/supabase/database.types";
import { createSupabaseClient } from "@/lib/supabase/server";

type InvoiceUpdate = Database["public"]["Tables"]["invoices"]["Update"];

export type CreateInvoiceInput = {
  email: string;
  title: string;
  date?: string;
  lineItems: LineItem[];
};

export type UpdateInvoiceInput = {
  id: string;
  email?: string;
  title?: string;
  date?: string;
  lineItems?: LineItem[];
};

function normalizeLineItems(lineItems: LineItem[]) {
  return lineItems.map((item) => ({
    description: item.description,
    amount: Number(item.amount),
  }));
}

export async function createInvoice(input: CreateInvoiceInput) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      email: input.email,
      title: input.title,
      date: input.date ?? new Date().toISOString().slice(0, 10),
      line_items: normalizeLineItems(input.lineItems),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invoice: ${error.message}`);
  }

  return data;
}

export async function updateInvoice(input: UpdateInvoiceInput) {
  const supabase = createSupabaseClient();

  const updates: InvoiceUpdate = {};
  if (input.email !== undefined) updates.email = input.email;
  if (input.title !== undefined) updates.title = input.title;
  if (input.date !== undefined) updates.date = input.date;
  if (input.lineItems !== undefined) {
    updates.line_items = normalizeLineItems(input.lineItems);
  }

  const { data, error } = await supabase
    .from("invoices")
    .update(updates)
    .eq("id", input.id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update invoice: ${error.message}`);
  }

  return data;
}

export async function deleteInvoice(id: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to delete invoice: ${error.message}`);
  }

  return data;
}

export async function getInvoice(id: string) {
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("invoices")
    .select()
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch invoice: ${error.message}`);
  }

  return data;
}

export function formatInvoiceTotal(lineItems: LineItem[]) {
  return lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
}
