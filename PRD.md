Below is a **concrete PRD** you can paste into Cursor and ask it to build.

---

# **PRD: Matt’s SMS Invoice Agent**

## **Product name**

**FieldInvoice**

## **One-line problem**

Matt is a wedding photographer who forgets or delays sending invoices because he is usually in the field, not at his computer.

## **Product goal**

Build an **SMS-based invoice assistant** that watches Matt’s Calendar/Trello, detects completed jobs that may need invoicing, asks Matt for approval by SMS, then sends the invoice through QuickBooks or Stripe.

---

# **Core assumption**

Matt already uses:

1. **Google Calendar** for shoots and weddings.  
2. **Trello** for client/job tracking.  
3. **QuickBooks or Stripe** for invoices and payments.  
4. **SMS** as the fastest way to interact while in the field.

For the hackathon MVP, real integrations can be mocked with seed data, except SMS/payment link if easy.

---

# **User roles**

## **Matt**

The photographer/business owner.

He receives SMS reminders, approves invoices, edits invoice details, and gets payment updates.

## **Customer**

The photography client.

They receive an invoice/payment link by SMS or email and pay through Stripe or QuickBooks.

---

# **Main workflow**

## **1\. System detects a billable job**

The system checks Matt’s Calendar and Trello.

Example detected job:

{  
  "client\_name": "Sarah Johnson",  
  "event\_type": "Wedding Photography",  
  "event\_date": "2026-06-25",  
  "status": "Completed",  
  "amount\_due": 2400,  
  "customer\_phone": "+15555550123",  
  "customer\_email": "sarah@example.com",  
  "source": "Google Calendar"  
}

The system identifies jobs where:

event date is in the past  
AND status is completed  
AND invoice\_status is not sent

---

## **2\. System texts Matt**

SMS to Matt:

You finished Sarah Johnson's wedding shoot yesterday.

I found $2,400 due for Wedding Photography.

Send invoice now?

Reply:  
SEND  
EDIT  
SKIP

---

## **3\. Matt approves or edits**

Matt can reply:

SEND

or:

EDIT amount 2600 due Friday

or:

SKIP

---

## **4\. System creates invoice**

If Matt replies `SEND`, the system creates an invoice using one of these providers:

Primary:

QuickBooks Invoice API

Fallback:

Stripe Checkout payment link

Hackathon MVP fallback:

Generate a fake invoice page at /invoice/:id

---

## **5\. Customer receives invoice**

SMS to customer:

Hi Sarah, here is your invoice from Matt Photography for Wedding Photography: $2,400.

Pay here:  
https://fieldinvoice.app/invoice/inv\_123

Optional email:

Subject: Invoice from Matt Photography

Hi Sarah,

Thanks again for choosing Matt Photography.

Your invoice for Wedding Photography is ready:  
Amount due: $2,400  
Pay here: https://fieldinvoice.app/invoice/inv\_123

Thanks,  
Matt

---

## **6\. Payment status updates**

When customer pays, the system updates invoice status:

draft → sent → paid

Matt receives SMS:

Sarah Johnson paid $2,400 for Wedding Photography.

---

# **MVP scope**

Build only this:

1. Dashboard showing detected jobs.  
2. SMS-style chat interface for Matt.  
3. Mock Calendar/Trello data.  
4. Invoice draft generation.  
5. Matt approval flow.  
6. Customer invoice/payment page.  
7. Status updates: draft, sent, paid.  
8. Fake or Stripe payment flow.

Do **not** build:

Full accounting software  
Full CRM  
Tax handling  
Contract signing  
Multi-user teams  
Refunds  
Complex QuickBooks sync

---

# **Key screens**

## **Screen 1: Matt dashboard**

Route:

/

Show:

Detected billable jobs  
Invoice status  
Customer name  
Amount due  
Send invoice button  
SMS conversation preview

Example job cards:

Sarah Johnson  
Wedding Photography  
Completed yesterday  
$2,400 due  
Invoice not sent  
\[Text Matt for approval\]

---

## **Screen 2: SMS agent simulator**

Route:

/sms

This should simulate Matt’s phone.

Matt sees messages from the agent and can reply:

SEND  
EDIT amount 2600  
SKIP

The app should parse Matt’s reply and update invoice state.

---

## **Screen 3: Customer invoice page**

Route:

/invoice/:invoiceId

Show:

Matt Photography  
Customer name  
Service  
Amount due  
Due date  
Pay button

When customer clicks Pay:

Set invoice status to paid  
Show success state  
Notify Matt in SMS simulator

---

# **Data model**

Use simple in-memory data or SQLite.

## **Job**

type Job \= {  
  id: string;  
  clientName: string;  
  eventType: string;  
  eventDate: string;  
  status: "upcoming" | "completed";  
  amountDue: number;  
  customerPhone: string;  
  customerEmail: string;  
  source: "calendar" | "trello";  
  invoiceStatus: "not\_created" | "draft" | "sent" | "paid" | "skipped";  
};

## **Invoice**

type Invoice \= {  
  id: string;  
  jobId: string;  
  clientName: string;  
  serviceDescription: string;  
  amount: number;  
  dueDate: string;  
  customerPhone: string;  
  customerEmail: string;  
  status: "draft" | "sent" | "paid";  
  paymentUrl: string;  
  provider: "quickbooks" | "stripe" | "mock";  
};

## **Message**

type Message \= {  
  id: string;  
  from: "agent" | "matt" | "customer";  
  to: "agent" | "matt" | "customer";  
  body: string;  
  createdAt: string;  
};

---

# **Agent behavior**

The agent should do three things:

## **1\. Detect invoice opportunities**

Run this logic:

for each job:  
  if job.status \=== "completed"   
  and job.invoiceStatus \=== "not\_created":  
    create reminder for Matt

---

## **2\. Generate approval SMS**

Template:

You finished {clientName}'s {eventType} on {eventDate}.

I found ${amountDue} due.

Send invoice now?

Reply SEND, EDIT, or SKIP.

---

## **3\. Parse Matt’s reply**

Supported replies:

SEND

Action:

Create invoice  
Send invoice to customer  
Mark invoice as sent

EDIT amount 2600

Action:

Update invoice amount to 2600  
Ask for confirmation again

EDIT due Friday

Action:

Update due date  
Ask for confirmation again

SKIP

Action:

Mark job invoiceStatus as skipped

Unknown reply:

I didn't understand. Reply SEND, EDIT amount 2600, EDIT due Friday, or SKIP.

---

# **Integration assumptions**

## **Google Calendar**

For MVP, mock this data.

Later, Calendar events should include:

Client name  
Event type  
Event date  
Client phone/email in notes  
Package or amount due

## **Trello**

For MVP, mock this data.

Later, Trello cards should include:

Client name  
Shoot status  
Amount due  
Payment status  
Client contact info

## **QuickBooks**

For MVP, mock invoice creation.

Real version:

Create QuickBooks customer if needed  
Create invoice  
Send invoice by email  
Return invoice URL

## **Stripe**

For MVP, either mock or use Stripe payment links.

Real version:

Create Checkout Session  
Return checkout URL  
Listen for payment webhook  
Mark invoice as paid

## **Twilio**

For MVP, use SMS simulator.

Real version:

Send SMS to Matt  
Receive Matt replies  
Send invoice SMS to customer

---

# **Demo script**

Use this exact demo.

## **Step 1**

Open dashboard.

Show detected job:

Sarah Johnson  
Wedding Photography  
Completed yesterday  
$2,400 due  
Invoice not sent

## **Step 2**

Click:

Text Matt for approval

SMS agent sends:

You finished Sarah Johnson's wedding shoot yesterday.

I found $2,400 due.

Send invoice now?

Reply SEND, EDIT, or SKIP.

## **Step 3**

Matt replies:

EDIT amount 2600

Agent replies:

Updated invoice amount to $2,600.

Send invoice to Sarah Johnson now?

Reply SEND or SKIP.

## **Step 4**

Matt replies:

SEND

Agent replies:

Invoice sent to Sarah Johnson for $2,600.

## **Step 5**

Open customer invoice page.

Customer sees:

Matt Photography  
Wedding Photography  
Amount due: $2,600  
\[Pay Invoice\]

## **Step 6**

Click Pay Invoice.

Matt receives:

Sarah Johnson paid $2,600.

---

# **Success criteria**

The MVP works if:

A completed job is detected.  
Matt receives an invoice approval SMS.  
Matt can edit amount by SMS.  
Matt can approve sending by SMS.  
Customer receives or can view an invoice link.  
Customer can click Pay.  
Invoice status changes to paid.  
Matt gets payment confirmation.

---

# **Recommended tech stack**

Use:

Next.js  
TypeScript  
Tailwind  
SQLite or in-memory store  
Mock integration layer  
Optional: Twilio  
Optional: Stripe

Keep all integrations behind interfaces:

CalendarService  
TrelloService  
InvoiceProvider  
SmsProvider  
PaymentProvider

For hackathon speed, implement mock versions first.

---

# **Cursor build prompt**

Paste this into Cursor:

Build a Next.js TypeScript app called FieldInvoice.

It is an SMS invoice agent for Matt, a wedding photographer.

The app should have three routes:

1\. /   
Dashboard showing mock completed photography jobs that may need invoices.

2\. /sms  
A simulated SMS chat between Matt and the invoice agent.

3\. /invoice/\[id\]  
A customer-facing invoice page with a Pay Invoice button.

Use in-memory mock data.

Mock jobs:  
\- Sarah Johnson, Wedding Photography, completed yesterday, $2400 due, phone \+15555550123, email sarah@example.com  
\- Daniel Lee, Engagement Shoot, completed two days ago, $450 due, phone \+15555550124, email daniel@example.com  
\- Priya Shah, Wedding Deposit, completed today, $1000 due, phone \+15555550125, email priya@example.com

Dashboard:  
\- Show each job as a card.  
\- Show client name, event type, date, amount, source, invoice status.  
\- Add button: "Text Matt for approval".  
\- When clicked, create an agent SMS message asking Matt whether to send the invoice.  
\- Link to /sms.

SMS page:  
\- Show chat messages.  
\- Allow Matt to type replies.  
\- Support replies:  
  SEND  
  EDIT amount 2600  
  EDIT due Friday  
  SKIP  
\- If Matt sends SEND:  
  Create invoice if needed.  
  Mark invoice as sent.  
  Create mock payment URL /invoice/\[id\].  
  Add agent message saying invoice was sent.  
\- If Matt sends EDIT amount X:  
  Update invoice/job amount.  
  Ask for confirmation again.  
\- If Matt sends EDIT due X:  
  Update due date.  
  Ask for confirmation again.  
\- If Matt sends SKIP:  
  Mark invoice status as skipped.  
\- If unknown:  
  Ask Matt to reply SEND, EDIT amount 2600, EDIT due Friday, or SKIP.

Invoice page:  
\- Show Matt Photography branding.  
\- Show customer name, service description, amount, due date, and status.  
\- Add Pay Invoice button.  
\- When clicked, mark invoice as paid.  
\- Show paid success state.  
\- Add SMS message to Matt saying the customer paid.

Implementation:  
\- Use TypeScript types for Job, Invoice, and Message.  
\- Use a simple global in-memory store.  
\- Make the UI clean and demo-ready.  
\- Use Tailwind.  
\- Do not implement real auth.  
\- Do not implement real QuickBooks, Stripe, Twilio, Google Calendar, or Trello.  
\- Create integration interfaces and mock implementations for future replacement:  
  CalendarService  
  TrelloService  
  SmsProvider  
  InvoiceProvider  
  PaymentProvider

The product flow should be:  
Calendar/Trello completed job \-\> SMS reminder to Matt \-\> Matt approves/edits \-\> invoice created \-\> customer receives invoice page \-\> customer pays \-\> Matt gets SMS confirmation.

---

# **Final problem statement**

**Matt needs an SMS invoice agent that notices completed photography jobs, asks for permission to invoice, sends the invoice through his existing payment system, and updates him when the customer pays.**

