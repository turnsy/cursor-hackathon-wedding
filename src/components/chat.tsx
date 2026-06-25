"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FormEvent, useMemo, useState } from "react";

function ToolResult({ name, result }: { name: string; result: unknown }) {
  return (
    <div className="mt-2 rounded-lg border border-border bg-accent-soft/40 p-3 text-sm">
      <p className="mb-1 font-medium text-accent">Tool: {name}</p>
      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-foreground/80">
        {JSON.stringify(result, null, 2)}
      </pre>
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
    <div className="flex h-dvh flex-col">
      <header className="border-b border-border bg-surface px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Invoice Chat</h1>
        <p className="text-sm text-muted">
          Create, update, delete, and send invoices with natural language.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-8 text-center">
              <p className="text-muted">
                Try: &ldquo;Create an invoice for alice@example.com titled
                &lsquo;Wedding Photography&rsquo; with line items: Ceremony
                coverage $1500 and Reception coverage $800&rdquo;
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-accent text-white"
                    : "border border-border bg-surface text-foreground"
                }`}
              >
                {message.parts.map((part, index) => {
                  if (part.type === "text") {
                    return (
                      <p key={index} className="whitespace-pre-wrap text-sm">
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
                        <p key={index} className="text-sm text-red-600">
                          {toolName} failed: {toolPart.errorText}
                        </p>
                      );
                    }

                    return (
                      <p key={index} className="text-sm text-muted">
                        Running {toolName}...
                      </p>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                Thinking...
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error.message}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-surface px-4 py-4"
      >
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about invoices..."
            className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none ring-accent focus:ring-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
