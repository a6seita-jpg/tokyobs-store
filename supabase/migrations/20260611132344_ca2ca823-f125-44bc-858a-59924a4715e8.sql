
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, author_email)
);
CREATE INDEX reviews_product_id_idx ON public.reviews (product_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Anyone can submit a review"
  ON public.reviews FOR INSERT WITH CHECK (
    char_length(author_email) > 3
    AND char_length(author_name) > 0
    AND char_length(comment) <= 1000
  );

CREATE POLICY "Anyone can update a review (client guards by email)"
  ON public.reviews FOR UPDATE USING (true) WITH CHECK (
    char_length(comment) <= 1000
  );

CREATE POLICY "Anyone can delete a review (client guards by email)"
  ON public.reviews FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER reviews_touch_updated
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
