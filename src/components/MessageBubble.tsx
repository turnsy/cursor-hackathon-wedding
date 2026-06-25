import type { Message } from "@/lib/types";

// Render the agent message body, turning a /invoice/... payment link into a
// real anchor so the demo can click straight through to the customer page.
function renderBody(body: string) {
  const match = body.match(/(\/invoice\/[a-zA-Z0-9_]+)/);
  if (!match) return body;
  const [link] = match;
  const [before, after] = body.split(link);
  return (
    <>
      {before}
      <a href={link} className="font-semibold underline underline-offset-2">
        {link}
      </a>
      {after}
    </>
  );
}

export function MessageBubble({
  message,
  isLastInGroup,
}: {
  message: Message;
  isLastInGroup: boolean;
}) {
  const isMatt = message.from === "matt";
  const tail = isLastInGroup ? "has-tail" : "";

  return (
    <div className={`flex ${isMatt ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "chat-bubble relative z-[2] max-w-[75%] whitespace-pre-wrap px-3.5 py-2 text-[15px] leading-snug",
          isMatt
            ? "chat-bubble-sent rounded-3xl bg-[#007aff] text-white"
            : "chat-bubble-recv rounded-3xl bg-[#e9e9eb] text-slate-900",
          tail,
        ].join(" ")}
      >
        {isMatt ? message.body : renderBody(message.body)}
      </div>
    </div>
  );
}
