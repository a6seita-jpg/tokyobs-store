import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy, Clock, ShieldCheck, Upload, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart, fmtBRL } from "@/hooks/useCart";
import { useChatWidget } from "@/hooks/useChatWidget";
import { buildPixPayload, PIX_KEY } from "@/lib/pix";
import { getOrder, updateOrder, type Order } from "@/lib/orders";
import { useAuth } from "@/hooks/useAuth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/checkout/pix")({
  validateSearch: (search: Record<string, unknown>) => ({
    order: typeof search.order === "string" ? search.order : "",
  }),
  head: () => ({
    meta: [
      { title: "TOKYOBS — Pagamento Pix" },
      { name: "description", content: "Finalize seu pedido TOKYOBS com Pix. QR Code e código copia-e-cola." },
      { property: "og:title", content: "TOKYOBS — Pagamento Pix" },
      { property: "og:description", content: "Finalize seu pedido TOKYOBS com Pix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CheckoutPixPage,
});

function useCountdown(expiresAt: number, active: boolean) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiresAt - Date.now()));
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setRemaining(Math.max(0, expiresAt - Date.now())), 1000);
    return () => clearInterval(t);
  }, [expiresAt, active]);
  return remaining;
}

const fmtTime = (ms: number) => {
  const s = Math.ceil(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

function CopyField({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1.5">{label}</div>
      <div className="flex items-stretch gap-2">
        <div className={`flex-1 min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-700 font-mono ${multiline ? "break-all max-h-20 overflow-y-auto" : "truncate"}`}>
          {value}
        </div>
        <button
          onClick={copy}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 rounded-lg bg-neutral-900 text-white text-xs hover:bg-neutral-700 transition"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
    </div>
  );
}

function CheckoutPixPage() {
  const { order: orderId } = Route.useSearch();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { openOrder } = useChatWidget();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderLoaded, setOrderLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [expiredOpen, setExpiredOpen] = useState(false);
  const [comprovante, setComprovante] = useState("");
  const [observacao, setObservacao] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    if (!orderId || !user) { setOrder(null); setOrderLoaded(true); return; }
    setOrderLoaded(false);
    void getOrder(orderId).then(value => { if(active) setOrder(value); }).catch(() => { if(active) setOrder(null); }).finally(() => { if(active) setOrderLoaded(true); });
    return () => { active = false; };
  }, [orderId, user]);

  const waiting = order?.status === "aguardando_pagamento";
  const remaining = useCountdown(order?.expiresAt ?? 0, !!waiting);

  const payload = useMemo(
    () => (order ? buildPixPayload(order.total, order.id) : ""),
    [order],
  );

  // Expiração: devolve itens ao carrinho e marca o pedido como expirado.
  useEffect(() => {
    if (!order || order.status !== "aguardando_pagamento") return;
    if (remaining > 0) return;
    void updateOrder(order.id, { status: "expirado" }).then((updated) => {
      if (!updated) return;
      order.items.forEach((it) => addItem(it));
      setOrder(updated);
      setExpiredOpen(true);
    }).catch(() => toast.error("Não foi possível atualizar o pedido expirado."));
  }, [remaining, order, addItem]);

  if (!orderLoaded) return <main className="container-tk pt-28 pb-20 text-center">Carregando pedido...</main>;

  if (!order) {
    return (
      <main className="container-tk pt-28 pb-20 text-center">
        <h1 className="text-3xl font-extralight mb-4">Pedido não encontrado</h1>
        <p className="text-muted-foreground mb-6">Monte seu carrinho e finalize com Pix.</p>
        <Link to="/carrinho" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition">
          Ir para o carrinho
        </Link>
      </main>
    );
  }

  const pct = Math.max(0, Math.min(1, remaining / (15 * 60 * 1000)));
  const barColor = pct > 0.5 ? "#22c55e" : pct > 0.2 ? "#f59e0b" : "#ef4444";

  const submitComprovante = async () => {
    if (!comprovante.trim()) {
      toast.error("Envie o comprovante (imagem ou link) para continuar.");
      return;
    }
    try {
      const updated = await updateOrder(order.id, {
        status: "em_analise", comprovante: comprovante.trim(), observacao: observacao.trim() || undefined,
      });
      if (updated) setOrder(updated);
      setModalOpen(false);
      toast.success("Comprovante enviado! Pagamento em análise.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Falha ao enviar comprovante."); }
  };

  const onFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 2MB). Envie um link.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setComprovante(String(reader.result));
    reader.readAsDataURL(f);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] py-10 px-4 flex items-start justify-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl bg-white text-neutral-900 shadow-2xl overflow-hidden"
      >
        {order.status === "em_analise" ? (
          /* ---- Tela de confirmação / análise ---- */
          <div className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="mx-auto h-20 w-20 rounded-full grid place-items-center"
              style={{ background: "#e8f9ef" }}
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
              >
                <Check className="h-10 w-10" style={{ color: "#22c55e" }} />
              </motion.div>
            </motion.div>
            <h1 className="mt-5 text-2xl font-semibold">Pagamento em análise</h1>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
              Recebemos seu comprovante. Nossa equipe está confirmando o pagamento
              e você receberá seu produto em instantes após a aprovação.
            </p>
            <div className="mt-5 rounded-xl bg-neutral-50 border border-neutral-200 p-4 text-left text-xs text-neutral-600 space-y-1">
              <div>Pedido: <span className="font-mono font-medium text-neutral-900">{order.id}</span></div>
              <div>Total: <span className="font-medium text-neutral-900">{fmtBRL(order.total)}</span></div>
              <div>Status: <span className="font-medium" style={{ color: "#f59e0b" }}>Pagamento em análise</span></div>
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => openOrder(order.id)}
                className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-full text-sm font-medium text-white hover:opacity-90 transition"
                style={{ background: "#e63946" }}
              >
                <MessageCircle className="h-4 w-4" />
                Falar sobre este pedido
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-neutral-900 text-white text-sm hover:bg-neutral-700 transition"
              >
                Voltar para a loja
              </Link>
            </div>
          </div>
        ) : (
          /* ---- Tela de pagamento ---- */
          <>
            <div className="px-6 pt-6 pb-4 text-center border-b border-neutral-100">
              <div className="text-lg tracking-[0.3em] font-semibold">TOKYOBS</div>
              <div className="text-[11px] uppercase tracking-widest text-neutral-400 mt-1">Pagamento via Pix</div>
              <div className="mt-3 text-3xl font-light">{fmtBRL(order.total)}</div>
              <div className="text-[11px] text-neutral-400 font-mono mt-1">Pedido {order.id}</div>
            </div>

            {/* Timer */}
            <div className="px-6 pt-4">
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Tempo para pagar</span>
                <span className="font-mono font-semibold" style={{ color: barColor }}>{fmtTime(remaining)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: barColor }}
                  animate={{ width: `${pct * 100}%` }}
                  transition={{ duration: 0.6, ease: "linear" }}
                />
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* QR Code */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.35 }}
                className="mx-auto w-fit rounded-2xl border border-neutral-200 p-4 bg-white"
              >
                <QRCodeSVG value={payload} size={200} level="M" includeMargin={false} />
              </motion.div>
              <p className="text-center text-xs text-neutral-500 -mt-2">
                Abra o app do seu banco e escaneie o QR Code
              </p>

              <CopyField label="Pix copia e cola" value={payload} multiline />
              <CopyField label="Chave Pix" value={PIX_KEY} />

              {/* Como pagar */}
              <Accordion type="single" collapsible>
                <AccordionItem value="como" className="border-neutral-200">
                  <AccordionTrigger className="text-sm text-neutral-700">Como pagar com Pix</AccordionTrigger>
                  <AccordionContent className="text-xs text-neutral-600 leading-relaxed">
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Abra o aplicativo do seu banco.</li>
                      <li>Escolha pagar com Pix via QR Code ou copia e cola.</li>
                      <li>Confira o valor de {fmtBRL(order.total)} para TOKYOBS.</li>
                      <li>Conclua o pagamento e envie o comprovante abaixo.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex items-start gap-2 text-[11px] text-neutral-500">
                <ShieldCheck className="h-4 w-4 shrink-0" style={{ color: "#22c55e" }} />
                Pagamento processado com segurança. Após o envio do comprovante, o status fica "Pagamento em análise".
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="w-full h-12 rounded-full text-white text-sm font-medium hover:opacity-90 transition"
                style={{ background: "#e63946" }}
              >
                Já realizei o pagamento
              </button>
              <button
                onClick={() => openOrder(order.id)}
                className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-full border border-neutral-300 text-sm text-neutral-700 hover:border-neutral-500 transition"
              >
                <MessageCircle className="h-4 w-4" />
                Falar sobre este pedido
              </button>
              <Link
                to="/"
                className="block text-center text-xs text-neutral-400 hover:text-neutral-600 transition"
              >
                Voltar para a loja
              </Link>
            </div>
          </>
        )}
      </motion.div>

      {/* Modal comprovante */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm grid place-items-center px-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md rounded-2xl bg-white text-neutral-900 p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Enviar comprovante</h2>
                <button onClick={() => setModalOpen(false)} aria-label="Fechar" className="h-8 w-8 grid place-items-center rounded-full hover:bg-neutral-100">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-neutral-300 hover:border-neutral-500 transition p-5 text-sm text-neutral-600 flex flex-col items-center gap-2"
              >
                <Upload className="h-5 w-5" />
                {comprovante.startsWith("data:") ? "Imagem anexada — clique para trocar" : "Anexar imagem do comprovante"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              {comprovante.startsWith("data:") && (
                <img src={comprovante} alt="Comprovante" className="mx-auto max-h-32 rounded-lg border border-neutral-200" />
              )}

              <div>
                <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1.5">Ou cole o link do comprovante</div>
                <input
                  value={comprovante.startsWith("data:") ? "" : comprovante}
                  onChange={(e) => setComprovante(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-11 px-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm outline-none focus:border-neutral-500"
                />
              </div>

              <div>
                <div className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1.5">Observação (opcional)</div>
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={2}
                  placeholder="Ex: pago pelo Nubank, nome João"
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 bg-neutral-50 text-sm outline-none focus:border-neutral-500 resize-none"
                />
              </div>

              <button
                onClick={submitComprovante}
                className="w-full h-12 rounded-full text-white text-sm font-medium hover:opacity-90 transition"
                style={{ background: "#e63946" }}
              >
                Confirmar pagamento
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal expirado */}
      <AnimatePresence>
        {expiredOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-sm grid place-items-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm rounded-2xl bg-white text-neutral-900 p-6 text-center space-y-3"
            >
              <div className="mx-auto h-14 w-14 rounded-full grid place-items-center" style={{ background: "#fdeaea" }}>
                <Clock className="h-7 w-7" style={{ color: "#ef4444" }} />
              </div>
              <h2 className="text-lg font-semibold">Tempo expirado</h2>
              <p className="text-sm text-neutral-600">
                Os 15 minutos acabaram. Seus itens voltaram para o carrinho — é só finalizar de novo.
              </p>
              <button
                onClick={() => navigate({ to: "/carrinho" })}
                className="w-full h-11 rounded-full bg-neutral-900 text-white text-sm hover:bg-neutral-700 transition"
              >
                Voltar ao carrinho
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
