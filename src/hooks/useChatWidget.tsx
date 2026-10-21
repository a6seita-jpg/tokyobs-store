import { createContext, useContext, useState, type ReactNode } from "react";

export type ChatTarget =
  | { kind: "support" }
  | { kind: "order"; orderId: string };

type ChatWidgetCtx = {
  open: boolean;
  target: ChatTarget;
  openSupport: () => void;
  openOrder: (orderId: string) => void;
  close: () => void;
};

const Ctx = createContext<ChatWidgetCtx>(null as never);

export function ChatWidgetProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<ChatTarget>({ kind: "support" });

  const openSupport = () => {
    setTarget({ kind: "support" });
    setOpen(true);
  };
  const openOrder = (orderId: string) => {
    setTarget({ kind: "order", orderId });
    setOpen(true);
  };
  const close = () => setOpen(false);

  return (
    <Ctx.Provider value={{ open, target, openSupport, openOrder, close }}>
      {children}
    </Ctx.Provider>
  );
}

export const useChatWidget = () => useContext(Ctx);
