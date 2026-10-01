# Plano: carregamento de imagens e `imageComponent` no `Image` e no `ImageGallery` (issue #56)

## Contexto

O `ecommerce-frontend` (Next.js, App Router) mostra as imagens da loja pelo `Image` e pelo
`ImageGallery`. O `Image` renderiza um `<img>` só com `src`, `alt`, `className` e `onError`. O
`ImageGallery` usa o `Image` nas miniaturas e na imagem principal, e um `<img>` direto no zoom.
Com isso:

- não há como usar o `next/image`, então o navegador baixa a imagem original até num card pequeno;
- não há lazy loading: o catálogo baixa todas as imagens de uma vez;
- não há como passar `sizes`, `width`/`height` nem marcar a imagem principal como prioritária.

A issue pede duas partes, e cada uma vale sozinha: os atributos de carregamento no `<img>` nativo
e uma prop `imageComponent`, no molde do `linkComponent` da #54.

### Prioridade no Next.js 16

O `next/image` do Next.js 16 descontinuou o `priority`: a recomendação é `loading="eager"` e
`fetchPriority="high"`, que são atributos padrão do `<img>`
([docs](https://nextjs.org/docs/pages/api-reference/components/image)). O `preload` do `next/image`
também não serviria aqui: o `Image` é um client component, e num client component o `<link>` de
preload vai para o `<body>`, não para o `<head>`.

Então o `priority` do base-ds **não é repassado como `priority`**. Ele vira `loading="eager"` e
`fetchPriority="high"`, tanto no `<img>` nativo quanto no `imageComponent`. Assim o
`imageComponent` só recebe atributos padrão de `<img>`, e o `next/image` entende todos eles sem
aviso de descontinuação.

## Mudanças

### 1. `Image`: atributos de carregamento

Props novas, todas opcionais:

| prop       | padrão   | efeito                                                                  |
| ---------- | -------- | ----------------------------------------------------------------------- |
| `loading`  | `'lazy'` | `loading` do `<img>`                                                    |
| `priority` | `false`  | `true` → `loading="eager"` e `fetchPriority="high"` (vence o `loading`) |
| `sizes`    | —        | repassado                                                               |
| `width`    | —        | repassado                                                               |
| `height`   | —        | repassado                                                               |

E sempre `decoding="async"`. O React 19 (a versão de desenvolvimento, 19.3) reconhece
`fetchPriority`. O `peerDependencies` aceita React 18, e o `fetchPriority` em camelCase só existe a
partir do React 18.3. Em versões anteriores, o React avisa no console e ignora o atributo, sem
quebrar. Registro isso no README.

**Mudança de comportamento**: hoje toda imagem carrega na hora. Com `loading="lazy"` como padrão, a
imagem principal da página (o banner da home, a foto do produto) passa a esperar o layout, o que
piora o LCP se o app não marcar `priority`. As imagens abaixo da dobra, que são a maioria, passam a
não ser baixadas antes da hora. A issue pede o `lazy` como padrão, e o CHANGELOG traz uma
recomendação para marcar a imagem principal com `priority`.

### 2. `Image`: prop `imageComponent`

```ts
export type ImageComponent = ElementType<
  Pick<
    ImgHTMLAttributes<HTMLImageElement>,
    | 'className'
    | 'onError'
    | 'loading'
    | 'decoding'
    | 'fetchPriority'
    | 'sizes'
    | 'width'
    | 'height'
  > & { src: string; alt: string }
>

/** Component rendered in place of `<img>` (e.g. a wrapper around Next.js `Image`). */
imageComponent?: ImageComponent
```

Padrão `'img'`, então nada muda sem a prop. `width` e `height` só são passados quando o app os
informa: o `next/image` com `fill` rejeita `width`/`height`. O tipo fica em
`src/utils/imageComponent.ts`, ao lado do `LinkComponent`, e é exportado no `src/index.ts`.

Uso no app, como na issue:

```tsx
import NextImage from 'next/image'
import type { ImageComponent } from '@indianous/base-ds'

const StoreImage: ImageComponent = (props) => <NextImage {...props} fill />
```

O `Image` já envolve a imagem numa `<div className="relative overflow-hidden">`, que é o que o
`fill` precisa. O `fill` também precisa que a `<div>` tenha altura: com `aspectRatio` ou com um
tamanho no `className`. Isso vai para o README.

O `hidden` no erro continua funcionando: o `className` é repassado ao componente, e o `fallback`
aparece do mesmo jeito.

### 3. `ImageGallery`

- Nova prop `imageComponent`, repassada às miniaturas e à imagem principal.
- **Miniaturas**: `loading="lazy"` (o padrão) e `sizes="64px"`, porque elas medem `w-16`. Sem o
  `sizes`, o `next/image` com `fill` assume `100vw` e baixa uma imagem do tamanho da tela para cada
  miniatura.
- **Imagem principal**: nova prop `priority`, com padrão `true`. A issue pede a principal como
  prioritária: numa página de produto ela é o LCP. O app passa `priority={false}` quando a galeria
  fica abaixo da dobra. Nova prop `sizes`, repassada à principal.
- **Zoom**: continua um `<img>` direto, sem `imageComponent`. O zoom serve para ver a imagem
  original, e o layout dele (`max-h-[90vh]`, sem contêiner de tamanho fixo) não encaixa num
  `fill`. Ele ganha só `decoding="async"`. Como o zoom abre depois de um clique, ele não precisa de
  lazy loading.

## Testes (TDD, escritos antes)

`Image.test.tsx`:

- por padrão, `loading="lazy"` e `decoding="async"`;
- `loading="eager"` é repassado;
- `priority` → `loading="eager"` e `fetchpriority="high"`, mesmo com `loading="lazy"` passado;
- `sizes`, `width` e `height` são repassados, e `width`/`height` não aparecem quando não são
  passados;
- com um `imageComponent` de teste (que renderiza `<img data-custom-image>` e repassa as props):
  ele recebe `src`, `alt`, `className`, `loading`, `decoding` e `sizes`, e não recebe `priority`;
- com `imageComponent`, o `fallback` aparece quando a imagem dispara `onError`;
- `jest-axe` sem violações com `imageComponent`.

`ImageGallery.test.tsx`:

- as miniaturas têm `loading="lazy"` e `sizes="64px"`;
- a principal tem `loading="eager"` e `fetchpriority="high"` por padrão, e `loading="lazy"` com
  `priority={false}`;
- `sizes` é repassado à principal;
- com `imageComponent`, as miniaturas e a principal usam o componente, e o zoom continua `<img>`.

## Stories

`Image` e `ImageGallery` ganham uma story `CustomImageComponent`, com um componente de exemplo que
renderiza um `<img>` com um atributo de marcação (sem depender do Next, como o `DemoLink` da #54).
A story `Image` ganha também uma `Priority`.

## Verificação com o `next/image`

Como na #53, num app Next.js 16.3.6 mínimo no scratchpad, que não entra no repositório. O base-ds
entra pelo tarball de `npm run pack:local`:

- o `StoreImage` da issue (`(props) => <NextImage {...props} fill />`) passa no typecheck contra o
  tipo `ImageComponent`;
- uma página com `Image` e `ImageGallery` usando o `StoreImage`: `next build` sem avisos, e no
  Chromium as imagens vêm de `/_next/image` com `srcset`, as miniaturas com `loading="lazy"` e a
  principal com `fetchpriority="high"`, sem erros no console.

As imagens do app mínimo ficam em `public/`, para não depender de `remotePatterns`.

## README

Seção "Imagens com o Next.js", junto de "Links com o roteador do app": o `StoreImage` com `fill`, a
necessidade de altura na `<div>` (`aspectRatio` ou `className`), o `priority` para a imagem
principal e o `sizes`.

## Versão e changelog

Props novas e opcionais: **patch**, v0.4.12. "Adicionado": `loading`, `priority`, `sizes`,
`width`, `height` e `imageComponent` no `Image`, e `imageComponent`, `priority` e `sizes` no
`ImageGallery`. "Alterado": o `Image` passa a usar `loading="lazy"` e `decoding="async"` por padrão.
"Ajustes necessários nos apps": nada obrigatório. Recomendado: marcar a imagem principal da página
com `priority`, porque sem isso ela passa a carregar em modo lazy.

## Fora do escopo

- Textos de acessibilidade do `ImageGallery` (`"Product image gallery"`, `"Previous image"` …):
  são da #58.
- Um `imageComponent` no `Avatar`, o único outro componente que renderiza `<img>`.

## Verificação

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist`, e a verificação com o `next/image`.

## Resultado (implementação)

Verificação num app Next.js 16.3.6 mínimo, com Tailwind v4 (`@source` na pasta `dist`) e o base-ds
pelo tarball:

- O typecheck do `StoreImage` reprovou o primeiro tipo `ImageComponent`. O `width`/`height` do
  `ImgHTMLAttributes` é `string | number`, e o `next/image` só aceita número. O tipo passou a
  declarar `width?: number` e `height?: number`.
- O `StoreImage` precisa ficar num arquivo `'use client'`. Definido dentro de um Server Component,
  ele não pode ser passado ao `Image`, que é um client component.
- **O mesmo vale para o `linkComponent` da #54**: `<Navbar linkComponent={Link}>` com o `Link`
  importado num Server Component falha no build (`Functions cannot be passed directly to Client
Components`), e o README da v0.4.9 ensinava esse uso. A correção é reexportar o `Link` de um
  arquivo `'use client'` (`export { default as AppLink } from 'next/link'`), e assim a navegação no
  cliente funcionou. O README foi corrigido nesta versão.
- No Chromium: as imagens vêm de `/_next/image` com `srcset`. As miniaturas são lazy, com
  `sizes="64px"` e 64×64 px. A principal tem `loading="eager"` e `fetchpriority="high"`, e o card
  abaixo da dobra é lazy. Não há erros nem avisos no console.

Correção do plano: ele dizia que o `fetchPriority` em camelCase existe a partir do React 18.3, mas
isso não foi verificado. Só o React 19 foi testado, e o README diz isso.
