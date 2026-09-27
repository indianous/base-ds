# Plano: rótulos de acessibilidade customizáveis no `Carousel` (issue #49)

## Contexto

O `Carousel` (`src/components/organisms/Carousel/Carousel.tsx`) tem todos os textos de
acessibilidade fixos em inglês:

- região: `aria-label="Carousel"`
- cada slide: `aria-roledescription="slide"` e `aria-label="Slide N of M"`
- setas: `aria-label="Previous slide"` / `"Next slide"`
- pontos: `aria-label="Go to slide N"`

O `ecommerce` usa o `Carousel` em "Produtos relacionados", e o leitor de tela anuncia tudo em
inglês. É o mesmo pedido já atendido no `SearchField` (#31), no `PasswordInput` (#47) e no
`PinInput` (#48).

## Mudança

Props novas e opcionais, com o texto atual em inglês como padrão:

```ts
export interface CarouselProps {
  // ...props atuais
  /** `aria-label` da região. Padrão `'Carousel'`. */
  label?: string
  /** `aria-label` de cada slide. Padrão `` (n, total) => `Slide ${n} of ${total}` ``. */
  slideLabel?: (n: number, total: number) => string
  /** `aria-roledescription` de cada slide. Padrão `'slide'`. */
  slideRoleDescription?: string
  /** `aria-label` da seta anterior. Padrão `'Previous slide'`. */
  previousLabel?: string
  /** `aria-label` da seta seguinte. Padrão `'Next slide'`. */
  nextLabel?: string
  /** `aria-label` de cada ponto. Padrão `` (n) => `Go to slide ${n}` ``. */
  dotLabel?: (n: number) => string
}
```

`slideRoleDescription` não está no pedido da issue, mas entra por um motivo: o leitor de tela lê o
`aria-roledescription` literalmente, junto com o rótulo. Sem essa prop, cada slide continuaria
sendo anunciado como "slide", em inglês, mesmo com `slideLabel` em português.

`CarouselProps` hoje não é exportado. Ele passa a ser exportado no componente e reexportado em
`src/index.ts`.

## TDD

Em `Carousel.test.tsx`, escrever primeiro os testes abaixo e ver que falham:

1. `it('uses label as the region aria-label')`
2. `it('uses slideLabel and slideRoleDescription on each slide')`: com
   `slideLabel={(n, total) => \`Página ${n} de ${total}\`}`e`slideRoleDescription="página"`,
o primeiro slide tem `aria-label="Página 1 de 3"`e`aria-roledescription="página"`.
3. `it('uses previousLabel and nextLabel on the arrows')`: com os rótulos em português, a
   navegação continua funcionando pelo nome novo.
4. `it('uses dotLabel on each dot')`: `getByRole('button', { name: 'Ir para a página 2' })`
   navega para o segundo slide.

Os testes atuais, com os textos em inglês, continuam como estão e garantem os padrões.

## Story

Criar em `Carousel.stories.tsx` a story `CustomLabels`, com todos os rótulos em português, como no
exemplo da issue. Ela documenta as props e passa pelo axe no `test:stories`.

## Versão e changelog

Versão **0.4.5** (patch): props novas e opcionais, sem mudança de comportamento.

Entrada no `CHANGELOG.md`, seção **Adicionado**: as props `label`, `slideLabel`,
`slideRoleDescription`, `previousLabel`, `nextLabel` e `dotLabel` no `Carousel`, com os padrões em
inglês; o tipo `CarouselProps` passa a ser exportado. Na seção "Ajustes necessários nos apps":
nenhum é obrigatório. Os apps podem passar os rótulos em português e trocar nos testes as buscas
por `/next slide/i` e `/go to slide/i`.

Primeiro um commit só com o plano. Depois do OK, um commit com o código, o bump para `0.4.5` e o
CHANGELOG, a tag `v0.4.5` e o push.

## Fora do escopo

O padrão de carrossel da WAI-ARIA também recomenda `aria-roledescription="carousel"` na região, o
que o componente não tem hoje. Se for adicionado, ele entra com uma prop própria, pelo mesmo motivo
do `slideRoleDescription`. Fica para uma issue separada, se for de interesse.

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`.
