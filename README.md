# InvoiceMate

An **SMS invoice-approval agent** for field workers. InvoiceMate watches a job
source (Google Calendar / Trello), detects completed jobs that haven't been
invoiced, texts the owner for approval, creates an invoice, delivers it to the
customer by payment link and email, and notifies the owner when payment lands.

This is a hackathon demo: every external integration (Twilio, QuickBooks,
Stripe, Google Calendar, Trello, email) is **mocked** behind a replaceable
adapter. The whole flow runs locally in the browser with no API keys.

## Pages

- `/` — detected-jobs feed (the demo entry point).
- `/dashboard` — Matt's review dashboard: KPIs, invoice/receipt ledger,
  connected backends, and an activity feed.
- `/sms` — Matt's phone (iMessage-style SMS approval simulator).
- `/inbox` — the customer's mailbox, where the emailed invoice arrives.
- `/invoice/[id]` — the customer-facing invoice + Pay button.

See [ARCHITECTURE.md](ARCHITECTURE.md) for diagrams and the demo-to-production
plan.

## Run locally (offline)

```bash
npm install
npm run dev
```

Then open http://localhost:3000. No network or API keys required after install.

## Deploy to Vercel

The app is a zero-config Next.js project. Import the repo at
[vercel.com/new](https://vercel.com/new) and deploy. State is stored per-browser
in `localStorage`, which is exactly what a single-judge click-through needs.

## Demo flow (the winning path)

1. Open the dashboard (`/`).
2. Click **Ask Matt by SMS** on Sarah Johnson.
3. On `/sms`, the agent asks whether to send the invoice.
4. Reply `EDIT amount 2600` &rarr; agent confirms the new amount.
5. Reply `SEND` &rarr; agent sends the invoice by text and email, and shows the
   payment link.
6. Open `/inbox` to see the customer's emailed invoice (or use the SMS link),
   then open the invoice and click **Pay Invoice**.
7. Return to `/sms`: "Sarah Johnson paid $2,600 for Wedding Photography."
8. `/dashboard` now shows Sarah's invoice as **Paid**, with collected revenue
   updated and the activity feed reflecting every step.

Use **Reset Demo** on the dashboard to start over.

## SMS commands

- `SEND` — create (if needed) and send the invoice.
- `EDIT amount 2600` — update the amount.
- `EDIT due Friday` — update the due date.
- `SKIP` — skip invoicing this job.

## Tech

Next.js (App Router) · TypeScript · Tailwind CSS · client-side store backed by
`localStorage`. Mock integration adapters live in
[`src/lib/integrations`](src/lib/integrations).
