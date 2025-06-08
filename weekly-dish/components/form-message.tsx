import { use, Suspense } from "react";

export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message?: Message | Promise<Message> }) {
  // messageがPromiseの場合はuseで解決（React 18+）
  let resolved: Message | undefined = undefined;
  if (typeof message === "object" && message !== null && "then" in message) {
    // サーバーコンポーネントではuse()でPromiseを解決
    // クライアントでは通常はPromiseで渡さない
    resolved = use(message as Promise<Message>);
  } else {
    resolved = message;
  }
  if (!resolved) return null;
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {"success" in resolved && (
        <div className="text-foreground border-l-2 border-foreground px-4">
          {resolved.success}
        </div>
      )}
      {"error" in resolved && (
        <div className="text-destructive-foreground border-l-2 border-destructive-foreground px-4">
          {resolved.error}
        </div>
      )}
      {"message" in resolved && (
        <div className="text-foreground border-l-2 px-4">{resolved.message}</div>
      )}
    </div>
  );
}
