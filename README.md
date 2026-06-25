# Invoice Chat

AI-powered invoice management for the cursor-hackathon-wedding project. Chat with an assistant to create, update, delete, and email invoices stored in Supabase.

## Stack

- **Next.js 16** — App Router chat UI
- **Vercel AI Gateway** — Claude Sonnet 4.6 with tool calling
- **Supabase** — `invoices` table in `cursor-hackathon-wedding`
- **Gmail (SMTP)** — Sends invoice emails from your Gmail address (no custom domain needed)

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
| `list_invoices` | Search/list invoices with pagination |
| `send_invoice` | Email the invoice from your Gmail account (no DB change) |

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Fill in:

- `AI_GATEWAY_API_KEY` — from [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — from Supabase project settings → API (publishable key)
- `GMAIL_USER` — your Gmail address (e.g. `you@gmail.com`)
- `GMAIL_APP_PASSWORD` — 16-character [Google App Password](https://myaccount.google.com/apppasswords) (requires 2-Step Verification)
- `GMAIL_FROM_NAME` — optional display name in the From field (defaults to your email)

`NEXT_PUBLIC_SUPABASE_URL` is pre-filled for the `cursor-hackathon-wedding` project.

### Gmail setup (no domain required)

1. Turn on [2-Step Verification](https://myaccount.google.com/security) for your Google account
2. Create an [App Password](https://myaccount.google.com/apppasswords) for "Mail"
3. Put your Gmail in `GMAIL_USER` and the 16-character app password in `GMAIL_APP_PASSWORD`

Invoices will show as coming from your Gmail (or `"Invoice Chat" <you@gmail.com>` if `GMAIL_FROM_NAME` is set). You can send to any recipient — no custom domain needed.

Gmail limits personal accounts to about 500 emails/day. Google may block SMTP from some cloud hosts; if Vercel production fails, try local dev first or consider a cheap domain + Resend later.

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
- "List invoices for jane@example.com"
- "Show page 2 of invoices matching florals"
