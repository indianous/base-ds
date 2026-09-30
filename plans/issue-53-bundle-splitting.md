# Plano: importar um componente leva só aquele componente ao cliente (issue #53)

## Contexto

No `portfolio` (Next.js 16.3.6, Turbopack), uma página que usa `Heading`, `Text`, `Button` e
`Container` leva **+949 KB** de JS (252 KB gzip) ao cliente: o base-ds inteiro.

A issue aponta três causas: o build em arquivo único (`splitting: false`, só a entrada
`src/index.ts`), o `'use client'` no arquivo inteiro e a falta de `"sideEffects"` no `package.json`.
No comentário, ela aponta uma quarta: o `Icon` faz `import * as LucideIcons from 'lucide-react'` e
busca o ícone por nome em tempo de execução. Com isso, nenhum bundler descarta os 1.854 ícones.

### Medição (esbuild sobre o `dist` da v0.4.10, minificado, `react` externo)

O esbuild faz tree shaking agressivo, então esta é a melhor situação possível hoje:

| import           | total       | gzip    | maior parte                                  |
| ---------------- | ----------- | ------- | -------------------------------------------- |
| só `Heading`     | 68.034      | 23.528  | 27 KB `tailwind-merge`, **13 KB `@dnd-kit`** |
| só `Navbar`      | **808.683** | 204.153 | **648 KB `lucide-react`**                    |
| o pacote inteiro | 910.130     | 233.811 | 648 KB `lucide-react`                        |

Daí saem duas conclusões:

1. **O `lucide-react` é quase tudo.** Qualquer componente que use `Icon` (21 arquivos: `Navbar`,
   `Drawer`, `Toast`, `Alert`, `Pagination` …) traz os 648 KB, mesmo com tree shaking perfeito.
2. **O arquivo único impede o descarte.** O `@dnd-kit` (usado só pelo `KanbanBoard`) entra até
   num app que importa só o `Heading`. No Next.js é pior: um módulo `'use client'` vira uma
   fronteira de client component e entra inteiro. Por isso a issue mediu 949 KB, e não os 68 KB
   do esbuild.

A API pública não depende de nomes de ícones: as props `icon` de `Alert`, `Sidebar`,
`DropdownMenu` e `Footer` são `ReactNode`, e o tipo `IconName` nem é exportado. Os nomes só
aparecem em mapas internos (`Alert`, `Toast`, `ConversationThread`) e nos `<Icon name="…">` dos
componentes.

## Mudanças

### 1. Ícones internos com import nomeado

Um componente interno novo, `IconBase` (`src/components/atoms/Icon/IconBase.tsx`), recebe o
componente do ícone (`icon: LucideIcon`) e aplica o que o `Icon` já faz: tamanhos, classes,
`aria-hidden`/`role="img"`/`aria-label`. O `Icon` passa a ser o `IconBase` mais a busca por nome,
e continua no mesmo arquivo com o `import * as LucideIcons`.

Os 21 componentes trocam `<Icon name="Search" />` por `<IconBase icon={Search} />`, com
`import { Search } from 'lucide-react'`. Os mapas viram `Record<Variant, LucideIcon>`. O
`lucide-react` declara `"sideEffects": false` e exporta cada ícone separadamente, então só os
ícones usados entram no bundle.

O `Icon` por nome continua exportado, sem mudança. Quem usa paga os 648 KB, e o JSDoc e o README
passam a dizer isso, recomendando o import direto do `lucide-react` no app. O `IconBase` não é
exportado: o app pode importar do `lucide-react` direto. Se quiserem uma versão leve do `Icon`
com os tamanhos do base-ds, isso vira outra issue.

### 2. Build dividido por componente

No `tsup.config.ts`, só para o ESM (que é o que Next, Vite e webpack usam via `exports.import`):

- `entry`: o `src/index.ts` mais cada componente (`src/components/**/[A-Z]*.tsx`, sem testes e
  stories);
- `splitting: true`: o esbuild gera um arquivo por componente e chunks para o código
  compartilhado (`cn`, `IconBase`, `Button` …). O `index.js` vira um barril que reexporta desses
  arquivos.

O CJS continua num arquivo só: o splitting do esbuild não suporta CJS. Quem entra por `require`
(Jest, Node) não roda num navegador, então o tamanho não importa ali. O `tsup` recebe duas
configurações (ESM e CJS).

Os nomes dos arquivos e chunks não são API: o `exports` do `package.json` continua só com `.`,
`./styles` e `./styles/v4`.

### 3. `'use client'` por arquivo

O `'use client'` passa a ser prefixado em **cada chunk e arquivo de componente**, mas **não** no
`index.js`. O barril sem a diretiva é um módulo comum, que pode ser importado por um Server
Component. Cada componente importado vira uma fronteira `'use client'` própria, e o Next.js só
leva ao cliente os módulos `'use client'` que a página usa. O prefixo continua sendo o passo em
string do `onSuccess`, agora sobre todos os `.js` do `dist` menos o `index.js`. Uso o mesmo passo
em vez da diretiva por chunk do esbuild para não depender de cada arquivo-fonte ter a diretiva.
No `index.cjs`, fica como hoje.

**Risco a validar**: se o Turbopack respeita um barril sem `'use client'` que reexporta módulos
`'use client'` e descarta os que não foram usados (com o `sideEffects` abaixo). A validação é a
medição num app Next.js mínimo (seção "Verificação com o Next.js"). Se não descartar, a
alternativa é o app ativar o `experimental.optimizePackageImports: ['@indianous/base-ds']` do
Next.js, que reescreve o import do barril para o arquivo de cada componente. Nesse caso, isso vai
para o README.

### 4. `"sideEffects"` no `package.json`

`"sideEffects": ["**/*.css"]`: os arquivos JS podem ser descartados quando não usados, e os CSS
importados pelo app (`@indianous/base-ds/styles`) não.

Antes, conferir que nenhum módulo do `src/` depende de efeito colateral no import. O candidato
óbvio é o `ToastContext` (`createContext` no topo do módulo), mas ele é usado via
`ToastProvider`/`useToast`, que importam o mesmo módulo.

## Testes (TDD, escritos antes)

### `src/bundle.test.ts` (projeto `unit`, ambiente node)

Empacota com o esbuild um arquivo que importa do `src/index.ts`, com
`react` externo, e confere o que entra no bundle pelo `metafile`:

- `import { Heading }`: não inclui `lucide-react`, `@dnd-kit/*`, `qrcode` nem os arquivos de
  `Charts`, `KanbanBoard` e `ConversationThread`;
- `import { Navbar }`: inclui só alguns ícones do `lucide-react` (limite de bytes baixo, algo como
  30 KB, contra os 648 KB de hoje) e não inclui `@dnd-kit`;
- `import { KanbanBoard }`: inclui o `@dnd-kit`, para o teste não passar por engano.

Hoje ele falha pelo `@dnd-kit` no `Heading` e pelo `lucide-react` no `Navbar`. Os testes rodam no
`src`, então não dependem do `dist` e rodam antes do build no CI.

O esbuild hoje só existe como dependência do `tsup` (0.27) e do `storybook` (0.28). Ele entra como
`devDependency` explícita, na versão do `tsup`, para o teste não depender da árvore de
dependências.

### `scripts/check-dist.mjs` (novo, `npm run check:dist`)

Confere o que só existe depois do build:

- `dist/index.js` sem `'use client'` e só com reexports;
- todo outro `.js` do `dist` com `'use client'` na primeira linha, e o `index.cjs` também;
- a medição do teste acima repetida sobre o `dist/index.js` (`Heading` sem `@dnd-kit` nem
  `lucide-react`).

Ele entra no `prepublishOnly` (`npm run build && npm run check:dist`), então o CI roda antes de
publicar. Vira um script, e não um teste do Vitest, porque depende do `dist`, que o `npm test`
não gera.

## Verificação com o Next.js

O teste com o esbuild mostra o que o tree shaking descarta (os ícones, o `@dnd-kit`, o
`sideEffects`), e o `check:dist` garante a estrutura que o Next.js precisa. O risco do item 3 só
aparece num bundler com React Server Components: um app que o esbuild e o Vite não reproduzem.

Por isso, a medição que decide a issue é a mesma que ela fez, mas num **app Next.js mínimo** no
scratchpad, sem o `portfolio`:

- `next@16.3.6`, a versão da issue, com Turbopack e App Router, e `react`/`react-dom` do npm
  público;
- o base-ds instalado do tarball de `npm run pack:local`. Assim não precisa do
  `GITHUB_PACKAGES_TOKEN`, e o clone do `portfolio` fica intocado;
- três páginas, todas Server Components: `/nativo` (HTML puro), `/basico` (`Heading`, `Text`,
  `Button`, `Container`, como na tabela da issue) e `/navbar` (`Navbar`, para medir os ícones);
- `next build` e a soma dos `<script>` de cada página, lidos do HTML gerado em `.next`, em bytes e
  gzip.

A medição roda duas vezes: com o tarball da v0.4.10 (a linha de base, que deve reproduzir os
~949 KB da issue) e com o da versão nova.

A medição é só desta vez. O app mínimo fica no scratchpad, fora do repositório, e o `next` só
entra no `package.json` dele: o base-ds não ganha o `next` como dependência, e o CI não roda essa
medição. O que fica protegendo contra regressões é o `bundle.test.ts` e o `check:dist`.

Meta: em `/basico`, a diferença para `/nativo` cai de ~949 KB para algo na ordem dos componentes
usados (dezenas de KB, puxados pelo `tailwind-merge`). Em `/navbar`, sem os 648 KB do
`lucide-react`. Se o Turbopack não descartar os componentes não usados, repito a medição com o
`optimizePackageImports` (item 3) e documento o que funcionar.

## README

- Uma nota no `Icon`: buscar por nome leva todos os ícones ao bundle. No app, prefira
  `import { Menu } from 'lucide-react'`.
- Se o `optimizePackageImports` for necessário, a configuração do Next.js.
- `@source`/`content` do Tailwind: documentar que deve apontar para a **pasta** `dist`
  (`node_modules/@indianous/base-ds/dist`), não para o `dist/index.js`. O `portfolio` e o
  `ecommerce-frontend` já fazem assim. Com o build dividido, as classes ficam espalhadas pelos
  chunks.

## Versão e changelog

A API não muda. Um app que aponta o Tailwind para o arquivo `dist/index.js`, e não para a pasta,
perderia classes, mas os apps conhecidos apontam para a pasta. **Patch**, v0.4.11. Entrada em
"Alterado" (build dividido, `sideEffects`, ícones internos) e "Ajustes necessários nos apps":
conferir que o `@source`/`content` aponta para a pasta `dist`.

## Fora do escopo

- O `tailwind-merge` (~27 KB) entra com qualquer componente, porque o `cn` é usado em todos.
  Trocar por algo menor é outra discussão.
- Um `Icon` leve exportado (`<Icon icon={Menu} />`).
- Subpaths por componente (`@indianous/base-ds/Button`). O barril com `sideEffects` resolve sem
  mudar os imports, que era um pedido da issue.

## Verificação

`npm run lint`, `format:check`, `typecheck`, `npm test` (inclui o `bundle.test.ts`),
`npm run test:stories`, `npm run build` + `npm run check:dist`, e a medição no app Next.js
mínimo.
