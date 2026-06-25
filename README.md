# Invoice Chat

AI-powered invoice management for the cursor-hackathon-wedding project. Chat with an assistant to create, update, delete, and email invoices stored in Supabase.

## Stack

- **Next.js 16** — App Router chat UI
- **Vercel AI Gateway** — Claude Sonnet 4.6 with tool calling
- **Supabase** — `invoices` table in `cursor-hackathon-wedding`
- **Resend** — Email delivery for `send_invoice`

## Database

The `invoices` table includes:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | text | Recipient email |
| `title` | text | Invoice title |
| `date` | date | Invoice date |
| `line_items` | jsonb | Array of `{ description: string, amount: number }` |

## AI Tools

| Tool | Action |
|------|--------|
| `create_invoice` | Insert a new invoice |
| `update_invoice` | Update an existing invoice by ID |
| `delete_invoice` | Delete an invoice by ID |
| `send_invoice` | Email the invoice (no DB change) |

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in:

- `AI_GATEWAY_API_KEY` — from [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings → API
- `RESEND_API_KEY` — from [Resend](https://resend.com) (for `send_invoice`)
- `RESEND_FROM_EMAIL` — verified sender domain (defaults to `onboarding@resend.dev` for testing)

`NEXT_PUBLIC_SUPABASE_URL` is pre-filled for the `cursor-hackathon-wedding` project.

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Example prompts

- "Create an invoice for jane@example.com titled 'Florals' dated 2026-06-25 with items: Bouquets $450, Centerpieces $320"
- "Update invoice {id} to add a line item 'Delivery' for $50"
- "Send invoice {id} to the client"
- "Delete invoice {id}"
