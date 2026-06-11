import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useReviews, useSubmitReview, useReviewStats } from "@/hooks/useReviews";
import { StarRating } from "@/components/StarRating";
import { toast } from "sonner";

type Props = { productId: string; productName: string };

export function ReviewSection({ productId, productName }: Props) {
  const { user, isGuest, openLogin } = useAuth();
  const { data: reviews = [], isLoading } = useReviews(productId);
  const { avg, count } = useReviewStats(productId);
  const submit = useSubmitReview(productId);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const canSubmit = !!user; // guest doesn't have email
  const alreadyReviewed =
    user && reviews.some((r) => r.author_email === user.email.toLowerCase());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openLogin();
      return;
    }
    if (rating < 1) {
      toast.error("Escolha uma nota");
      return;
    }
    try {
      await submit.mutateAsync({
        email: user.email,
        name: user.nickname,
        rating,
        comment,
      });
      setComment("");
      setRating(5);
      toast.success("Avaliação enviada!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (/duplicate|unique/i.test(message)) {
        toast.error("Você já avaliou esse produto");
      } else {
        toast.error("Erro ao enviar avaliação");
      }
    }
  };

  return (
    <section
      className="mt-8 rounded-xl border p-5 sm:p-6"
      style={{ background: "rgba(20,20,20,0.6)", borderColor: "#2a2a2a" }}
    >
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Avaliações
        </h3>
        <div className="flex items-center gap-3">
          <div className="text-3xl font-bold" style={{ color: "#ffb400" }}>
            {avg.toFixed(1)}
          </div>
          <div className="flex flex-col">
            <StarRating value={Math.round(avg)} size={16} />
            <span className="text-xs text-muted-foreground mt-0.5">
              {count} {count === 1 ? "avaliação" : "avaliações"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      {canSubmit ? (
        alreadyReviewed ? (
          <p className="text-sm text-muted-foreground mb-5">Você já avaliou este produto. Obrigado!</p>
        ) : (
          <form onSubmit={onSubmit} className="mb-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Sua nota:</span>
              <StarRating value={rating} onChange={setRating} size={22} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              placeholder={`Conte como foi sua experiência com ${productName}…`}
              className="w-full min-h-[90px] rounded-md p-3 text-sm outline-none focus:border-[#e63946] resize-y"
              style={{ background: "#0a0a0a", border: "1px solid #2a2a2a", color: "#fff" }}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submit.isPending}
                className="h-10 px-5 rounded-lg text-sm font-semibold disabled:opacity-60"
                style={{ background: "#e63946", color: "#fff" }}
              >
                {submit.isPending ? "Enviando…" : "Enviar avaliação"}
              </button>
            </div>
          </form>
        )
      ) : (
        <div
          className="mb-6 flex items-center justify-between gap-3 rounded-lg p-3 text-sm"
          style={{ background: "#0a0a0a", border: "1px solid #2a2a2a" }}
        >
          <span className="text-muted-foreground">
            {isGuest ? "Convidados não podem avaliar." : "Faça login para avaliar este produto."}
          </span>
          <button
            type="button"
            onClick={openLogin}
            className="h-9 px-4 rounded-md text-sm font-medium"
            style={{ background: "#e63946", color: "#fff" }}
          >
            Entrar
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">Seja o primeiro a avaliar.</p>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-lg p-3 sm:p-4"
              style={{ background: "#0a0a0a", border: "1px solid #1f1f1f" }}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold"
                    style={{ background: "#e63946", color: "#fff" }}
                  >
                    {r.author_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{r.author_name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-foreground/85">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
