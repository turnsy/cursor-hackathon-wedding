type LogContext = Record<string, unknown>;

function write(level: "info" | "warn" | "error", message: string, context?: LogContext) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    scope: "invoice-chat",
    message,
    ...context,
  };

  const line = JSON.stringify(payload);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export const logger = {
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, context?: LogContext) => write("error", message, context),
};

export function serializeError(error: unknown) {
  if (error && typeof error === "object" && "type" in error && "message" in error) {
    const stripeError = error as {
      type?: string;
      code?: string;
      message: string;
      statusCode?: number;
      requestId?: string;
      raw?: { message?: string };
    };

    return {
      kind: "stripe",
      type: stripeError.type,
      code: stripeError.code,
      message: stripeError.message,
      statusCode: stripeError.statusCode,
      requestId: stripeError.requestId,
      rawMessage: stripeError.raw?.message,
    };
  }

  if (error instanceof Error) {
    return {
      kind: "error",
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    kind: "unknown",
    message: String(error),
  };
}
