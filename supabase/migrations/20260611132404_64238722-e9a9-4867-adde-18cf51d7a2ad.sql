
DROP POLICY IF EXISTS "Anyone can update a review (client guards by email)" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can delete a review (client guards by email)" ON public.reviews;
REVOKE UPDATE, DELETE ON public.reviews FROM anon, authenticated;
