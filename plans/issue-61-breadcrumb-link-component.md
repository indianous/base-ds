# Plano: `linkComponent` no `Breadcrumb` (issue #61)

## Contexto

O `portfolio` usa o `Breadcrumb` nas páginas de estudo de caso (`Projetos › Nome do projeto`). Os
itens com `href` são um `<a>` puro, então clicar em "Projetos" recarrega a página inteira, enquanto
o resto do site navega pelo roteador do Next.js. O `Navbar`, o `Footer` e o `DropdownMenu` já
aceitam `linkComponent` desde a v0.4.9 (#54). A issue pede a mesma prop no `Breadcrumb`, sem
quebra para quem usa `href` hoje.

Ficou de fora da #54 por escopo ("se o `Breadcrumb` precisar, é outra issue").

## Mudanças

### 1. `linkComponent`

Igual aos outros componentes de navegação:

```ts
/** Component rendered in place of `<a>` for items with `href` (e.g. Next.js `Link`). */
linkComponent?: LinkComponent
```

- padrão `'a'`, então nada muda para quem não passa a prop;
- vale só para os itens com `href` que não são o último. O último continua um `<span>` com
  `aria-current="page"`, e os itens com `onClick` continuam `<button>`;
- o componente recebe `href`, `className` e `children`, como no `Footer`.

Num Server Component, o `linkComponent` precisa vir de um arquivo `'use client'` (o `AppLink` do
README), como já documentado na v0.4.12. O exemplo da issue já usa o `AppLink`.

### 2. Anel de foco (correção junto)

O `<button>` dos itens sem `href` tem `focus:outline-none` e nenhum anel de foco no lugar: quem
navega pelo teclado não vê onde está (WCAG 2.4.7). O `<a>` não tem estilo de foco nenhum, então
fica com o contorno padrão do navegador, diferente dos outros componentes. Os dois passam a usar o
mesmo foco do `Footer`: `focus:outline-none focus:ring-2 focus:ring-ring`, com `rounded-sm` para o
anel acompanhar o texto.

### 3. Tipos exportados (correção junto)

O `src/index.ts` exporta o `Breadcrumb`, mas não o `BreadcrumbProps` nem o `BreadcrumbItem`, ao
contrário do que o `CLAUDE.md` pede ("every new component (plus its prop types) must be
re-exported"). Os dois passam a ser exportados, e as interfaces passam a ser `export interface`.

## Testes (TDD, escritos antes)

- com um `linkComponent` de teste (o mesmo `TestLink` da #54, que renderiza
  `<a data-custom-link>`), os itens com `href` usam esse componente, com o `href` e as classes;
- o último item continua `<span aria-current="page">`, e um item com `onClick` continua
  `<button>`;
- os links e os botões têm as classes do anel de foco;
- `jest-axe` sem violações com `linkComponent`;
- os testes que já existem (o `<a>` padrão) continuam valendo.

Story `CustomLinkComponent`, com um componente de link de exemplo, como no `Navbar` e no `Footer`.

O padrão é o mesmo do `linkComponent` da #54, verificado no Next.js na v0.4.12 (com o `AppLink`),
então não há verificação num app Next.js nesta issue.

## README

A seção "Links com o roteador do app (Next.js)" passa a citar o `Breadcrumb` junto do `Navbar`, do
`Footer` e do `DropdownMenu`.

## Versão e changelog

Prop nova e opcional, mais duas correções sem efeito para quem usa o componente: **patch**,
v0.5.4. "Adicionado": `linkComponent` no `Breadcrumb` e os tipos `BreadcrumbProps` e
`BreadcrumbItem`. "Corrigido": o anel de foco dos itens. "Ajustes necessários nos apps": nenhum.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist`.

## Resultado (implementação)

Entregue como planejado. As classes dos links e dos botões viraram uma constante (`itemClasses`),
então o `cn()` deixou de ser usado no componente. O teste importa `BreadcrumbItem` e
`BreadcrumbProps` do `src/index.ts`, e com isso o typecheck também garante a exportação: ele
falhou antes da mudança.
