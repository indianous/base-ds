# Plano: componente de layout `Container` (issue #39)

## Contexto

O projeto **ecommerce** tem cerca de 40 páginas que repetem à mão o wrapper de conteúdo
`<main className="mx-auto max-w-5xl px-4 py-8">`, mudando só o `max-w-*` conforme o tipo de
tela. A receita diverge (telas sem `mx-auto`, loading com largura diferente da tela carregada) e
o `<main>` acaba aninhado no `<main>` do shell, gerando dois landmarks `main`. Hoje o app usa um
`PageContainer` local com a API pedida na issue, para depois trocar a implementação pelo
componente do base-ds sem mexer nas páginas.

## Decisões

### Camada: atom

`Container` não depende de nenhum outro componente da biblioteca, então vai em
`src/components/atoms/Container/`.

### API

```ts
type ContainerWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '7xl'
type ContainerSpacing = 'default' | 'relaxed' | 'loose'
type ContainerAs = 'div' | 'main' | 'section' | 'article'

export interface ContainerProps extends React.HTMLAttributes<HTMLElement> {
  as?: ContainerAs // padrão 'div'
  width?: ContainerWidth // padrão '5xl'
  spacing?: ContainerSpacing // padrão 'default'
  className?: string
  children: React.ReactNode
}
```

- **`as` como união simples, não união discriminada.** O CLAUDE.md pede união discriminada
  para componentes polimórficos, mas isso existe para elementos com atributos diferentes
  (`button` × `a` com `href`). `div`, `main`, `section` e `article` aceitam exatamente os
  mesmos atributos (`HTMLAttributes<HTMLElement>`), então segue o padrão de `Text`/`Heading`
  (`as?: TextAs` + `React.createElement(as, ...)`).
- **`as` limitado a elementos de bloco de seção.** `main` cobre o caso "página sem shell" da
  issue; `section`/`article` são baratos e evitam que o app precise de outro wrapper. Nada de
  elementos inline ou interativos.
- **Padrões reproduzem a receita mais comum.** `<Container>` sem props gera
  `mx-auto w-full max-w-5xl px-4 py-8` — a mesma coisa que as páginas de listagem fazem hoje.
- **Escala de larguras igual à da issue** (sem `6xl`, que o app não usa). Dá para estender
  depois sem quebrar ninguém.
- **Sem `ref`.** Nenhum componente da biblioteca, exceto `Checkbox`, repassa ref, e um wrapper
  de layout não precisa. Se surgir a necessidade, vira outra issue.
- **Resto dos atributos é repassado** (`role`, `aria-label`, `aria-busy`, `id`, `data-*`...),
  cobrindo o uso em loading com `role="status"`.

### Classes

Tabelas `Record` com classes literais (o Tailwind do app só gera classes que encontra escritas
por inteiro no `dist/`):

```ts
const widthClasses: Record<ContainerWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '7xl': 'max-w-7xl',
}

const spacingClasses: Record<ContainerSpacing, string> = {
  default: 'py-8',
  relaxed: 'py-12',
  loose: 'py-16',
}

const baseClasses = 'mx-auto w-full px-4'
```

Composição: `cn(baseClasses, widthClasses[width], spacingClasses[spacing], className)`. Como
`cn` usa `tailwind-merge`, o app consegue sobrescrever pelo `className` (`py-0`, `px-6`,
`max-w-6xl`), e a classe dele vence.

### Tokens

- `px-4` e `py-8/12/16` já são tokens de espaçamento (`--spacing-*` em `tailwind.config.js` e
  em `theme-v4.css`).
- **`max-w-*` usa a escala padrão do Tailwind (`24rem`...`80rem`), sem token próprio.** O
  design system não tem tokens de largura de layout hoje, e `Dialog` (`max-w-md`),
  `ImageGallery` (`max-w-3xl`) e `ToastViewport` (`max-w-sm`) já usam essa escala. A mesma
  escala existe no Tailwind v3 e no v4 (`--container-*`), então funciona para os dois tipos de
  consumidor. Criar tokens de largura (`sizes.json` → `--size-container-*`) seria uma mudança
  maior, que afetaria os componentes existentes; fica fora do escopo.

## Testes (TDD) — `Container.test.tsx`

Escritos antes da implementação:

1. Renders a `<div>` by default (e não cria landmark: `queryByRole('main')` é nulo).
2. Renders as `<main>` / `<section>` / `<article>` when `as` is set.
3. Applies `mx-auto`, `w-full`, `px-4` e as classes padrão (`max-w-5xl`, `py-8`).
4. Applies the matching `max-w-*` class for each `width` (`it.each` pela escala toda).
5. Applies `py-8` / `py-12` / `py-16` for `spacing` `default` / `relaxed` / `loose`.
6. Merges a custom `className` (`flex flex-col gap-4` presente junto das classes base).
7. Lets `className` override the default padding (`py-0` substitui `py-8`, via
   `tailwind-merge`).
8. Forwards HTML attributes (`role="status"`, `aria-label`, `id`, `data-testid`).
9. Renders its children.
10. Has no accessibility violations (`jest-axe`) — default e com `role="status"`.

## Stories — `Container.stories.tsx`

Título `Atoms/Container`, com `autodocs`. Conteúdo de exemplo com fundo `bg-muted` para a
largura ficar visível:

- `Default`
- `Widths` — todas as larguras empilhadas, com o nome de cada uma
- `Spacing` — `default`, `relaxed`, `loose` lado a lado
- `AsMain` — página sem shell
- `LoadingState` — `role="status"` + `aria-label`, mesma largura da tela carregada (o problema
  citado na issue)
- `WithLayoutClasses` — `className="flex flex-col gap-6"`

## API pública

Em `src/index.ts`, seção Atoms, em ordem alfabética (depois de `Checkbox`):

```ts
export { Container } from './components/atoms/Container/Container'
export type { ContainerProps } from './components/atoms/Container/Container'
```

## Versão e CHANGELOG

Seguindo a convenção criada na #38: componente novo, sem ajuste obrigatório nos apps →
**patch, `0.2.1`**.

- `package.json` → `0.2.1` (e `package-lock.json` via `npm install`).
- `CHANGELOG.md`, entrada `0.2.1` → _Adicionado_: `Container`. Seção "Ajustes necessários nos
  apps": nenhum obrigatório; opcionalmente, o ecommerce troca a implementação interna do
  `PageContainer` pelo `Container` e remove o `<main>` aninhado.
- Tag `v0.2.1` após o commit.

## Verificação

1. `npm run lint`, `npm test`, `npm run build`.
2. `npm run test:stories`: as stories do `Container` passam. As 28 falhas de acessibilidade que
   já existem em outros componentes continuam as mesmas (sem falha nova).
3. Conferir que todas as classes das tabelas aparecem literais em `dist/index.js` (`grep`
   `max-w-7xl`, `py-16` etc.), garantindo que o Tailwind do app as gera.
4. `npm run pack:local` e, no consumidor de teste do scratchpad, instalar
   `base-ds-0.2.1.tgz` e renderizar `<Container width="2xl" as="main" role="region">` com
   `renderToString`, conferindo tag e classes no HTML.

## Fora do escopo

- Trocar o `PageContainer` do ecommerce pelo `Container` (feito no repositório do app).
- Tokens de largura de layout e breakpoints responsivos no gutter (`px-4 sm:px-6`) — a issue
  pede `px-4` fixo; se o app precisar, sobrescreve pelo `className` ou vira outra issue.

## Commit

`Adiciona componente de layout Container (issue #39)`, com a versão `0.2.1` no mesmo commit e a
tag `v0.2.1` em seguida.
