# Plano: suporte a Tailwind v4 para consumidores (issue #37)

## Contexto

O `base-ds` é construído e distribuído assumindo Tailwind v3: `tailwind.config.js`
usa a API JS (`theme.extend`) mapeando classes (`bg-primary`, `text-muted-foreground`
etc.) para variáveis CSS de `src/styles/theme.css`. O projeto **lead-system**
(Next.js) foi criado já em Tailwind v4, que só gera utilitário para tokens
declarados dentro de um bloco `@theme { ... }` no CSS — variáveis soltas em `:root`
não bastam, e `tailwind.config.js` (JS) não é o mecanismo primário de tema do v4.

## Decisão de abordagem: aditiva, sem migrar o pacote para v4

Conforme discutido com o usuário: migrar o `base-ds` inteiro para Tailwind v4
tocaria `vite.config.ts` (compartilhado por build, Storybook e Vitest browser
mode), `globals.css` e `tailwind.config.js` por inteiro, forçaria outros
consumidores ainda em v3 a migrar junto, e não é o que a issue pede. A solução
aqui é **publicar um novo arquivo CSS pronto para v4**, aditivo — o pacote
continua em Tailwind v3 internamente (dev, Storybook, build, testes), sem
nenhuma mudança em `tailwind.config.js`, `globals.css` ou componentes.

## Arquivo novo: `src/styles/theme-v4.css`

```css
@import './theme.css';

@theme inline {
  /* Cores semânticas — espelha 1:1 tailwind.config.js `theme.extend.colors` */
  --color-background: var(--color-background);
  --color-foreground: var(--color-foreground);
  --color-border: var(--color-border);
  --color-input: var(--color-input);
  --color-ring: var(--color-ring);
  --color-overlay: var(--color-overlay);
  --color-muted: var(--color-muted);
  --color-muted-foreground: var(--color-muted-foreground);
  --color-primary: var(--color-primary);
  --color-primary-foreground: var(--color-primary-foreground);
  /* ...hover/active/muted/muted-fg/border de primary/secondary/success/warning/
     destructive/info, chart-1..4, chart-sequential-250..700 — mesma lista de
     `tailwind.config.js`, sem os primitivos (neutral/blue/violet/...), que hoje
     também não viram utilitário nenhum via JS config */

  /* Spacing — mesmas chaves de tailwind.config.js (nota: chave com ponto,
     ex. 0.5, é válida em nome de custom property no v4) */
  --spacing-0: var(--spacing-0);
  --spacing-0.5: var(--spacing-0-5);
  --spacing-1: var(--spacing-1);
  /* ...até --spacing-64 */

  /* Tipografia */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --text-xs: var(--text-xs);
  /* ...até --text-5xl */
  --font-weight-thin: var(--font-weight-thin);
  /* ...até --font-weight-extrabold */
  --leading-none: var(--leading-none);
  /* ...até --leading-loose */
  --tracking-tighter: var(--tracking-tighter);
  /* ...até --tracking-widest */

  /* Sombras e bordas */
  --shadow-none: var(--shadow-none);
  /* ...até --shadow-2xl, --shadow-inner */
  --radius-none: var(--radius-none);
  /* ...até --radius-full */
}
```

- `@import './theme.css'` garante que os valores reais (hex, rem, px) continuem
  numa única fonte de verdade — `theme-v4.css` não duplica nenhum valor literal,
  só re-expõe os mesmos tokens no formato que o v4 entende.
- `@theme inline` (em vez de `@theme` puro) é proposital: diz ao Tailwind para
  **referenciar** as variáveis já definidas em `:root` (via `var()`) nas classes
  geradas, em vez de tentar resolver um valor literal em build-time e reemitir a
  variável — evita duplicar/conflitar a declaração de `--color-primary` etc. em
  `:root`. Ver "Riscos e verificação" abaixo — esse comportamento vai ser
  confirmado contra um build real de v4 antes de fechar a issue, não só assumido.
- Não inclui os primitivos (`--color-neutral-*`, `--color-blue-*`, etc.) nem os
  utilitários de border-width ainda (ver ponto em aberto abaixo) — só o que hoje
  já vira classe utilitária via `tailwind.config.js`.

## Ponto em aberto a resolver durante a implementação: `border-width`

`tailwind.config.js` sobrescreve `theme.borderWidth` (`--border-0/1/2/4`) para as
classes `border`, `border-2`, `border-4`. Não tenho certeza de que o v4 expõe um
namespace `@theme` dedicado e "sobrescrevível" para largura de borda do mesmo
jeito que expõe para cor/spacing/radius/shadow — vou confirmar isso no passo de
verificação (sandbox) e ajustar a abordagem se precisar (ex.: manter o valor
default do v4 pra `border`/`border-2`/`border-4`, que já bate com os tokens atuais
de qualquer forma — `--border-1: 1px`, `--border-2: 2px`, `--border-4: 4px` são
os próprios defaults do Tailwind, então mesmo sem token custom aqui o resultado
visual não muda).

## Build (`tsup.config.ts`)

Hoje o `onSuccess` só copia `theme.css`:

```ts
copyFileSync(join('src', 'styles', 'theme.css'), join('dist', 'styles', 'theme.css'))
```

Adicionar uma segunda cópia:

```ts
copyFileSync(join('src', 'styles', 'theme-v4.css'), join('dist', 'styles', 'theme-v4.css'))
```

O `@import './theme.css'` dentro de `theme-v4.css` continua resolvendo depois da
cópia, já que os dois arquivos ficam lado a lado em `dist/styles/`.

## `package.json`

Novo subpath em `exports`, ao lado do `./styles` existente:

```json
"exports": {
  ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js", "require": "./dist/index.cjs" },
  "./styles": "./dist/styles/theme.css",
  "./styles/v4": "./dist/styles/theme-v4.css"
}
```

Consumidor em Tailwind v4 faria `@import "base-ds/styles/v4";` no CSS global do
projeto, em vez de `@import "base-ds/styles";`.

Nenhuma dependência nova em `package.json` do próprio `base-ds` — Tailwind v4 só
é usado num sandbox descartável para verificação (ver abaixo), não entra como
dependency/devDependency deste repositório.

## Riscos e verificação (substitui TDD tradicional aqui — não tem como testar

CSS-do-Tailwind-real via Vitest/jsdom)

Como não existe teste automatizado no repo capaz de rodar o compilador do
Tailwind v4 e inspecionar o CSS gerado, a verificação é manual, num sandbox
temporário fora do repositório (`/tmp` ou scratchpad):

1. Projeto mínimo com `tailwindcss@4` + `@tailwindcss/postcss` (ou
   `@tailwindcss/vite`), com `theme-v4.css` local via caminho relativo (simulando
   `node_modules/base-ds/dist/styles/theme-v4.css` depois do `npm run build`
   real deste repo).
2. Um CSS/HTML de teste usando: `bg-primary`, `text-primary-foreground`,
   `text-muted-foreground`, `border-border`, `rounded-md`, `shadow-md`,
   `border-2`, `font-sans`, `text-sm`, `font-semibold`, `tracking-wide`,
   `leading-normal`, `p-4`, `gap-2`.
3. Rodar o build do Tailwind v4 e inspecionar o CSS gerado: cada classe deve
   compilar pra uma regra usando `var(--...)` do token certo — não um valor
   default do Tailwind (esse é o modo de falha perigoso aqui: se um namespace
   estiver errado, o Tailwind não dá erro, só silenciosamente não gera a classe
   ou gera com o default embutido).
4. Resolver o ponto em aberto de `border-width` com o resultado desse teste.
5. Confirmar que nada mudou para v3: `npm test`, `npm run lint`, `npm run build`
   completos do próprio `base-ds` continuam verdes (o novo arquivo nunca é
   importado pelo próprio pacote, só publicado).

## Arquivos afetados

- `src/styles/theme-v4.css` (novo)
- `tsup.config.ts` — copiar o novo arquivo pro `dist/styles/`
- `package.json` — novo subpath `./styles/v4` em `exports`
- Nenhuma mudança em `tailwind.config.js`, `globals.css`, `vite.config.ts`,
  componentes ou testes existentes.

(Não há `README.md` no repo hoje documentando o import de `./styles` — não vou
criar um só para esta issue, fora do pedido original.)

## Fora de escopo

- Migrar o `base-ds` inteiro (dev/build/Storybook/Vitest) para Tailwind v4.
- Dark mode / theming dinâmico via `@theme`/media query (não existe hoje no
  repo — `theme.css` tem um único bloco `:root` estático).
- Gerar `theme-v4.css` automaticamente a partir de `tailwind.config.js` (poderia
  ser uma melhoria futura — um script — mas manual é suficiente para o escopo
  desta issue).

## Passos de implementação

1. Escrever `src/styles/theme-v4.css` completo (todas as chaves de
   `tailwind.config.js` espelhadas em `@theme inline`, na ordem das seções já
   usadas em `theme.css`: cores → spacing → tipografia → sombras → bordas).
2. Montar o sandbox de verificação e rodar os casos 1–4 de "Riscos e
   verificação"; ajustar `theme-v4.css` conforme o resultado (principalmente
   `border-width`).
3. Atualizar `tsup.config.ts` (cópia do novo arquivo).
4. Atualizar `package.json` (`exports["./styles/v4"]`).
5. `npm run build` e inspecionar `dist/styles/theme-v4.css` gerado de verdade
   (não só o arquivo fonte).
6. `npm run lint`, `npm test`, `npm run build` completos — confirmar zero
   regressão para o fluxo v3 existente.
