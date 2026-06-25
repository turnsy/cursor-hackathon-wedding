"use client";

import { useEffect, useRef, useState } from "react";
import {
  getActiveInvoice,
  getActiveJob,
  recordMattMessage,
  respondToMatt,
  useStore,
} from "@/lib/store";
import { shortTime } from "@/lib/format";
import { MessageBubble } from "./MessageBubble";

const QUICK_REPLIES = ["SEND", "EDIT amount 2600", "EDIT due Friday", "SKIP"];
const GAP_MS = 60_000;

export function PhoneChat() {
  const state = useStore();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeJob = getActiveJob(state);
  const activeInvoice = getActiveInvoice(state);
  const messages = state.messages;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, typing]);

  function send(text: string) {
    const value = text.trim();
    if (!value || typing) return;
    recordMattMessage(value);
    setDraft("");
    setTyping(true);
    // Simulate the agent composing a reply.
    window.setTimeout(() => {
      respondToMatt(value);
      setTyping(false);
    }, 650);
  }

  const lastMatt = [...messages].reverse().find((m) => m.from === "matt");
  const lastIsMatt =
    messages.length > 0 && messages[messages.length - 1].from === "matt";

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-[2.75rem] border-[12px] border-black bg-black shadow-2xl">
        {/* notch */}
        <div className="relative flex items-center justify-center bg-white py-2">
          <span className="absolute left-1/2 top-1.5 h-5 w-28 -translate-x-1/2 rounded-full bg-black" />
        </div>

        {/* iOS contact header */}
        <div className="flex flex-col items-center border-b border-slate-200 bg-white/95 px-4 pb-3 pt-2 backdrop-blur">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
            IM
          </span>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            InvoiceMate Agent
          </p>
          <p className="truncate text-xs text-slate-400">
            {activeJob
              ? `${activeJob.clientName} \u00b7 ${activeJob.eventType}`
              : "No active job"}
          </p>
          {activeInvoice && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              {activeInvoice.id} &middot; {activeInvoice.status}
            </p>
          )}
        </div>

        {/* messages */}
        <div
          ref={scrollRef}
          className="chat-area h-[24rem] space-y-1 overflow-y-auto px-3 py-4"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <p className="text-sm font-medium text-slate-500">
                No messages yet.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Go to the Jobs page and tap &ldquo;Ask Matt by SMS&rdquo; to
                start the conversation.
              </p>
            </div>
          ) : (
            messages.map((m, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const isLastInGroup = !next || next.from !== m.from;
              const showTime =
                !prev ||
                new Date(m.createdAt).getTime() -
                  new Date(prev.createdAt).getTime() >
                  GAP_MS;
              return (
                <div key={m.id} className={isLastInGroup ? "mb-2" : ""}>
                  {showTime && (
                    <p className="py-1.5 text-center text-[11px] font-medium text-slate-400">
                      {shortTime(m.createdAt)}
                    </p>
                  )}
                  <MessageBubble message={m} isLastInGroup={isLastInGroup} />
                </div>
              );
            })
          )}

          {typing && (
            <div className="flex justify-start">
              <div className="chat-bubble chat-bubble-recv has-tail relative z-[2] flex items-center gap-1 rounded-3xl bg-[#e9e9eb] px-4 py-3">
                <span className="imsg-dot h-2 w-2 rounded-full bg-slate-500" />
                <span
                  className="imsg-dot h-2 w-2 rounded-full bg-slate-500"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="imsg-dot h-2 w-2 rounded-full bg-slate-500"
                  style={{ animationDelay: "0.4s" }}
                />
              </div>
            </div>
          )}

          {!typing && lastIsMatt && lastMatt && (
            <p className="pr-1 pt-0.5 text-right text-[11px] font-medium text-slate-400">
              Delivered
            </p>
          )}
        </div>

        {/* quick replies */}
        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white px-3 pt-3">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={typing}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* composer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2 bg-white px-3 py-3"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="iMessage"
            className="flex-1 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#007aff] text-white transition hover:brightness-110 disabled:opacity-40"
            disabled={!draft.trim() || typing}
            aria-label="Send"
          >
            &uarr;
          </button>
        </form>
      </div>
    </div>
  );
}
