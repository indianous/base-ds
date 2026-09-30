# Plano: compor os links do Navbar e do Footer com `next/link` (issue #54)

A issue vem do `portfolio` (Next.js, App Router). Ela sugere uma prop `linkComponent` no nível do
componente, ou o `asChild` por item do `Sidebar`, e pede que o drawer do celular feche ao clicar num
item.

## Contexto

Os links do `Navbar` e do `Footer` são sempre `<a href>`:

- `Navbar`: itens `link` no desktop (`DesktopNavItem`) e no drawer do celular (`MobileNavItem`), e
  os subitens de `dropdown` no drawer (`MobileDropdownSubItem`). No desktop, os subitens passam pelo
  `DropdownMenu`, que usa `<Button as="a">`.
- `Footer`: os links das colunas e os `socialLinks`.

Num app Next.js, um `<a>` puro faz uma navegação completa: a página recarrega inteira, sem prefetch
e sem manter o estado do layout. O app não tem como trocar o elemento.

O repositório já tem um padrão para isso no `Sidebar`: cada item aceita `asChild?: ReactElement`, e
o componente clona esse elemento com o conteúdo do item dentro (`cloneElement(item.asChild, {},
itemContent)`) via `<Button asChild>`. Para o `Navbar` e o `Footer`, o caso comum é _todos_ os links
serem `next/link`. Um `asChild` por item obrigaria o app a montar um elemento para cada link.

## Proposta: prop `linkComponent`

Uma prop por componente, que troca o elemento de todos os links internos:

```ts
export type LinkComponent = ElementType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }
>

/** Component rendered in place of `<a>` for every link (e.g. Next.js `Link`). */
linkComponent?: LinkComponent
```

Uso no app:

```tsx
import Link from 'next/link'
;<Navbar linkComponent={Link} items={…} />
```

O padrão é `'a'`, então nada muda para quem não passa a prop. O componente continua passando
`href`, `className`, `aria-current`, `aria-label` e `children`. O `next/link` aceita todos eles e
renderiza o próprio `<a>`, então o HTML final e as classes são os mesmos.

O tipo `LinkComponent` fica em `src/utils/` (ou num arquivo `types`) e é exportado no `src/index.ts`,
porque o `DropdownMenu` também vai usá-lo (ver abaixo).

### Onde a prop se aplica

| componente     | links afetados                                                       |
| -------------- | -------------------------------------------------------------------- |
| `Navbar`       | itens `link` (desktop e celular) e subitens de `dropdown` no celular |
| `Navbar`       | subitens de `dropdown` no desktop, repassando ao `DropdownMenu`      |
| `DropdownMenu` | nova prop `linkComponent`, para os itens com `href`                  |
| `Footer`       | links das colunas e `socialLinks`                                    |

No `DropdownMenu`, os itens com `href` são `<Button as="a">`. Com `linkComponent`, eles passam a
usar `<Button asChild>` envolvendo o `linkComponent`, que já existe no `Button` e preserva as
classes, o `role="menuitem"`, o `tabIndex` e o `onClick`. O comportamento de `disabled` precisa ser
mantido (`aria-disabled`, `tabIndex=-1` e `preventDefault`): verificar se o `asChild` do `Button`
cobre isso e, se não cobrir, tratar no `DropdownMenu`.

### Fechar o drawer ao navegar

Hoje, tocar num link do drawer do celular recarrega a página, e o drawer "fecha" junto. Com
`next/link` não há recarga, então o drawer continuaria aberto sobre a página nova. Os links
(e os botões com `onClick`) do drawer do menu devem chamar `setIsMobileMenuOpen(false)` ao serem
clicados, preservando o `onClick` do item. Isso vale também sem `linkComponent` (links com `#` ou
que o app intercepta), então é uma correção junto.

## Testes (TDD, escritos antes)

`Navbar.test.tsx`:

- com um `linkComponent` de teste (um componente que renderiza `<a data-custom-link>` e repassa as
  props), os itens `link` do desktop usam esse componente, com `href`, `aria-current` e as classes;
- o mesmo no drawer do celular, incluindo os subitens de `dropdown`;
- os subitens de `dropdown` no desktop também usam o componente;
- clicar num link do drawer do menu fecha o drawer e chama o `onClick` do item;
- sem `linkComponent`, continua renderizando `<a>` (os testes que existem já garantem isso);
- `jest-axe` sem violações com `linkComponent`.

`DropdownMenu.test.tsx`:

- itens com `href` usam o `linkComponent`, mantendo `role="menuitem"` e a navegação por setas;
- item `disabled` com `linkComponent` não navega e fica com `aria-disabled`.

`Footer.test.tsx`:

- links das colunas e `socialLinks` usam o `linkComponent`, mantendo `href`, `aria-label` e classes.

## Stories

`Navbar`, `Footer` e `DropdownMenu` ganham uma story `CustomLinkComponent` com um componente de link
de exemplo (sem depender do Next, que não é dependência do base-ds), para o addon de a11y verificar.

## README

Na seção de uso com Next.js (ou nova, se não existir): passar `linkComponent={Link}` no `Navbar` e no
`Footer`.

## Versão e changelog

Props novas e opcionais, sem ajuste obrigatório: **patch**, v0.4.9. Entrada "Adicionado" para o
`linkComponent` (`Navbar`, `Footer`, `DropdownMenu`) e "Corrigido" para o drawer do `Navbar` que
agora fecha ao clicar num item. A seção `[Não publicado]` da #44 (README do Dependabot) entra na
mesma versão.

## Fora do escopo

- `Sidebar` e `Breadcrumb` também usam links. O `Sidebar` já resolve com `asChild`. Se o
  `Breadcrumb` precisar, é outra issue.
- Mudar o `Sidebar` para `linkComponent`, por consistência. Pode virar issue à parte.

## Verificação

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories` e `npm run build`.
