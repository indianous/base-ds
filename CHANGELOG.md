# Changelog

Todas as mudanças relevantes do base-ds são registradas aqui. O formato segue o
[Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e o projeto usa
[Versionamento Semântico](https://semver.org/lang/pt-BR/). Enquanto a versão for `0.x`, uma
mudança que exige ajuste nos apps sobe o _minor_ (`0.1.0 → 0.2.0`); correções e componentes
novos sem impacto sobem o _patch_.

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

[0.4.2]: https://github.com/indianous/base-ds/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/indianous/base-ds/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/indianous/base-ds/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/indianous/base-ds/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/indianous/base-ds/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/indianous/base-ds/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/indianous/base-ds/releases/tag/v0.1.0
