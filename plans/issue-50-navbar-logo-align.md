# Plano: prop `logoAlign` para centralizar o logo do `Navbar` (issue #50)

## Contexto

O `Navbar` (`src/components/organisms/Navbar/Navbar.tsx`) monta a barra com 4 células `flex-1`,
sempre nesta ordem no DOM: toggle do menu, logo, busca/itens e ações. Cada breakpoint esconde uma
célula, e sobram 3 colunas visíveis:

- celular: toggle | **logo** | ações
- a partir de `md`: **logo** | busca/itens | ações

A célula do logo usa `justify-center md:justify-start`. No celular, o logo fica no centro da barra.
A partir de `md`, ele vai para a coluna da esquerda, e não há como mudar isso: o `className` vai no
`<header>` e não alcança a célula.

O `ecommerce` precisa de um header mínimo nas telas de conta, só com o logo centralizado em todas
as larguras. Hoje ele usa um `<header>` nativo como workaround.

## Mudança

Nova prop opcional:

```ts
export type NavbarLogoAlign = 'start' | 'center'

export interface NavbarProps {
  // ...props atuais
  /** Posição do logo a partir de `md`. Padrão `'start'`. No celular, o logo fica sempre no centro. */
  logoAlign?: NavbarLogoAlign
}
```

A issue pede que o centro seja o **da barra**, não o do espaço que sobra. Só centralizar o logo
dentro da célula dele não resolve: a partir de `md`, essa célula é a coluna da esquerda. Então, com
`logoAlign="center"`, o logo precisa ocupar a coluna **do meio** a partir de `md`.

### Como: trocar a ordem das duas células no JSX

Com `logoAlign="center"`, o JSX renderiza a célula de busca/itens **antes** da célula do logo:

- celular: a célula de busca/itens já é `hidden md:flex`, então as colunas visíveis continuam
  toggle | logo | ações. Nada muda.
- a partir de `md`: busca/itens | **logo** | ações. O logo fica na coluna do meio. Como as 3 células
  são `flex-1`, esse é o centro da barra.

Preferi trocar a ordem no DOM em vez de usar `md:order-*`. Com `order`, a ordem visual (itens,
logo) ficaria diferente da ordem de foco pelo teclado (logo, itens), o que fere a WCAG 2.4.3. Com
a troca no JSX, a ordem visual e a de foco batem nos dois breakpoints.

Classes por alinhamento, numa tabela `Record<NavbarLogoAlign, string>`, como pede o `CLAUDE.md`:

| célula             | `start` (atual)                   | `center`         |
| ------------------ | --------------------------------- | ---------------- |
| logo               | `justify-center md:justify-start` | `justify-center` |
| busca/itens (`md`) | `justify-center`                  | `justify-start`  |

Com `center` e itens ou busca, eles vão para a coluna da esquerda a partir de `md`, um layout comum
(navegação à esquerda, logo no centro, ações à direita). A segunda linha, usada quando há busca
**e** itens ao mesmo tempo, não muda.

Para não duplicar JSX, as duas células viram variáveis (`logoCell`, `middleCell`), renderizadas numa
ordem ou na outra conforme o `logoAlign`. O comentário sobre as 4 células é atualizado.

`NavbarLogoAlign` é exportado em `src/index.ts`, junto com os tipos atuais do `Navbar`.

## TDD

No `jsdom` não há layout, então os testes olham as classes e a ordem no DOM. Em
`Navbar.test.tsx`, escrever primeiro os testes abaixo e ver que falham:

1. `it('centers the logo at every width when logoAlign="center"')`: a célula do logo tem
   `justify-center` e **não** tem `md:justify-start`.
2. `it('places nav items before the logo in DOM order when logoAlign="center"')`: com itens, a
   lista vem antes do logo (`compareDocumentPosition`), e o foco segue a mesma ordem.
3. `it('keeps the mobile toggle before the logo when logoAlign="center"')`
4. `it('keeps the logo on the left from md by default (logoAlign="start")')`: a célula do logo tem
   `md:justify-start` e vem antes dos itens. Esse teste fixa o comportamento atual.
5. `it('has no accessibility violations with logoAlign="center"')`

Os testes atuais continuam como estão.

## Stories

Em `Navbar.stories.tsx`:

- `CenteredLogo`: só o logo com `logoAlign: 'center'`, o caso das telas de conta da issue.
- `CenteredLogoWithItems`: `logoAlign: 'center'` com itens e ações, para mostrar os itens na coluna
  da esquerda.

As duas passam pelo axe no `test:stories`.

## Versão e changelog

Versão **0.4.6** (patch): prop nova e opcional, e o padrão continua igual.

Entrada no `CHANGELOG.md`, seção **Adicionado**: prop `logoAlign` (`'start'` padrão |
`'center'`) no `Navbar`. Com `'center'`, o logo fica no centro da barra em todas as larguras, e os
itens ou a busca vão para a coluna da esquerda a partir de `md`. O tipo `NavbarLogoAlign` passa a
ser exportado. Na seção "Ajustes necessários nos apps": nenhum é obrigatório. O `ecommerce` pode
trocar o `<header>` nativo das telas de conta por `<Navbar logo={…} logoAlign="center" />`.

Primeiro um commit só com o plano. Depois do OK, um commit com o código, o bump para `0.4.6` e o
CHANGELOG, a tag `v0.4.6` e o push.

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`. Conferir também no Storybook, nas larguras de celular e desktop, que o logo fica
de fato no centro da barra.
