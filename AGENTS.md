# AGENTS.md

- Auth é 100% localStorage (`src/hooks/useAuth.tsx`), sem backend: usuários em `tk-users` (senha em base64 via btoa), sessão em `tk-user`, guest em `tk-guest`. Roles ficam no próprio registro do usuário (`role: "user" | "admin"`) porque não há servidor para validar — não migrar para Supabase Auth sem o usuário pedir.
- Pedidos e carrinho também são localStorage (`src/lib/orders.ts`, `src/hooks/useCart.tsx`); o painel `/admin` lê dessas mesmas fontes.
- Rotas protegidas por role devem esperar `hydrated` do useAuth antes de chamar `requireAuth`, senão o modal de login abre antes da sessão ser restaurada.

- Chat conversations remain browser-local in `src/lib/chat.ts`; create threads in effects, never during render, and use the shared ChatPanel for both customer and admin so read counters stay consistent. No cross-device delivery is provided by this architecture.
- Reusable motion lives in PremiumMotion and honors reduced-motion preferences; informational pages share FAQ data from src/lib/faq.ts to keep answers consistent.
