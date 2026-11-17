# Plano: `Badge` clicável com `href` e `linkComponent` (issue #68)

## Contexto

O blog precisa de tags e categorias clicáveis (`/tags/<slug>`) com a aparência do `Badge`. Hoje o
`Badge` é sempre um `<span>` e só aceita `variant`, `size`, `className` e `children`. Enquanto
isso, o app usa um `ButtonLink` `sm`/`outline` com um comentário que aponta para esta issue.

## Mudanças

### 1. Props novas

```ts
/** URL the badge links to. Without it the badge is a plain `<span>`. */
href?: string
/** Component rendered in place of `<a>` when `href` is set (e.g. Next.js `Link`). */
linkComponent?: LinkComponent
```

- sem `href`: `<span>`, sem nenhuma mudança (mesmas classes e mesmo DOM);
- com `href`: `<LinkElement href className>` com `linkComponent = 'a'` por padrão, no mesmo
  padrão do `Breadcrumb` (#61) e do `Footer` (#54), com o tipo `LinkComponent` de
  `src/utils/linkComponent.ts`;
- `linkComponent` sem `href` é ignorado.

Fica fora o `onClick` (badge como `<button>`): a issue não pede, e um filtro clicável é outro
componente (chip/toggle). O `Badge` não aceita os atributos nativos (`...rest`), e isso continua
assim. Se um app precisar de `aria-label` ou `target`, fica para outra issue.

### 2. Estilo do link

Só quando há `href`, numa tabela à parte, sem condicional inline:

- **hover:** `Record<BadgeVariant, string>` com os tokens `*-hover` que já existem
  (`primary-hover`, `success-hover`, `warning-hover`, `destructive-hover`, `info-hover`). O
  `default` (`bg-muted`) não tem um `muted-hover`, e passa a usar `hover:bg-border`, o mesmo tom
  um pouco mais escuro que outros componentes usam sobre `muted`. Confiro o contraste do texto
  sobre esse fundo nos dois temas antes de fechar. Se não passar em AA, uso
  `hover:underline` no `default`, e não crio um token novo nesta issue.
- **foco:** `focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2`, o mesmo anel dos outros links (WCAG 2.4.7). O `rounded-full`
  do tamanho já faz o anel acompanhar o formato.
- `transition-colors`.

O contraste em hover não é checado pelo addon de a11y (a story não fica em hover). Por isso
verifico os pares `*-foreground` sobre `*-hover` no `contrast.test.ts`: se o par ainda não estiver
lá, ele entra em `src/theme/contrast.ts` e passa a valer também na validação dos apps. Como o
`Button` já usa esses mesmos pares, devem passar.

## Testes (TDD, escritos antes)

- sem `href`: continua um `<span>`, e não existe `link` na árvore;
- com `href`: `getByRole('link', { name: 'React' })` com o `href`, as classes de `variant` e
  `size` e as de hover e foco;
- com `linkComponent` (o `TestLink` da #54, que renderiza `<a data-custom-link>`): usa esse
  componente e repassa `href`, `className` e `children`;
- `linkComponent` sem `href`: continua um `<span>`;
- `jest-axe` sem violações com `href`;
- importar `BadgeProps` do `src/index.ts` com `href` e `linkComponent`, para o typecheck
  garantir a exportação.

Stories: `AsLink` (todas as variantes como link) e `CustomLinkComponent`, como no `Breadcrumb`.
O addon de a11y checa as duas nos dois temas.

Não há rótulo novo para tradução: o texto é o `children` do app.

## README

- seção do `Badge` (ou onde ele aparece): exemplo de tag clicável com `href` e
  `linkComponent={AppLink}`;
- "Links com o roteador do app (Next.js)": incluir o `Badge` na lista de componentes.

## Versão e changelog

Props novas e opcionais: **patch**, v0.5.11 se sair depois da #66. "Adicionado": `href` e
`linkComponent` no `Badge`. "Ajustes necessários nos apps": nenhum. No changelog, uma nota de que
o contorno com `ButtonLink` no blog pode sair.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build`
e `npm run check:dist`.
