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

export type ListInvoicesInput = {
  page?: number;
  pageSize?: number;
  query?: string;
  email?: string;
  title?: string;
};

export type InvoiceListResult = {
  invoices: Awaited<ReturnType<typeof getInvoice>>[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function escapeIlikePattern(value: string) {
  return value.replace(/[%_\\]/g, "\\$&");
}

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

export async function listInvoices(
  input: ListInvoicesInput = {},
): Promise<InvoiceListResult> {
  const supabase = createSupabaseClient();
  const page = Math.max(1, input.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, input.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("invoices")
    .select("*", { count: "exact" })
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (input.query?.trim()) {
    const term = escapeIlikePattern(input.query.trim());
    query = query.or(`email.ilike.%${term}%,title.ilike.%${term}%`);
  }

  if (input.email?.trim()) {
    query = query.ilike("email", `%${escapeIlikePattern(input.email.trim())}%`);
  }

  if (input.title?.trim()) {
    query = query.ilike("title", `%${escapeIlikePattern(input.title.trim())}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`Failed to list invoices: ${error.message}`);
  }

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    invoices: data ?? [],
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export function formatInvoiceTotal(lineItems: LineItem[]) {
  return lineItems.reduce((sum, item) => sum + Number(item.amount), 0);
}
