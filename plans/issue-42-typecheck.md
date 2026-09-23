# Plano: zerar os erros de tipo e criar `npm run typecheck` (issue #42)

## Contexto

Nenhum comando do projeto roda o `tsc` sobre o código inteiro:

- `npm run build` (tsup) usa `tsconfig.build.json`, que **exclui** testes, stories e
  `setupTests.ts`;
- `npm run lint` não checa tipos;
- o Vitest transpila sem checar tipos.

Por isso 27 erros se acumularam sem ninguém ver. **Nenhum está em código publicado** — o `dist/`
não muda com esta issue.

## Diagnóstico

`npx tsc -p tsconfig.app.json --noEmit` → 25 erros; `npx tsc -p tsconfig.node.json --noEmit` → 2.

| Causa                                                                                                                                                                 | Arquivos                                                                                                                                                         | Erros |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| `noUncheckedIndexedAccess`: `getAllByRole(...)[0]`, `array[1]` e desestruturação de arrays são `T \| undefined`                                                       | Table.test (6), TransferList.test (5), SearchField.test (4), ImageGallery.test (3), ConversationList.test (2), ConversationThread.test (2), KanbanBoard.test (1) | 23    |
| `Table.stories` `ExpandableRows`: cast `as unknown as Story['args']` inclui `undefined` (inválido com `exactOptionalPropertyTypes`) e o parâmetro `row` fica sem tipo | Table.stories                                                                                                                                                    | 2     |
| `vite.config.ts`: `passWithNoTests` dentro de cada projeto do Vitest, mas o tipo `ProjectConfig` não aceita essa opção (ela é da configuração raiz)                   | vite.config.ts                                                                                                                                                   | 2     |

## Correções

### Testes (23 erros)

Os testes já garantem, em tempo de execução, que os elementos existem (`getAllBy*` lança se não
achar nada, e os testes checam quantidade). O que falta é dizer isso ao compilador, sem `any` e
sem `@ts-ignore`/`@ts-expect-error`:

- **Acesso por índice** (`getAllByRole('button')[0]`): asserção não-nula `!`, **só** onde o
  próprio teste garante a existência (ex.: após `toHaveLength(n)` ou quando o `getAllBy*` sem
  aquele item faria o teste falhar de qualquer forma). O `@typescript-eslint/no-non-null-assertion`
  não está ativo (o projeto usa `tseslint.configs.recommended`), então não há conflito de lint.
- **Desestruturação** (`const [first, second] = screen.getAllByRole('textbox')`): checar o
  tamanho antes (`expect(inputs).toHaveLength(2)`) e usar `!` na desestruturação — o teste fica
  mais explícito do que hoje.
- **Fixtures** (`{ ...conversations[1], unreadCount: 0 }` em ConversationList, `images[0]` em
  ImageGallery): tirar o item do array com checagem (`const second = conversations[1]!`) ou
  declarar as fixtures individualmente e montar o array a partir delas, o que for mais legível
  em cada arquivo.

Nenhuma asserção de teste muda de significado; a suíte continua com os mesmos testes passando.

### `Table.stories.tsx` (2 erros)

- Tipar o parâmetro: `renderExpandedRow: (row: User) => { ... }`.
- Trocar `as unknown as Story['args']` por `as unknown as NonNullable<Story['args']>`.

O cast existe porque a story de linhas expansíveis usa `Order` num `meta` tipado para `User`.
Separar isso num `meta` próprio seria mais correto, mas o Storybook só aceita um `meta` por
arquivo; mover a story para outro arquivo muda a navegação no Storybook. Fica o cast, agora
válido.

### `vite.config.ts` (2 erros)

Remover `passWithNoTests: true` dos dois projetos e colocar uma vez em `test` (nível raiz), onde
o tipo aceita. Os scripts do `package.json` já passam `--passWithNoTests`, então o comportamento
de `npm test`/`test:stories` não muda; a opção na raiz cobre quem rodar `npx vitest` direto.

## Script e trava

- `package.json`: `"typecheck": "tsc -b"`.
  - `tsconfig.json` já referencia `tsconfig.app.json` e `tsconfig.node.json` (padrão do
    template do Vite), e os dois têm `noEmit` + `tsBuildInfoFile` em `node_modules/.tmp` — o
    modo build checa os dois projetos e é incremental.
  - Se o `tsc -b` recusar `noEmit` nessa versão do TypeScript, o fallback é
    `tsc -p tsconfig.app.json --noEmit && tsc -p tsconfig.node.json --noEmit`.
- `.github/workflows/publish.yml`: passo `npm run typecheck` logo depois do `npm run lint`.
- `CLAUDE.md`:
  - comando novo na seção _Commands_;
  - lista do "pronto" passa a ser lint, **typecheck**, `npm test`, `npm run test:stories` e build;
  - nota: o build (`tsconfig.build.json`) não checa testes nem stories — só o `typecheck` pega
    erros neles.

## TDD

Não há comportamento novo para testar; o "teste que falha primeiro" é o próprio script:

1. Adicionar `typecheck` ao `package.json` e rodar → falha com os 27 erros.
2. Corrigir arquivo por arquivo, rodando `npm run typecheck` e o teste unitário do arquivo a cada
   passo (garantindo que nenhum teste mudou de resultado).
3. Terminar com `npm run typecheck` sem erros.

## Versão

Nada muda no pacote publicado (`dist/` idêntico): **sem nova versão, sem tag e sem entrada no
CHANGELOG**, conforme a convenção ("toda entrega que muda comportamento público sobe a versão").
A mudança no workflow passa a valer na próxima publicação.

## Verificação

1. `npm run typecheck` — 0 erros.
2. `npm run lint`, `npm test` (mesmos 863 testes passando), `npm run test:stories` (240),
   `npm run build`.
3. Conferir que o `dist/` gerado é idêntico ao da `v0.4.0` (`diff` dos arquivos), provando que só
   testes/stories/config mudaram.

## Fora do escopo

- Formatação com Prettier (#43) — os arquivos tocados aqui já saem formatados, mas o commit de
  formatação geral fica na #43.
- Ativar regras de lint mais estritas (`strict-type-checked`, `no-non-null-assertion`).

## Commit

`Corrige erros de tipo em testes e stories e adiciona npm run typecheck (issue #42)`.
