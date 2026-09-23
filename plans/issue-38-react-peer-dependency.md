# Plano: react/react-dom só como peerDependency (issue #38)

## Contexto

`package.json` declara `react` e `react-dom` em `peerDependencies` **e** em
`dependencies`. Dois consumidores (lead-system e ecommerce, ambos frontends Next.js)
que instalam o base-ds via caminho local (`npm install /caminho/para/base-ds`,
sem workspaces) quebram com `Invalid hook call` em qualquer componente que use
hooks ou renderize `Icon` (`lucide-react` faz `useContext`). Workarounds só de
config no app (`resolve.alias`, `resolve.dedupe`, `test.alias`,
`test.server.deps.inline`) não resolvem, e o symlink manual de
`base-ds/node_modules/react` só funciona para um consumidor por vez.

## Diagnóstico — o que a mudança no package.json resolve e o que não resolve

O `dist/` já trata React como externo (`tsup.config.ts`: `external: ['react',
'react-dom']`, e o tsup externaliza automaticamente tudo de `dependencies` e
`peerDependencies`, incluindo `react/jsx-runtime` e `lucide-react`). Então o
bundle **nunca** embute React: ele faz `require('react')` em runtime, e a
resolução do Node sobe a partir do **caminho real** do arquivo que faz o
require.

- **Instalação por tarball/registry** (`npm install base-ds-0.1.0.tgz`): o
  pacote é copiado para `app/node_modules/base-ds/`, sem `node_modules` próprio.
  Com React em `dependencies`, o npm ainda pode instalar uma cópia aninhada em
  `app/node_modules/base-ds/node_modules/react` se a versão do app não
  satisfizer o range — é esse o problema que a issue descreve e que **a
  correção do package.json resolve** por completo.
- **Instalação por diretório local** (`npm install ../base-ds` → symlink): o
  caminho real é `~/dev/node/base-ds/`, que tem seu próprio `node_modules`
  porque é o repositório de desenvolvimento. Para rodar Storybook, Vitest e
  build aqui, React **precisa** estar instalado nesse `node_modules` — como
  `devDependency` (e o npm 7+ ainda instala `peerDependencies` automaticamente).
  Ou seja: **mesmo após tirar React de `dependencies`, `base-ds/node_modules/react`
  continua existindo**, e `lucide-react` (que mora em
  `base-ds/node_modules/lucide-react`) continua resolvendo React para essa
  cópia. `resolve.preserveSymlinks` no app também não ajuda, porque o caminho
  preservado `app/node_modules/base-ds/node_modules/react` aponta para a mesma
  cópia.

Conclusão: a correção de manifesto é necessária e correta, mas **sozinha não
corrige os consumidores que usam symlink**. Eles precisam passar a consumir um
pacote empacotado (sem o `node_modules` de desenvolvimento). Por isso o plano
tem duas partes.

## Parte 1 — manifesto (`package.json`)

1. Remover `react` e `react-dom` de `dependencies`.
2. Manter em `peerDependencies` com o range atual `^18 || ^19`.
3. Adicionar em `devDependencies` fixados na versão já instalada hoje
   (`^19.2.8` para ambos), para que dev/Storybook/testes continuem funcionando.
4. Rodar `npm install` para atualizar `package-lock.json`.

Nada muda em `tsup.config.ts` — `external: ['react', 'react-dom']` já está
correto e continua sendo necessário (com React fora de `dependencies`, a
externalização automática ainda vem de `peerDependencies`, mas o `external`
explícito fica como garantia).

## Parte 2 — fluxo de consumo local sem symlink

Adicionar um script em `package.json`:

```json
"pack:local": "npm run build && npm pack --pack-destination ./.pack"
```

- Gera `.pack/base-ds-<versão>.tgz` contendo só `dist/`, `package.json` e
  `README.md` (campo `files` restringe a `dist`, e o npm sempre inclui os outros dois).
- Adicionar `.pack/` ao `.gitignore`.
- Consumidores trocam a dependência de `"base-ds": "file:../base-ds"` para
  `"base-ds": "file:../base-ds/.pack/base-ds-<versão>.tgz"` e rodam `npm install`
  após cada `pack:local`. Assim o npm copia o pacote para dentro do app e
  resolve `react` e `lucide-react → react` contra a árvore do app — uma única
  instância.
- Documentar esse fluxo no `README.md` (ver Parte 3).

Alternativas consideradas e descartadas:

- **`yalc`**: resolve o mesmo problema, mas adiciona uma ferramenta global e
  arquivos `.yalc/`/`yalc.lock` nos consumidores; `npm pack` não exige nada novo.
- **npm workspaces / monorepo**: exigiria reorganizar os projetos
  consumidores; fora do escopo da issue.
- **Embutir React no bundle / aliasar no build**: quebraria os consumidores
  (sempre duas instâncias). Descartado.

## Parte 3 — `README.md` como guia de uso para os consumidores

O projeto ainda não tem `README.md`, então ele é criado nesta issue, em
português (mesmo idioma das issues e dos commits). Como o npm sempre inclui o
`README.md` no tarball, ele chega em `node_modules/base-ds/README.md` de cada
app e acompanha exatamente a versão instalada. Seções:

- **Título e uma linha de descrição** do base-ds.
- **Requisitos:** `react` e `react-dom` `^18 || ^19` são `peerDependencies`, e o
  app consumidor precisa tê-los instalados.
- **Instalação (consumo local):**
  1. No base-ds: `npm run pack:local` (gera `.pack/base-ds-<versão>.tgz`).
  2. No app: `"base-ds": "file:../base-ds/.pack/base-ds-<versão>.tgz"` em
     `dependencies`, depois `npm install`.
  - Aviso explícito: **não** usar `npm install ../base-ds` / `file:../base-ds`
    (symlink). Explicar em 2–3 frases que o symlink faz o app carregar o React
    do `node_modules` de desenvolvimento do base-ds, causando `Invalid hook
    call` (com link para a issue #38).
  - Se o app já usava o workaround de symlink manual em
    `base-ds/node_modules/{react,react-dom}`, removê-lo.
- **Estilos:** o CSS é importado à parte (`base-ds/styles` para Tailwind v3,
  `base-ds/styles/v4` para Tailwind v4).
- **Atualizando:** como saber se o app está atrás (comparar a versão no
  `package.json` do app com a de `../base-ds/package.json`), ler o
  `CHANGELOG.md` antes de atualizar (seção "Ajustes necessários nos apps"),
  rodar `pack:local`, trocar o nome do `.tgz` no app e rodar `npm install`.
- **Regras de uso:**
  - Antes de criar um componente de UI no app, conferir o que o base-ds já
    exporta (`node_modules/base-ds/dist/index.d.ts`) e usar o componente em vez
    de recriar a receita à mão (o caso que motivou a #39).
  - Estilizar com as classes ligadas aos tokens (`bg-primary`,
    `text-muted-foreground`...), sem valores fixos de cor, espaçamento etc.
  - Não criar paliativos locais para bugs ou lacunas do base-ds (symlinks,
    wrappers que corrigem comportamento, cópias de componente): abrir uma issue
    no base-ds, como já é feito hoje.
- **Trecho para o `CLAUDE.md` dos apps:** um bloco pronto para copiar, com as
  regras acima resumidas e apontando para `node_modules/base-ds/README.md` e
  `node_modules/base-ds/dist/index.d.ts`. A aplicação desse trecho em cada app
  fica fora deste repositório (ver "Fora do escopo").

Não há teste automatizado para o README. A verificação é seguir os passos de
instalação dele no consumidor do scratchpad (item 2 da verificação end-to-end).

## Parte 4 — versionamento e `CHANGELOG.md`

Hoje o pacote está parado em `0.1.0`, então não dá para saber se um app está
desatualizado. A partir desta issue:

- **SemVer para 0.x:** mudança que exige ajuste nos apps sobe o *minor*
  (`0.1.0 → 0.2.0`); correção ou componente novo sem impacto sobe o *patch*.
  Esta issue muda como os apps instalam o pacote, então vai para **`0.2.0`**.
- **Nome do tarball com versão:** o `npm pack` já gera
  `base-ds-<versão>.tgz`, então o `package.json` de cada app mostra qual versão
  ele usa. Não reaproveitar um nome fixo: o `package-lock.json` do app guarda o
  hash do tarball, e trocar o conteúdo com o mesmo nome dá erro de integridade
  ou mantém a versão antiga.
- **`CHANGELOG.md` novo**, em português, formato
  [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/):
  - Entrada `0.2.0` com esta mudança e uma seção **"Ajustes necessários nos
    apps"** (trocar `file:../base-ds` pelo tarball e remover o symlink manual).
  - Entrada `0.1.0` resumindo o estado anterior ("versão inicial, até a issue
    #37"), sem reconstruir o histórico commit a commit.
- **Documentar no `CLAUDE.md` do base-ds** (seção "Other conventions"): toda
  entrega que muda comportamento público sobe a versão no `package.json` e
  ganha entrada no `CHANGELOG.md` no mesmo commit. Criar uma tag git
  (`v0.2.0`) junto do commit de versão.

## Testes (TDD)

Teste novo em `src/package.test.ts` (roda no projeto `unit`), escrito antes da
mudança e falhando no estado atual:

```ts
describe('package.json', () => {
  it('does not list react or react-dom as runtime dependencies', ...)
  it('declares react and react-dom as peer dependencies', ...)
  it('declares react and react-dom as dev dependencies for local development', ...)
})
```

Lê `package.json` via `fs` + `JSON.parse`. Serve de trava de regressão para a
duplicação não voltar ao adicionar dependências novas.

## Verificação end-to-end (fora do repo, no scratchpad)

1. `npm run pack:local` (deve gerar `.pack/base-ds-0.2.0.tgz`).
2. Seguindo exatamente os passos do `README.md`, criar um consumidor mínimo no scratchpad com `react@19.2.7`/`react-dom@19.2.7`
   (versão **diferente** da do base-ds, como no relato da issue), instalar o
   tarball, e confirmar `npm ls react` com uma única instância.
3. Script Node que faz `renderToString` de `<ToastProvider>` e de um `Button`
   com `leftIcon` (cobre hooks próprios e o `useContext` do `lucide-react`) via
   `require('base-ds')` e `import` (CJS e ESM). Esperado: renderiza sem
   `Invalid hook call`.
4. Contraprova: no mesmo consumidor, instalar via symlink (`npm install
../base-ds`) e confirmar que o erro ainda aparece — valida o diagnóstico da
   Parte 2 e justifica a documentação.
5. `npm run lint`, `npm test`, `npm run test:stories`, `npm run build` no base-ds.

## Fora do escopo

- Alterar os consumidores (lead-system, ecommerce) — só documentar o novo fluxo
  para eles adotarem e removerem o symlink manual.
- Aplicar o trecho de `CLAUDE.md` e a troca para o tarball nos apps — cada
  app faz isso no seu próprio repositório, a partir do README.
- Publicar em registry (GitHub Packages) com `npm outdated`/Dependabot — tratado
  na issue #40.
- Revisar outras dependências (`@dnd-kit/*`, `lucide-react`) — são runtime
  legítimas; só React/ReactDOM precisam ser singleton.

## Commit

Em português, por exemplo: `Move react/react-dom para peerDependencies, adiciona
fluxo de consumo via npm pack, README e CHANGELOG (issue #38)`, com a versão já
em `0.2.0` no mesmo commit e a tag `v0.2.0` criada em seguida.
