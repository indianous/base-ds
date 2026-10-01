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

## Lote 4: padrões em português viram inglês e textos do `@dnd-kit` (v0.5.0)

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

### `KanbanBoard`: os textos do `@dnd-kit` (acrescentado depois do lote 3)

O `@dnd-kit` lê três tipos de texto em inglês, que o app não consegue trocar hoje:

| texto atual (`@dnd-kit`)                                       | prop nova                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------- |
| instruções de teclado ("To pick up a draggable item, press …") | `dragInstructions`                                         |
| `aria-roledescription="sortable"` em cada card                 | `cardRoleDescription`                                      |
| "Picked up draggable item lead-1."                             | `dragStartAnnouncement: (card, column) => string`          |
| "Draggable item lead-1 was moved over droppable area …"        | `dragOverAnnouncement: (card, column, position) => string` |
| "Draggable item lead-1 was dropped over droppable area …"      | `dragEndAnnouncement: (card, column, position) => string`  |
| "Dragging was cancelled. Draggable item lead-1 was dropped."   | `dragCancelAnnouncement: (card, column) => string`         |

- **As instruções e o `cardRoleDescription` mantêm o texto atual como padrão.** Eles vão para o
  `accessibility.screenReaderInstructions` do `DndContext` e para o `attributes.roleDescription`
  do `useSortable`.
- **Os anúncios recebem o card (`TCard`) e o título da coluna**, em vez do `id` que o `@dnd-kit`
  anuncia hoje. Assim o app pode montar o texto com o que fizer sentido, por exemplo
  `` (card, column) => `${card.name} pego em ${column}` ``. O `position` começa em 1 e é a
  posição do card na coluna de destino. No cancelamento, a coluna é a de origem, para onde o card
  volta.
- **Os padrões em inglês dos anúncios mudam**: passam a usar o `getCardAriaLabel(card)` e o título
  da coluna, por exemplo "Picked up Card lead-1 in Novo." / "Card lead-1 was dropped in Contatado,
  position 1.". O texto de hoje, com o `id`, não serve para quem ouve. Como é uma mudança de
  padrão, ela vai neste lote, que já é _minor_.
- **Sem destino**: o `@dnd-kit` tem anúncios para quando o card sai de todas as colunas e para
  quando é solto fora delas. Neste componente, isso não acontece: a detecção de colisão
  (`closestCorners`) sempre devolve a coluna mais próxima. Por isso não há prop para esses casos.
  O código só se protege: não anuncia nada ao mover sem destino e usa o `dragCancelAnnouncement`
  ao soltar sem destino.
- Os anúncios vão para o `accessibility.announcements` do `DndContext`, que já tem uma região
  `aria-live` própria.

Testes: cada prop com um valor em português. Os anúncios são verificados pela região `aria-live`
do `@dnd-kit` depois de pegar, mover e soltar um card pelo teclado (espaço e setas), já que o
`KeyboardSensor` está ligado. A story `CustomLabels` do `KanbanBoard` ganha os textos novos.

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
- **Lote 4**: os padrões do `FilterDropdown` e do `MultiSelect` mudam de português para inglês, e
  os anúncios de arrastar e soltar do `KanbanBoard` passam a usar o nome do card e da coluna. Isso
  exige ajuste nos apps: **minor**, v0.5.0. "Adicionado" para as props e "Alterado" para os
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

## Resultado do lote 2 (implementação)

Entregue como planejado, sem textos a mais. No `ConversationThread`, o mapa interno dos nomes de
mídia virou o padrão do `mediaLabel`. No `NumberInput`, as props novas ficam antes do
`...ariaProps` na desestruturação.

## Resultado do lote 3 (implementação)

Entregue como planejado. No `TransferList`, a story `FullyLocalized` começa com um item escolhido e
nenhuma coluna vazia, então a nova `CustomLabels` parte dela com `value: []`, para o
`emptyMessage` aparecer.

**Achado fora do plano**: o `KanbanBoard` também tem textos em inglês que vêm do `@dnd-kit`. São
as instruções de teclado ("To pick up a draggable item, press the space bar…"), os anúncios de
arrastar e soltar ("Picked up draggable item lead-1.", que usam o `id` do card, e não um nome
legível) e o `aria-roledescription` de cada card. Eles ficaram fora deste lote porque
pedem decisões de desenho, como anunciar o card pelo `getCardAriaLabel` e a coluna pelo título.

## Resultado do lote 4 (implementação)

- **`FilterDropdown` e `MultiSelect`**: como planejado. Os testes que buscavam "Selecionar todos",
  "Limpar", "Aplicar" e "Nenhum resultado" passaram a buscar os padrões em inglês e falharam antes
  da mudança. A story `CustomLabels` do `FilterDropdown` abre o painel no `play`, para o addon de
  a11y verificar os botões.
- **O `aria-roledescription` dos cards é "sortable", não "draggable"**: o `useSortable` troca o
  padrão do `@dnd-kit`. O plano dizia "draggable" e foi corrigido. O padrão da prop
  `cardRoleDescription` continua o texto de hoje, "sortable".
- **Sem `dragOutAnnouncement`**: a detecção de colisão `closestCorners` sempre devolve uma coluna,
  então o card nunca fica sem destino. A prop seria código morto e não teria como ser testada.
- **Testes dos anúncios**: no jsdom, cada tecla precisa de um `act` próprio, porque o sensor de
  teclado ativa no ciclo seguinte. Pegar e passar sobre a própria coluna acontecem no mesmo ciclo,
  e a região `aria-live` só mostra o segundo anúncio, então os testes usam funções espiãs para
  conferir os argumentos. Mover para outra coluna precisa de layout real e ficou numa story com
  `play` (`KeyboardMoveAnnouncement`), a primeira do projeto.
- **Correção no `onCardMove`**: o teste da story mostrou que soltar um card numa coluna vazia
  chamava o `onCardMove` com índice 1, e não 0. Durante o arraste, o componente já move o card
  para a coluna de destino e, ao soltar, contava o próprio card. O mesmo erro aparecia na posição
  anunciada. Agora o índice ignora o próprio card, no `onCardMove` e nos anúncios. Para os apps, o
  efeito prático é nenhum ou quase nenhum: inserir no índice 1 de uma lista vazia já colocava o card
  no fim.
- **O teclado do `@dnd-kit`**: a primeira seta a partir de um card pode parar na borda da própria
  coluna, antes de chegar à vizinha. É o comportamento de antes, e o teste da story aperta a seta
  até chegar.
