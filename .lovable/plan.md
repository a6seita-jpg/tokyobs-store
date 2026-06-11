# Plano: Loja estilo gaming + reviews

Escopo aprovado: Home + categorias + página de produto + estrelas/feedbacks por usuário logado + hero promocional.

## 1. Backend (Lovable Cloud)
Ativar Cloud e criar:
- Tabela `reviews` (id, product_id text, user_id uuid FK auth.users, rating int 1-5, comment text, created_at)
- RLS: SELECT público; INSERT/UPDATE/DELETE só dono (auth.uid() = user_id); 1 review por produto/usuário (UNIQUE)
- GRANT SELECT anon + ALL authenticated
- Tabela `profiles` (id uuid PK FK auth.users, display_name text, avatar_url text) + trigger auto-create on signup — para mostrar nome do autor em cada review

## 2. Componentes novos
- `HeroCarousel.tsx` — carousel auto-play (3-4 slides promocionais), slide grande à esquerda + card menor à direita, dots no rodapé. Banners gerados: "Combo Steam 7 keys", "Netflix 30 dias R$11,75", "Seguidores Insta", "PS4 Jogos Premium"
- `PlatformCard.tsx` — card grande com logo central, hover red glow (versão Hulu-style)
- `ProductGridCard.tsx` — card de produto: imagem topo, título, preço riscado + preço atual em badge vermelho, estrelas média + count
- `StarRating.tsx` — display read-only (5 estrelas, half-star) + variante input
- `ReviewSection.tsx` — média grande + distribuição + lista de reviews + form (só logado)
- `CategoryTabs.tsx` — abas pill vermelhas/outline (All / Game ins / Play / etc.)

## 3. Páginas
- `index.tsx` REESCRITA: HeroCarousel → "Featured Platforms" (Steam, PS4, Xbox/Epic, Redes) → "Categorias do Catálogo" com tabs → grid de produtos em destaque com estrelas
- Rota nova `produto.$id.tsx` — página de detalhe: hero do produto + descrição + variações (StockListPicker existente) + ReviewSection
- Categorias existentes (steam, ps4, ps5, streaming, redes-sociais) — adicionar StarRating mini em cada item da lista, link "Ver detalhes" → `/produto/$id`

## 4. Banners hero (4 imagens 1600x800 premium)
- combo-steam, promo-netflix, promo-instagram, promo-ps4

## 5. Server functions
- `getProductRating(productId)` — média + count público
- `getProductReviews(productId)` — lista + join profile.display_name
- `submitReview` — protegida (requireSupabaseAuth), upsert por user+product
- `deleteMyReview` — protegida

## 6. Notas técnicas
- Product IDs: strings estáveis tipo `"steam:rand-200"`, `"streaming:netflix-30"` — já existem nos arquivos atuais como id de variação
- Hero usa setInterval 5s + setas manuais
- Manter: cart, kanji loading, guest mode, preços +R$5, login modal

Confirma para eu executar?