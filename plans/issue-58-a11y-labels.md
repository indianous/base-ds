# Plano: textos fixos dos componentes viram props (issue #58)

## Contexto

O `indoor-media` é todo em `pt-BR` e vai usar o base-ds no web e no admin. A issue lista 13
componentes com textos de acessibilidade fixos em inglês, sem prop para trocar (WCAG 3.1.2). A
prioridade dela é `Button`, `Dialog`, `Pagination`, `Table`, `FileUpload`, `Toast`, `Sidebar` e
`Charts`, e ela aceita dividir o trabalho.

A convenção já está no `CLAUDE.md` ("Accessibility labels"): uma prop opcional e plana por texto,
`label` para o landmark/região do componente, `<thing>Label` para um controle e `<thing>Title`
para um título interno. Um texto que depende de um valor vira uma função, e o texto atual fica como
padrão, então não há quebra. Quando um componente renderiza outro que tem os próprios rótulos, ele
expõe esses rótulos com o prefixo do componente interno (`toastCloseLabel`).

### O que a varredura achou além da issue

A tabela da issue bate com o código: 13 componentes e 29 textos distintos. Varri todos os
componentes (atributos `aria-label`, textos `sr-only`, template strings e textos JSX literais) e
achei mais três grupos:

1. **Textos que dependem de valor, nos componentes da issue**: `Pagination` (`Page ${n}`),
   `Rating` (`${n} stars`), `FileUpload` (`Remove ${name}`), `ImageGallery`
   (`View image ${n}: ${alt}`, `Zoom image: ${alt}`) e `Table` (`Collapse row`, além de
   `Expand row`).
2. **Componentes fora da tabela**: `MultiSelect` e `TagsInput` (`Remove ${x}`), `QrCode`
   (`QR Code: ${value}`), `KanbanBoard` (`${n} cards`), `TransferList` (`Empty`) e
   `FilterDropdown`.
3. **Textos visíveis**, que a convenção não cobria de forma explícita, mas que têm o mesmo
   problema num site `pt-BR`: `FileUpload` ("Drag files here or click to select", "Select files",
   "File exceeds maximum size of …"), `Table` ("No data"), `TransferList` ("Empty"), a legenda
   "Other" do `Correlation`, os nomes das mídias do `ConversationThread` ("Image", "Audio",
   "Document") e as tabelas ocultas dos gráficos (título e cabeçalhos das colunas, lidos por
   leitores de tela).

E um caso ao contrário: o `FilterDropdown` ("Selecionar todos", "Limpar", "Aplicar") e o
`MultiSelect` ("Nenhum resultado") têm textos fixos **em português**, então um app em inglês tem o
problema inverso. Os dois são de 21 e 22/08, anteriores à convenção do `CLAUDE.md` (28/09), que
define o inglês como padrão. São resquícios, e não uma exceção pensada.

O plano cobre os três grupos. Fazer só a tabela da issue deixaria o `indoor-media` com textos em
inglês nos mesmos componentes.

## Decisões

- **Textos visíveis entram na convenção.** Um texto que o componente mostra por conta própria e que
  o app não passa como conteúdo também vira prop. O nome segue o papel: `<thing>Label` para um
  controle ("Select files" num botão) e `<thing>Message` para um texto de estado
  (`emptyMessage = 'No data'`). O `CLAUDE.md` ganha o `<thing>Message`.
- **O padrão é o inglês, inclusive no `FilterDropdown` e no `MultiSelect`.** Os textos em
  português desses dois viram props com padrão em inglês ("Select all", "Clear", "Apply", "No
  results"), seguindo a convenção. Isso muda a tela de quem usa esses componentes sem passar as
  props, então vai num lote próprio, o último, com versão _minor_ (ver lote 4).
- **Gráficos com props planas.** Cada cabeçalho de coluna da tabela oculta vira uma prop
  `<coluna>ColumnTitle`, como pede a convenção (sem objeto `labels`). Isso dá até 6 props por
  gráfico, mas cada uma é opcional.
- **Quatro entregas**, uma por lote. Os lotes 1 a 3 só acrescentam props e são _patch_. O lote 4
  troca padrões e é _minor_. Assim o `indoor-media` recebe primeiro os componentes que pediu como
  prioridade, cada entrega fica revisável, e a mudança que exige ajuste nos apps fica isolada. A
  issue fecha no lote 4.

## Lote 1: a prioridade da issue (v0.4.13)

| componente      | texto atual                                  | prop                                            |
| --------------- | -------------------------------------------- | ----------------------------------------------- |
| `Button`        | `Loading` (spinner, 2 lugares)               | `loadingLabel`                                  |
| `Dialog`        | `Close dialog`                               | `closeLabel`                                    |
|                 | `Dismiss dialog`                             | `dismissLabel`                                  |
| `Pagination`    | `Pagination`                                 | `label`                                         |
|                 | `First page` / `Previous page`               | `firstLabel` / `previousLabel`                  |
|                 | `Next page` / `Last page`                    | `nextLabel` / `lastLabel`                       |
|                 | `` `Page ${n}` ``                            | `pageLabel: (page: number) => string`           |
| `Table`         | `Expand row` (cabeçalho `sr-only`)           | `expandColumnTitle`                             |
|                 | `Expand row` / `Collapse row` (botão)        | `expandRowLabel` / `collapseRowLabel`           |
|                 | `No data` (visível)                          | `emptyMessage`                                  |
| `FileUpload`    | `File upload` (input)                        | `label`                                         |
|                 | `Drag files here or click to select`         | `dropzoneMessage`                               |
|                 | `Select files` (botão)                       | `selectFilesLabel`                              |
|                 | `` `Remove ${name}` ``                       | `removeFileLabel: (fileName: string) => string` |
|                 | `` `File exceeds maximum size of ${size}` `` | `maxSizeMessage: (maxSize: string) => string`   |
| `Toast`         | `Close notification`                         | `closeLabel`                                    |
| `ToastViewport` | `Notifications`                              | `label`                                         |
|                 | (repassa ao `Toast`)                         | `toastCloseLabel`                               |
| `Sidebar`       | `Sidebar navigation`                         | `label`                                         |
|                 | `Toggle sidebar`                             | `toggleLabel`                                   |

O `maxSizeMessage` recebe o tamanho já formatado (`"2.0 MB"`), como hoje.

**Gráficos** (`label` é o `aria-label` do `<svg role="img">`, e `tableTitle` é a `<caption>` da
tabela oculta):

| gráfico       | `label`             | `tableTitle`             | colunas (`<coluna>ColumnTitle`)                         |
| ------------- | ------------------- | ------------------------ | ------------------------------------------------------- |
| `LineChart`   | `Line chart`        | `Line chart data`        | `label` (`Label`)                                       |
| `BarChart`    | (sem `aria-label`)  | `Bar chart data`         | `label` (`Label`)                                       |
| `PieChart`    | `Pie chart`         | `Pie chart data`         | `label`, `value`, `percent`                             |
| `Candlestick` | `Candlestick chart` | `Candlestick chart data` | `label`, `open`, `high`, `low`, `close`                 |
| `Correlation` | `Scatter plot`      | `Scatter plot data`      | `label`, `group`, e `otherGroupLabel` (legenda `Other`) |
| `Funnel`      | (sem `aria-label`)  | `Funnel data`            | `step`, `value`, `percent` (`% of first step`)          |

O `BarChart` e o `Funnel` não têm `aria-label` no `<svg>` hoje. Isso não muda: o lote só torna
sobrescrevíveis os textos que já existem.

## Lote 2: o resto da tabela da issue (v0.4.14)

| componente           | texto atual                           | prop                                                     |
| -------------------- | ------------------------------------- | -------------------------------------------------------- |
| `Breadcrumb`         | `Breadcrumb`                          | `label`                                                  |
| `NumberInput`        | `Decrement` / `Increment`             | `decrementLabel` / `incrementLabel`                      |
| `Rating`             | `Rating`                              | `label`                                                  |
|                      | `` `${n} star(s)` ``                  | `starLabel: (value: number) => string`                   |
| `ImageGallery`       | `Product image gallery`               | `label`                                                  |
|                      | `Previous image` / `Next image`       | `previousLabel` / `nextLabel` (galeria e zoom)           |
|                      | `` `View image ${n}: ${alt}` ``       | `thumbnailLabel: (index: number, alt: string) => string` |
|                      | `` `Zoom image: ${alt}` ``            | `zoomLabel: (alt: string) => string`                     |
|                      | `Close zoom` / `Dismiss zoomed image` | `zoomCloseLabel` / `zoomDismissLabel`                    |
| `ConversationThread` | `Conversation messages`               | `label`                                                  |
|                      | `Send message`                        | `sendLabel`                                              |
|                      | `Image` / `Audio` / `Document`        | `mediaLabel: (mediaType: MessageMediaType) => string`    |

No `ImageGallery`, o `index` do `thumbnailLabel` começa em 1, como o texto de hoje.

## Lote 3: fora da tabela da issue (v0.4.15)

| componente     | texto atual               | prop                                           |
| -------------- | ------------------------- | ---------------------------------------------- |
| `MultiSelect`  | `` `Remove ${label}` ``   | `removeLabel: (optionLabel: string) => string` |
| `TagsInput`    | `` `Remove ${tag}` ``     | `removeLabel: (tag: string) => string`         |
| `QrCode`       | `` `QR Code: ${value}` `` | `label: (value: string) => string`             |
| `KanbanBoard`  | `` `${n} cards` ``        | `cardCountLabel: (count: number) => string`    |
| `TransferList` | `Empty` (visível)         | `emptyMessage`                                 |

## Lote 4: padrões em português viram inglês (v0.5.0)

| componente       | texto atual (português) | prop             | novo padrão  |
| ---------------- | ----------------------- | ---------------- | ------------ |
| `FilterDropdown` | `Selecionar todos`      | `selectAllLabel` | `Select all` |
|                  | `Limpar`                | `clearLabel`     | `Clear`      |
|                  | `Aplicar`               | `applyLabel`     | `Apply`      |
| `MultiSelect`    | `Nenhum resultado`      | `emptyMessage`   | `No results` |

Hoje usam esses componentes: o `ecommerce-frontend` (`FilterDropdown` em pelo menos 6 telas do
painel e `MultiSelect` no `ProductForm`) e o `lead-system-frontend` (`FilterDropdown` em
`leads/page.tsx` e `MultiSelect` nos formulários de lead). Sem passar as props, eles passam a
mostrar os textos em inglês.

Os testes atuais que buscam "Selecionar todos", "Limpar", "Aplicar" e "Nenhum resultado" passam a
buscar os textos em inglês, que viram os novos padrões protegidos. Os testes das props usam os
textos em português.

## Testes e stories (em cada lote, TDD)

Como pede o `CLAUDE.md`:

- **Um teste por prop com um valor em português**, escrito antes da implementação. Para as
  funções, o teste confere que ela recebe o valor certo (`pageLabel` recebe `3` e o botão vira
  "Página 3"). Os testes que já buscam os textos atuais continuam como proteção dos padrões.
- **Uma story `CustomLabels` por componente**, com todos os textos em português, para o addon de
  a11y verificar nos dois temas. Os gráficos ganham uma story `CustomLabels` cada.
- No `ToastViewport`, um teste confere que o `toastCloseLabel` chega ao botão de cada `Toast`.

## `CLAUDE.md`

No lote 1, a seção "Accessibility labels" passa a cobrir os textos visíveis e ganha o
`<thing>Message`. A lista de componentes pendentes (`Dialog`, `Pagination` …) encolhe a cada lote
e sai no lote 4.

## Versão e changelog

- **Lotes 1 a 3**: props novas e opcionais, com o texto atual como padrão, sem ajuste nos apps.
  **Patch** em cada um (v0.4.13, v0.4.14 e v0.4.15). A entrada vai em "Adicionado", com as props
  por componente. "Ajustes necessários nos apps": nenhum. Sites em português passam as props.
- **Lote 4**: os padrões do `FilterDropdown` e do `MultiSelect` mudam de português para inglês,
  o que exige ajuste nos apps: **minor**, v0.5.0. "Adicionado" para as props e "Alterado" para os
  padrões. "Ajustes necessários nos apps": passar `selectAllLabel`, `clearLabel` e `applyLabel` em
  cada `FilterDropdown` e `emptyMessage` em cada `MultiSelect`, com os textos em português, no
  `ecommerce-frontend` e no `lead-system-frontend`. Como a série muda de 0.4 para 0.5, o
  `npm update` não instala essa versão sozinho, e o app só a recebe depois de atualizar de
  propósito.

## Fora do escopo

- Acrescentar `aria-label` onde hoje não existe (o `<svg>` do `BarChart` e do `Funnel`, os ícones
  de status do `ConversationThread`).
- Formatação de números e datas por idioma (o `formatSize` do `FileUpload` usa `KB`/`MB` com
  ponto decimal).

## Verificação

Em cada lote: `npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`,
`npm run build` + `npm run check:dist`.

## Resultado do lote 1 (implementação)

Entregue como planejado, com três textos a mais nos gráficos, achados durante a implementação
(fallbacks que a varredura inicial não pegou):

- `BarChart`: `` `Series ${n}` `` (legenda e tabela oculta), quando falta nome em `seriesNames` →
  `seriesLabel: (index: number) => string`, com o índice começando em 1.
- `Correlation`: `` `Point ${n}` ``, na tabela oculta, para um ponto sem `label` →
  `pointLabel: (index: number) => string`.
- `PieChart`: `Other`, a fatia que agrupa as menores → `otherLabel`.

O "Other" do `Correlation` também se chama `otherLabel`, e não `otherGroupLabel` como no plano,
porque é o mesmo conceito do `PieChart`. O `X`/`Y`, que o `Correlation` usa quando falta
`xLabel`/`yLabel`, ficou de fora: é igual em português, e o app já pode trocá-lo pelas props que
existem.

O `ToastViewport` não tinha props, e o tipo novo `ToastViewportProps` foi exportado. A `Table`
ganhou uma segunda story, `CustomEmptyMessage`, porque o `emptyMessage` só aparece sem dados, e o
`FileUpload` ganhou a `CustomLabelsNoDragDrop`, para o `selectFilesLabel`.
