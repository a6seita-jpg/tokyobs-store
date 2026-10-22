# Tokyo Connection

Crie o site completo TOKYOBS com as especificações abaixo. Use React, Tailwind CSS, shadcn/ui, TypeScript. Design minimalista japonês wabi-sabi.



REGRAS GERAIS:

1. Cores: fundo #0A0A0A / #FA, texto branco/preto, destaque vermelho #C41E3A

2. Toggle dark/light mode no header com ícone sol/lua. Salvar no localStorage

3. Animação ripple ao clicar em botões e cards. Transição "ink wash" fade entre páginas

4. Mobile first, responsivo, fonte Inter + Noto Sans JP

5. Header fixo com logo TOKYOBS + menu: Início | PS4 | PS5 | Streaming | Roblox | Variados | Acessórios | Sobre Nós

6. Footer com copyright e botão "Sobre Nós"



SISTEMA DE LOGIN:

1. Modal de login/cadastro simples usando localStorage, sem backend

2. Campos: Email, Senha, Nickname, URL Foto Perfil

3. Ao logar: salvar user no localStorage com {email, nickname, avatar}. Mostrar nickname + foto no header

4. Botão Sair faz logout

5. Se usuário não logado clicar em PS4, abrir modal "Faça login pra consultar"

6. Criar página de perfil onde usuário pode editar nickname e foto



CATEGORIAS E PRODUTOS:

Zerar todos os produtos de todas as categorias. Deixar apenas 1 card na categoria PS4. PS5, Streaming, Roblox, Variados, Acessórios ficam apenas com 1 card "Em breve/Consultar".



PÁGINA INICIAL:

Hero genérico para loja de variedades: 

Título: "TOKYOBS - O que você procura, a gente tem"

Subtexto: "Variedade, preço justo e entrega rápida. Fale conosco e encontre o que você precisa"

Grid 6 colunas mobile 3 desktop com cards das categorias: PS4, PS5, Streaming, Roblox, Variados, Acessórios. Cada card com imagem representativa + nome. Clicar vai pra categoria.



CATEGORIA PS4 - CATÁLOGO SOB CONSULTA:

Remover grid de jogos. Mostrar apenas 1 card centralizado grande:

- Imagem: capa DualShock 4 + torii vermelho

- Título: "Catálogo PS4 Completo" 

- Preço: "Sob consulta" em vermelho #C41E3A tamanho grande

- Descrição: "161+ títulos disponíveis. Mídia digital imediata"

- Badge: "Membro TOKYOBS tem prioridade"

- Botão principal: "Consultar Disponibilidade no WhatsApp"



Botão WhatsApp deve abrir: https://wa.me/5573988810368?text=Olá! Tenho interesse em algum dos produtos da TOKYOBS. Gostaria de consultar disponibilidade e preço do jogo PS4:



Abaixo do card, mostrar grid 4 colunas com 12 jogos de exemplo como vitrine: GTA V, God of War Ragnarok, Elden Ring, Spider Man 2, FC 25, Hogwarts Legacy, The Last of Us Part 2, Red Dead 2, Cyberpunk 2077, Resident Evil 4 Remake, Call of Duty MW3, Assassin's Creed Mirage. Cada um só com nome + "Consultar preço". Texto: "+ 149 títulos disponíveis"



OUTRAS CATEGORIAS PS5, STREAMING, ROBLOX, VARIADOS, ACESSÓRIOS:

1 card centralizado cada com:

- Imagem representativa da categoria

- Título: "PS5" / "Streaming" / "Roblox" / "Variados" / "Acessórios"

- Texto: "Catálogo sob consulta. Temos variedade de produtos"

- Preço: "Sob consulta"

- Botão WhatsApp com mensagem automática trocando o nome da categoria



PÁGINA SOBRE NÓS:

Criar rota /sobre com texto:

"Título: Sobre a TOKYOBS

A TOKYOBS é uma loja de variedades com foco em encontrar exatamente o que o cliente procura.



Somos confiáveis e prezamos pelo compromisso. Cada cliente é tratado com transparência e respeito. Trabalhamos com diversos produtos digitais e físicos, entrega rápida e suporte 24h via WhatsApp.



Nossa missão é simplificar sua busca. Se você precisa de algo específico, fale conosco. Catálogo atualizado, atendimento humano e garantia TOKYOBS em todas as vendas."



Adicionar 3 cards: "Variedade de Produtos", "24h Suporte", "100% Confiável"



COMPONENTES:

Separar em Header, Footer, CategoryCard, ProductCard, LoginModal, ProfileModal. Código limpo e comentado.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tokyobs-store.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f715630f-d309-4f56-8485-5490e2b4505c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
