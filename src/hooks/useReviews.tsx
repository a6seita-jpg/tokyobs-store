import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Review = {
  id: string;
  product_id: string;
  author_email: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const reviewsKey = (productId: string) => ["reviews", productId] as const;

export function useReviews(productId: string) {
  return useQuery({
    queryKey: reviewsKey(productId),
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });
}

export function useReviewStats(productId: string) {
  const { data } = useReviews(productId);
  const list = data ?? [];
  const count = list.length;
  const avg = count > 0 ? list.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { avg, count };
}

export function useSubmitReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { email: string; name: string; rating: number; comment: string }) => {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        author_email: input.email.trim().toLowerCase(),
        author_name: input.name.trim(),
        rating: input.rating,
        comment: input.comment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: reviewsKey(productId) }),
  });
}
