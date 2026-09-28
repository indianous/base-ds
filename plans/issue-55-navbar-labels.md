# Plano: rótulos de acessibilidade customizáveis no `Navbar` (issue #55)

## Contexto

O `Navbar` (`src/components/organisms/Navbar/Navbar.tsx`) tem os textos de acessibilidade fixos em
inglês:

- `<nav>`: `aria-label="Main navigation"`
- botão do menu (celular): `aria-label="Open navigation menu"`
- botão de ações (celular): `aria-label="More actions"`
- `Drawer`s: `title="Menu"` e `title="Actions"`

O `portfolio` é um site em pt-BR, e o leitor de tela anuncia esses textos em inglês (WCAG 3.1.2). É
o mesmo pedido já atendido no `SearchField` (#31), no `PasswordInput` (#47), no `PinInput` (#48) e
no `Carousel` (#49).

### O `Drawer` também tem textos fixos

Os dois drawers do `Navbar` usam o `Drawer`
(`src/components/organisms/Drawer/Drawer.tsx`), que tem mais dois textos em inglês, fora do alcance
do app:

- botão de fechar: `aria-label="Close drawer"`
- fundo clicável: `aria-label="Dismiss drawer"`

Sem mexer no `Drawer`, o menu do celular continuaria anunciando "Close drawer" mesmo com todos os
rótulos do `Navbar` em português. Por isso eles entram nesta issue, embora a issue não os cite.

## Formato: props soltas, não um objeto `labels`

A issue sugere `labels={{ ... }}`, "no mesmo formato adotado nas issues anteriores". Mas as issues
anteriores adotaram **props soltas**, uma por texto (`label`, `previousLabel`, `nextLabel`,
`dotLabel` no `Carousel`; `showLabel`/`hideLabel` no `PasswordInput`; `groupLabel`/`digitLabel` no
`PinInput`; `label`/`buttonLabel` no `SearchField`). Sigo o padrão do repositório.

## Mudança

### `Drawer`

```ts
export interface DrawerProps {
  // ...props atuais
  /** `aria-label` do botão de fechar. Padrão `'Close drawer'`. */
  closeLabel?: string
  /** `aria-label` do fundo clicável que fecha o drawer. Padrão `'Dismiss drawer'`. */
  dismissLabel?: string
}
```

### `Navbar`

```ts
export interface NavbarProps {
  // ...props atuais
  /** `aria-label` do `<nav>`. Padrão `'Main navigation'`. */
  label?: string
  /** `aria-label` do botão que abre o menu no celular. Padrão `'Open navigation menu'`. */
  menuButtonLabel?: string
  /** `aria-label` do botão que abre as ações no celular. Padrão `'More actions'`. */
  actionsButtonLabel?: string
  /** Título do drawer do menu. Padrão `'Menu'`. */
  menuTitle?: string
  /** Título do drawer de ações. Padrão `'Actions'`. */
  actionsTitle?: string
  /** `closeLabel` dos dois drawers. Padrão `'Close drawer'`. */
  drawerCloseLabel?: string
  /** `dismissLabel` dos dois drawers. Padrão `'Dismiss drawer'`. */
  drawerDismissLabel?: string
}
```

Os nomes do pedido da issue mudam assim: `navigation` → `label`, `openMenu` → `menuButtonLabel`,
`moreActions` → `actionsButtonLabel`, `menuTitle` e `actionsTitle` iguais.

`NavbarProps` e `DrawerProps` já são exportados em `src/index.ts`; não há tipo novo.

## TDD

Escrever primeiro os testes abaixo e ver que falham.

`Drawer.test.tsx`:

1. `it('uses closeLabel on the close button')`
2. `it('uses dismissLabel on the backdrop button')`: clicar no botão com o rótulo novo chama
   `onClose`.

`Navbar.test.tsx`:

3. `it('uses label as the navigation aria-label')`
4. `it('uses menuButtonLabel and menuTitle for the mobile menu')`: o botão
   `'Abrir menu de navegação'` abre o drawer, e o `dialog` tem o nome `'Menu principal'`.
5. `it('uses actionsButtonLabel and actionsTitle for the actions drawer')`
6. `it('passes drawerCloseLabel and drawerDismissLabel to both drawers')`: com o menu aberto, o botão
   `'Fechar'` fecha o drawer; o mesmo com o drawer de ações e o fundo `'Fechar painel'`.

Os testes atuais, com os textos em inglês, continuam como estão e garantem os padrões.

## Stories

- `Navbar.stories.tsx`: story `CustomLabels`, com viewport de celular, itens e mais de uma ação, e
  todos os rótulos em português, como no exemplo da issue.
- `Drawer.stories.tsx`: story `CustomLabels` com `closeLabel` e `dismissLabel` em português.

As duas passam pelo axe no `test:stories`.

## Versão e changelog

Versão **0.4.8** (patch): props novas e opcionais, sem mudança de comportamento.

O `CHANGELOG.md` já tem a seção `[Não publicado]` da #44 (README). Ela vira a seção
`[0.4.8] - <data>`, com as entradas desta issue:

- **Adicionado**: no `Navbar`, as props `label`, `menuButtonLabel`, `actionsButtonLabel`,
  `menuTitle`, `actionsTitle`, `drawerCloseLabel` e `drawerDismissLabel`; no `Drawer`, `closeLabel`
  e `dismissLabel`. Todos com os textos atuais em inglês como padrão (#55).
- **Ajustes necessários nos apps**: a migração do alias (#44), que já está lá, e para esta issue
  nada obrigatório. Os apps podem passar os rótulos em português.

Publicar a 0.4.8 também serve para a confirmação final da #44: o Dependabot do `ecommerce-frontend`
deve abrir o PR para ela.

Primeiro um commit só com o plano. Depois do OK, um commit com o código, o bump para `0.4.8` e o
CHANGELOG, a tag `v0.4.8` e o push.

## Fora do escopo

Outros componentes têm textos de acessibilidade fixos em inglês e sem prop: `Dialog` (`Close
dialog`, `Dismiss dialog`), `Pagination`, `Breadcrumb`, `NumberInput`, `Rating`, `FileUpload`,
`ImageGallery` e o `Loading` do `Button`. Sugiro uma issue única para revisar todos, em vez de
esperar um pedido por componente.

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`.
