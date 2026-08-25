# Issue #33 — Table: `header` de coluna aceitar `ReactNode`

Link: https://github.com/indianous/base-ds/issues/33

## Problema

`TableColumn<T>.header` (`src/components/organisms/Table/Table.tsx:9`) é tipado como `string`,
então não dá pra colocar nada além de texto no `<th>` — em particular, não dá pra colocar um
`Checkbox` de "selecionar todos" na coluna de seleção de linha.

## Solução

Trocar `header: string` por `header: ReactNode` em `TableColumn<T>`. Compatível com todo uso
existente (toda `string` já é um `ReactNode` válido). `ReactNode` já está importado em
`Table.tsx:2`.

Sem outra mudança de comportamento: `Table.tsx` já renderiza `{col.header}` dentro do `<th>`
(direto ou dentro do `<button>` de sort, linhas 74 e 86) — funciona igual para qualquer `ReactNode`.

## TDD — teste primeiro (`Table.test.tsx`)

Adicionar antes da mudança de tipo (deve falhar hoje só se o teste tentar passar um `ReactNode`
não-string como `header`, o que já quebraria a checagem de tipo do TypeScript — então o "red" aqui
é a falha de _type-check_, não de runtime. Vou confirmar rodando `npm test` que hoje um `header`
não-string nem compila):

1. `'renders a non-string ReactNode as the column header'` — cria uma coluna com
   `header: <span data-testid="select-all">Select all</span>`, renderiza a tabela, e verifica com
   `screen.getByTestId('select-all')` que o nó foi renderizado dentro do `<th>`.

## Arquivos afetados

- `src/components/organisms/Table/Table.tsx` — `header: string` → `header: ReactNode` em
  `TableColumn<T>` (linha 9).
- `src/components/organisms/Table/Table.test.tsx` — 1 novo teste.
- `src/components/organisms/Table/Table.stories.tsx` — opcional: adicionar uma story mostrando
  checkbox de "selecionar todos" no header, para documentar o caso de uso que motivou a issue.

`src/index.ts` não muda (tipo já exportado; só o shape do campo muda).

## Fora de escopo

- Lógica de seleção múltipla de linhas (estado de "selecionados", checkbox por linha, etc.) — a
  issue só pede o tipo do `header`. O `ecommerce` monta o `Checkbox` via `render` de coluna
  (já suportado hoje) e vai passar o checkbox de "selecionar todos" via `header` depois que a prop
  aceitar `ReactNode`.

## Passos de execução

1. Escrever o teste novo em `Table.test.tsx`.
2. Rodar `npm test` — confirmar que falha (erro de tipo/runtime conforme o caso).
3. Mudar `header: string` para `header: ReactNode` em `Table.tsx`.
4. Rodar `npm test` até passar.
5. Adicionar story opcional demonstrando checkbox no header.
6. Rodar `npm run lint` e `npm run build`.
7. Commit em português.
