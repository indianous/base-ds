# Changelog

Todas as mudanças relevantes do base-ds são registradas aqui. O formato segue o
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[Versionamento Semântico](https://semver.org/lang/pt-BR/). Enquanto a versão for `0.x`, uma
mudança que exige ajuste nos apps sobe o _minor_ (`0.1.0 → 0.2.0`); correções e componentes
novos sem impacto sobem o _patch_.

## [0.4.14] - 2026-10-01

### Adicionado

Props para os textos que os componentes mostravam ou liam em inglês, sem como trocar (lote 2 da
[#58](https://github.com/indianous/base-ds/issues/58)). Os padrões são os textos de antes.

- `Breadcrumb`: `label` (o `<nav>`).
- `NumberInput`: `decrementLabel` e `incrementLabel`.
- `Rating`: `label` (o grupo) e `starLabel: (value) => string`.
- `ImageGallery`: `label` (o grupo), `previousLabel` e `nextLabel` (na galeria e no zoom),
  `thumbnailLabel: (index, alt) => string`, `zoomLabel: (alt) => string`, `zoomCloseLabel` e
  `zoomDismissLabel`.
- `ConversationThread`: `label` (a lista de mensagens), `sendLabel` e
  `mediaLabel: (mediaType) => string` (o nome da mídia anexada).

### Ajustes necessários nos apps

- Nenhum. Sites em português podem passar as props novas.

## [0.4.13] - 2026-09-30

### Adicionado

Props para os textos que os componentes mostravam ou liam em inglês, sem como trocar (lote 1 da
[#58](https://github.com/indianous/base-ds/issues/58)). Os padrões são os textos de antes.

- `Button`: `loadingLabel` (o spinner do `isLoading`).
- `Dialog`: `closeLabel` e `dismissLabel` (o botão de fechar e o fundo clicável).
- `Pagination`: `label` (o `<nav>`), `firstLabel`, `previousLabel`, `nextLabel`, `lastLabel` e
  `pageLabel: (page) => string`.
- `Table`: `expandColumnTitle` (o cabeçalho oculto da coluna de expandir), `expandRowLabel`,
  `collapseRowLabel` e `emptyMessage` (o "No data").
- `FileUpload`: `label` (o input), `dropzoneMessage`, `selectFilesLabel`,
  `removeFileLabel: (fileName) => string` e `maxSizeMessage: (maxSize) => string`.
- `Toast`: `closeLabel`. `ToastViewport`: `label` (a região de notificações) e `toastCloseLabel`
  (repassado a cada `Toast`). O tipo `ToastViewportProps` é exportado.
- `Sidebar`: `label` (o `<nav>`) e `toggleLabel` (o botão de recolher).
- Gráficos:
  - `label`, o nome do gráfico: no `LineChart`, no `PieChart`, no `Candlestick` e no
    `Correlation`;
  - `tableTitle`, o título da tabela oculta lida por leitores de tela: nos seis gráficos;
  - um `<coluna>ColumnTitle` para cada cabeçalho dessa tabela;
  - `otherLabel`: no `PieChart` e no `Correlation`;
  - `seriesLabel: (index) => string`: no `BarChart`;
  - `pointLabel: (index) => string`: no `Correlation`.

### Ajustes necessários nos apps

- Nenhum. Sites em português podem passar as props novas.

## [0.4.12] - 2026-09-30

### Adicionado

- `Image`: props `loading`, `priority`, `sizes`, `width`, `height` e `imageComponent`
  ([#56](https://github.com/indianous/base-ds/issues/56)). O `priority` vira `loading="eager"` e
  `fetchPriority="high"`. O `imageComponent` troca o `<img>` pelo componente de imagem do app,
  como um wrapper do `next/image` com `fill`, e recebe só atributos padrão de `<img>`. O tipo
  `ImageComponent` é exportado.
- `ImageGallery`: props `imageComponent` (repassada à imagem principal e às miniaturas),
  `priority` (padrão `true`, para a imagem principal) e `sizes` (para a imagem principal). As
  miniaturas usam `sizes="64px"`.

### Alterado

- `Image`: carrega em modo lazy (`loading="lazy"`) e com `decoding="async"` por padrão. Antes,
  toda imagem carregava na hora.

### Corrigido

- README: o exemplo do `linkComponent` (v0.4.9) passava o `Link` do `next/link` direto num
  Server Component, o que falha no build do Next.js (`Functions cannot be passed directly to Client
Components`). O exemplo agora reexporta o `Link` de um arquivo `'use client'` (`AppLink`).

### Ajustes necessários nos apps

- Nada obrigatório.
- Recomendado: marcar a imagem principal de cada página com `priority` (`<Image priority />`), já
  que, sem isso, ela passa a carregar em modo lazy. No `ImageGallery`, a imagem principal já tem
  `priority` por padrão.
- Quem passa `linkComponent={Link}` num Server Component: usar o `AppLink` do README.

## [0.4.11] - 2026-09-30

### Alterado

- Importar um componente leva ao cliente só ele e o que ele usa
  ([#53](https://github.com/indianous/base-ds/issues/53)). Numa página Next.js 16 com `Heading`,
  `Text`, `Button` e `Container`, o base-ds passou de +951 KB (+252 KB gzip) para +34 KB (+11 KB
  gzip). Com o `Navbar`, de +951 KB para +45 KB. Os imports não mudam.
  - O build ESM é dividido por componente. O `dist/index.js` só reexporta e não tem mais
    `'use client'`, e cada arquivo de componente tem o seu. Assim o Next.js leva ao cliente só os
    componentes que a página usa. O CJS continua num arquivo só.
  - O `package.json` declara `"sideEffects": ["**/*.css"]`.
  - Os componentes importam só os ícones que usam, e não trazem mais todos os ícones do
    `lucide-react` (~650 KB). O `Icon`, que busca por nome, continua igual e ainda traz todos os
    ícones. O README recomenda importar do `lucide-react` direto no app.

### Ajustes necessários nos apps

- Conferir que o `@source` (Tailwind v4) ou o `content` (v3) aponta para a **pasta**
  `node_modules/@indianous/base-ds/dist`, e não para o arquivo `dist/index.js`. As classes dos
  componentes agora estão espalhadas por vários arquivos. Veja "Estilos" no README.

## [0.4.10] - 2026-09-30

### Adicionado

- Tema escuro ([#52](https://github.com/indianous/base-ds/issues/52)): com a classe `dark` no
  `<html>` (ou num trecho da página), os tokens semânticos de cor trocam para a paleta escura.
  Nos status, o tom principal fica mais claro (400), com texto escuro por cima. Os primitivos,
  os gráficos, o `overlay` e os tokens que não são de cor não mudam. O `theme.css` também define o
  `color-scheme` de cada tema, para os controles nativos e as barras de rolagem acompanharem.
- `theme-v4.css`: `@custom-variant dark`, que liga o `dark:` do Tailwind v4 à classe `.dark`.
- `colors.json`: chave `semantic-dark` com os valores do tema escuro.
- O teste de contraste cobre os dois temas e ganha dois pares: os status usados como texto sobre o
  fundo (`text-primary` …) e o texto dos botões sobre o hover.
- Storybook: botão para alternar o tema na barra de ferramentas. O `test:stories` roda o a11y de
  todas as stories nos dois temas.

### Ajustes necessários nos apps

- Nenhum. O tema claro continua o padrão. Para o escuro, veja "Tema escuro" no README.

## [0.4.9] - 2026-09-30

### Adicionado

- `Navbar`, `Footer` e `DropdownMenu`: prop `linkComponent`, que troca o `<a>` dos links pelo
  componente de link do app, como o `Link` do Next.js, para navegar sem recarregar a página
  ([#54](https://github.com/indianous/base-ds/issues/54)). O `Navbar` a repassa aos menus dropdown.
  O padrão continua sendo `<a>`. O tipo `LinkComponent` é exportado.

### Corrigido

- `Navbar`: o drawer do celular fecha quando um item é clicado. Antes, ele só "fechava" porque a
  página recarregava, e continuaria aberto com uma navegação no cliente ou com um item que chama
  `onClick`.

### Alterado

- README: o exemplo do Dependabot ganhou um bloco `cooldown` opcional, que tira o base-ds da
  carência padrão de 3 dias do Dependabot
  ([#44](https://github.com/indianous/base-ds/issues/44)). Sem ele, a PR de uma versão nova chega
  uns 3 dias depois da publicação.

## [0.4.8] - 2026-09-28

### Adicionado

- `Navbar`: props para os textos de acessibilidade, que eram fixos em inglês
  ([#55](https://github.com/indianous/base-ds/issues/55)): `label` (o `<nav>`), `menuButtonLabel` e
  `actionsButtonLabel` (os botões do celular), `menuTitle` e `actionsTitle` (os títulos dos
  drawers), `drawerCloseLabel` e `drawerDismissLabel` (repassados aos dois drawers). Os padrões são
  os textos de antes.
- `Drawer`: props `closeLabel` e `dismissLabel` para o botão de fechar e o fundo clicável, com os
  padrões `'Close drawer'` e `'Dismiss drawer'`.

### Alterado

- README: a instalação recomendada passa a ser pelo nome com escopo
  (`"@indianous/base-ds": "^<versão>"`), no lugar do alias `"base-ds": "npm:@indianous/base-ds@…"`
  adotado na v0.3.0. O Dependabot não resolve o alias e nunca propõe atualizações; com o nome com
  escopo, ele funciona ([#44](https://github.com/indianous/base-ds/issues/44)). O README também
  ganhou a configuração do Dependabot, na seção "Atualizando".

### Ajustes necessários nos apps

- Apps que usam o alias devem migrar, conforme "Migrando do alias `base-ds`" no README: trocar a
  dependência para `@indianous/base-ds`, os imports (`from 'base-ds'` → `from '@indianous/base-ds'`,
  `base-ds/styles` → `@indianous/base-ds/styles`) e os caminhos `node_modules/base-ds` na
  configuração do Tailwind (`content` no v3, `@source` no v4). O alias continua funcionando para o
  npm; sem migrar, só o Dependabot fica sem efeito.
- `Navbar` e `Drawer`: nada obrigatório. Sites em português podem passar os rótulos novos; testes
  que buscam os textos em inglês continuam valendo enquanto eles não forem passados.

## [0.4.7] - 2026-09-26

### Corrigido

- `FormField`: com `hint` e `error` ao mesmo tempo, o `aria-describedby` do controle apontava
  também para a dica, que não é renderizada nesse caso. Agora aponta só para o erro
  ([#51](https://github.com/indianous/base-ds/issues/51)).

### Ajustes necessários nos apps

- Nenhum. Só muda algo para um teste de app que esperava `"<id>-hint <id>-error"` no
  `aria-describedby`.

## [0.4.6] - 2026-09-26

### Adicionado

- `Navbar`: prop `logoAlign` (`'start'`, o padrão, ou `'center'`) para a posição do logo a partir de
  `md` ([#50](https://github.com/indianous/base-ds/issues/50)). Com `'center'`, o logo fica no
  centro da barra em todas as larguras. Se houver itens ou busca, eles vão para a coluna da esquerda
  a partir de `md`, e as ações continuam à direita. O tipo `NavbarLogoAlign` passa a ser exportado.

### Ajustes necessários nos apps

- Nenhum é obrigatório. Nas telas de conta, o `<header>` nativo usado como workaround pode voltar a
  ser `<Navbar logo={…} logoAlign="center" />`.

## [0.4.5] - 2026-09-26

### Adicionado

- `Carousel`: props para os rótulos de acessibilidade, com os textos atuais em inglês como padrão
  ([#49](https://github.com/indianous/base-ds/issues/49)): `label` (região), `slideLabel(n, total)`
  e `slideRoleDescription` (cada slide), `previousLabel` e `nextLabel` (setas) e `dotLabel(n)`
  (pontos). O tipo `CarouselProps` passa a ser exportado.

### Ajustes necessários nos apps

- Nenhum é obrigatório. Os apps podem passar os rótulos em português e trocar nos testes as buscas
  por `/next slide/i` e `/go to slide/i`. Passe também `slideRoleDescription` (por exemplo,
  `"página"`): o leitor de tela lê esse texto literalmente junto com o rótulo de cada slide.

## [0.4.4] - 2026-09-26

### Adicionado

- `PinInput`: props para uso em apps localizados e em formulários
  ([#48](https://github.com/indianous/base-ds/issues/48)).
  - `groupLabel` e `digitLabel(n)` definem o `aria-label` do grupo e de cada campo (padrões
    `'PIN input'` e `` n => `PIN digit ${n}` ``).
  - `autoComplete`, aplicado só no primeiro campo. Com `autoComplete="one-time-code"`, o sistema e
    os gerenciadores de senha oferecem o preenchimento automático do código.
  - `id`, aplicado só no primeiro campo, e `aria-describedby`/`aria-invalid`, repassados a todos os
    campos. Dentro de um `FormField`, clicar no rótulo foca o primeiro dígito, e o erro fica
    associado aos campos.

### Corrigido

- `PinInput`: um código inteiro preenchido de uma vez no primeiro campo (preenchimento automático)
  passa a ser distribuído entre os campos, em vez de ficar só o último dígito.

### Ajustes necessários nos apps

- Nenhum é obrigatório. Os apps podem passar os rótulos em português e
  `autoComplete="one-time-code"`. Dentro de um `FormField`, passe como `groupLabel` o mesmo texto do
  rótulo: o nome de cada campo vem do `digitLabel`, que tem prioridade sobre o `<label>`.

## [0.4.3] - 2026-09-26

### Adicionado

- `PasswordInput`: props `showLabel` e `hideLabel` para o `aria-label` do botão de mostrar/ocultar a
  senha, com os padrões `'Show password'` e `'Hide password'`
  ([#47](https://github.com/indianous/base-ds/issues/47)). O tipo `PasswordInputProps` passa a ser
  exportado.

### Ajustes necessários nos apps

- Nenhum é obrigatório. Os apps podem passar os rótulos em português
  (`showLabel="Mostrar senha" hideLabel="Ocultar senha"`) e trocar nos testes a busca por
  `/show password/i`.

## [0.4.2] - 2026-09-23

### Adicionado

- `Alert`: aviso fixo que faz parte do layout, como uma faixa no topo da página
  (`layout="full"`) ou um bloco dentro do conteúdo (`layout="inline"`, o padrão)
  ([#45](https://github.com/indianous/base-ds/issues/45)).
  - Variantes `info` (padrão), `success`, `warning`, `danger` e `neutral`.
  - `title`, descrição em `children` e `actions` (uma ou mais `Button`, inclusive
    `Button as="a"`). As ações ficam abaixo do texto no celular e à direita a partir de `sm`.
  - Ícone padrão por variante, trocado com `icon` ou removido com `icon={null}`.
  - Botão de fechar quando há `onDismiss`, com o `aria-label` definido por `dismissLabel` (padrão
    `'Dismiss'`).
  - `role="status"` em `info`, `success` e `neutral` e `role="alert"` em `warning` e `danger`.
    Passar `role` e `aria-label` substitui o padrão, por exemplo
    `role="region" aria-label="…"`.

## [0.4.1] - 2026-09-23

### Alterado

- `Badge` não quebra mais linha dentro da pílula: a classe base inclui `whitespace-nowrap`
  ([#46](https://github.com/indianous/base-ds/issues/46)). Para voltar ao comportamento anterior,
  passe `className="whitespace-normal"`. Nos chips do `MultiSelect` e do `TagsInput`, um texto
  muito longo também deixa de quebrar e pode passar da largura do campo.

### Ajustes necessários nos apps

- Nenhum é obrigatório. O `className="whitespace-nowrap"` usado como workaround nos `Badge` pode
  ser removido.

## [0.4.0] - 2026-09-23

Todas as stories passam na checagem de acessibilidade do Storybook (axe), agora obrigatória na
publicação ([#41](https://github.com/indianous/base-ds/issues/41)).

### Alterado

- Tokens de cor ajustados para contraste WCAG AA (4.5:1) em texto:

  | Token                      | Antes                 | Depois                |
  | -------------------------- | --------------------- | --------------------- |
  | `--color-muted-foreground` | neutral-500 `#6b7280` | neutral-600 `#4b5563` |
  | `--color-success`          | green-600 `#16a34a`   | green-700 `#15803d`   |
  | `--color-success-hover`    | green-700 `#15803d`   | green-800 `#166534`   |
  | `--color-warning`          | amber-600 `#d97706`   | amber-700 `#b45309`   |
  | `--color-warning-hover`    | amber-700 `#b45309`   | amber-800 `#92400e`   |
  | `--color-info`             | sky-600 `#0284c7`     | sky-700 `#0369a1`     |
  | `--color-info-hover`       | sky-700 `#0369a1`     | sky-800 `#075985`     |

- `TransferList`: coluna vazia é anunciada como `group` (antes, `listbox` sem opções); com
  `disabled`, listas e opções recebem `aria-disabled`.
- `MultiSelect`: com `disabled`, a área dos valores selecionados recebe `aria-disabled`.
- `ConversationThread`: a área de mensagens recebe foco pelo teclado para rolagem; o indicador de
  anexo deixa de ter opacidade reduzida.

### Corrigido

- `NumberInput`, `TagsInput` e `MultiSelect` repassam `aria-label`, `aria-labelledby`,
  `aria-describedby` e `aria-invalid` ao input. Antes, dentro de um `FormField`, a dica e a
  mensagem de erro não eram anunciadas por leitores de tela.

### Ajustes necessários nos apps

- Conferir visualmente as telas: todo texto secundário (`text-muted-foreground`) fica mais
  escuro, e badges/fundos de `success`, `warning` e `info` ficam um tom mais escuros.
- `NumberInput`, `TagsInput` e `MultiSelect` usados sem `FormField` e sem label visível devem
  receber `aria-label`.
- Atualizar com `npm install base-ds@npm:@indianous/base-ds@^0.4.0` (o `^0.3.0` não traz esta
  versão sozinho).

## [0.3.0] - 2026-09-23

### Alterado

- O pacote passa a se chamar `@indianous/base-ds` e é publicado no GitHub Packages
  (`https://npm.pkg.github.com`) a cada tag `v*`, pelo workflow `.github/workflows/publish.yml`
  ([#40](https://github.com/indianous/base-ds/issues/40)). Esta é a primeira versão publicada no
  registry.
- `npm run pack:local` passa a gerar `.pack/indianous-base-ds-<versão>.tgz` e fica para testar
  mudanças ainda não publicadas.

### Ajustes necessários nos apps

- Criar um token clássico do GitHub com `read:packages` e exportá-lo como
  `GITHUB_PACKAGES_TOKEN`.
- Adicionar ao `.npmrc` do app:
  `@indianous:registry=https://npm.pkg.github.com` e
  `//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}`.
- Trocar a dependência do tarball pelo alias:
  `npm install base-ds@npm:@indianous/base-ds@^0.3.0`. Os imports (`from 'base-ds'`,
  `'base-ds/styles'`) não mudam.
- Atualizar no `CLAUDE.md` do app o trecho do base-ds (novo texto no README).

## [0.2.1] - 2026-09-23

### Adicionado

- Componente de layout `Container`: centraliza o conteúdo com largura máxima (`width`), gutter
  horizontal e padding vertical (`spacing`), renderizando `<div>` por padrão, sem landmark
  ([#39](https://github.com/indianous/base-ds/issues/39)).

### Ajustes necessários nos apps

- Nenhum obrigatório. Opcional: trocar os wrappers de página feitos à mão (e o `PageContainer`
  local do ecommerce) pelo `Container`, removendo `<main>` aninhados no `<main>` do shell.

## [0.2.0] - 2026-09-23

### Alterado

- `react` e `react-dom` passam a ser só `peerDependencies` (antes também estavam em
  `dependencies`), evitando uma segunda instância de React nos apps
  ([#38](https://github.com/indianous/base-ds/issues/38)).

### Adicionado

- Script `npm run pack:local`, que gera `.pack/base-ds-<versão>.tgz` para instalação nos apps.
- `README.md` com instalação, estilos, atualização e regras de uso, e este `CHANGELOG.md`.

### Ajustes necessários nos apps

- Trocar a dependência `"base-ds": "file:../base-ds"` (symlink) por
  `"base-ds": "file:../base-ds/.pack/base-ds-0.2.0.tgz"`, depois de rodar
  `npm run pack:local` no base-ds, e rodar `npm install`.
- Remover o paliativo de symlink manual em `base-ds/node_modules/{react,react-dom}`, se existir.
- Opcional: copiar para o `CLAUDE.md` do app o trecho indicado no README.

## [0.1.0]

- Versão inicial: todos os componentes, tokens e o suporte a Tailwind v4 entregues até a
  [#37](https://github.com/indianous/base-ds/issues/37).

[0.4.7]: https://github.com/indianous/base-ds/compare/v0.4.6...v0.4.7
[0.4.6]: https://github.com/indianous/base-ds/compare/v0.4.5...v0.4.6
[0.4.5]: https://github.com/indianous/base-ds/compare/v0.4.4...v0.4.5
[0.4.4]: https://github.com/indianous/base-ds/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/indianous/base-ds/compare/v0.4.2...v0.4.3
[0.4.2]: https://github.com/indianous/base-ds/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/indianous/base-ds/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/indianous/base-ds/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/indianous/base-ds/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/indianous/base-ds/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/indianous/base-ds/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/indianous/base-ds/releases/tag/v0.1.0
