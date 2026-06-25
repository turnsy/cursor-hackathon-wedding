"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

const GREETING =
  "Hi Matt! What would you need help with today?";

function AgentIcon() {
  return (
    <Image
      src="/agent-icon.png"
      alt="InvoiceMate"
      width={36}
      height={36}
      className="shrink-0 rounded-full"
    />
  );
}

function ToolResult({ name, result }: { name: string; result: unknown }) {
  return (
    <div className="mt-2 overflow-hidden rounded-xl bg-[#3d5a80]/60">
      <div className="border-b border-[#98c1d9]/20 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#98c1d9]">
          {name.replace(/_/g, " ")}
        </p>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap p-3 font-mono text-xs text-[#e0fbfc]/80">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}

function MessageBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && <AgentIcon />}
      <div
        className={`max-w-[85%] px-4 py-3 text-sm ${
          isUser
            ? "rounded-[18px] rounded-br-[4px] bg-[#98c1d9] text-[#293241]"
            : "rounded-[18px] rounded-bl-[4px] bg-[#e0fbfc] text-[#293241]"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end justify-start gap-2">
      <AgentIcon />
      <div className="rounded-[18px] rounded-bl-[4px] bg-[#e0fbfc] px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot inline-block h-[7px] w-[7px] rounded-full bg-[#3d5a80]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function Chat() {
  const [input, setInput] = useState("");

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    await sendMessage({ text });
  }

  return (
    <div className="flex h-dvh flex-col bg-[#293241]">
      <header className="border-b border-[#3d5a80]/60 bg-[#3d5a80]/40 px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight text-[#e0fbfc]">
          InvoiceMate
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <MessageBubble role="assistant">
              <p>{GREETING}</p>
            </MessageBubble>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              role={message.role === "user" ? "user" : "assistant"}
            >
              {message.parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <p key={index} className="whitespace-pre-wrap">
                      {part.text}
                    </p>
                  );
                }

                if (part.type.startsWith("tool-")) {
                  const toolName = part.type.replace(/^tool-/, "");
                  const toolPart = part as {
                    state: string;
                    output?: unknown;
                    errorText?: string;
                  };

                  if (
                    toolPart.state === "output-available" &&
                    toolPart.output !== undefined
                  ) {
                    return (
                      <ToolResult
                        key={index}
                        name={toolName}
                        result={toolPart.output}
                      />
                    );
                  }

                  if (toolPart.state === "output-error" && toolPart.errorText) {
                    return (
                      <p key={index} className="text-[#ee6c4d]">
                        {toolName} failed: {toolPart.errorText}
                      </p>
                    );
                  }

                  return (
                    <p key={index} className="text-[#3d5a80]">
                      Running {toolName}...
                    </p>
                  );
                }

                return null;
              })}
            </MessageBubble>
          ))}

          {isLoading && <TypingIndicator />}

          {error && (
            <div className="rounded-lg border border-[#ee6c4d]/40 bg-[#ee6c4d]/20 px-4 py-3 text-sm text-[#ee6c4d]">
              {error.message}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-[#3d5a80]/60 bg-[#3d5a80]/40 px-4 py-4"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about invoices..."
            className="flex-1 rounded-xl border border-[#3d5a80] bg-[#293241] px-4 py-3 text-sm text-[#e0fbfc] outline-none placeholder:text-[#98c1d9]/60 focus:ring-2 focus:ring-[#98c1d9]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-[#ee6c4d] px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
