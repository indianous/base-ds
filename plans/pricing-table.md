# Plano: tabela de preços (`PricingTable` e `PricingCard`)

## Contexto

Pedido direto, sem issue: um componente de tabela de preços para páginas de planos (SaaS) e de
compras avulsas (um curso, um pacote, uma licença vitalícia), que
ajude a pessoa a escolher um plano de forma clara. A especificação pede:

1. **Estrutura:** um cartão por plano, lado a lado; um plano em destaque (borda colorida, selo
   "Mais vendido", leve deslocamento); preço grande, com a moeda e o período menores.
2. **Controles:** um alternador mensal/anual no topo, com um selo de desconto no anual
   ("Economize 20%"); em modelos mais avançados, um controle de quantidade (usuários, volume de
   dados) que muda o preço.
3. **Conteúdo:** nome e descrição do plano, o preço do ciclo escolhido, a lista de recursos
   (incluídos com check; ausentes esmaecidos ou riscados) e tooltips de ajuda nos recursos
   complexos.
4. **CTA:** um botão por cartão; sólido no plano em destaque, secundário (borda) nos outros.

O base-ds já tem quase todas as peças: `Card`, `Badge`, `Button` (com `asChild`), `Tooltip`,
`IconBase` e o `LinkComponent` dos componentes de navegação. Falta um controle deslizante: não há
`Slider` no base-ds.

## Proposta: dois lotes

- **Lote 1 (v0.5.9):** `PricingCard`, `PricingTable` e o alternador de período. É o que quase
  toda página de preços usa.
- **Lote 2 (v0.5.10):** um átomo `Slider`, novo e útil fora daqui, e o controle de quantidade da
  `PricingTable`.

O preço por quantidade depende do `Slider` e muda a forma de informar o preço (de valores fixos
para uma função). Separar os lotes deixa o lote 1 menor e já útil para os apps.

## Lote 1

### API

`src/components/organisms/PricingTable/` com `PricingTable.tsx` e `PricingCard.tsx` (o cartão
também é exportado sozinho, para quem monta o próprio layout).

```ts
export type BillingPeriod = 'monthly' | 'yearly'

export interface PricingFeature {
  label: string
  /** Default true. A feature not included shows muted, with an X icon. */
  included?: boolean
  /** Explanation shown in a tooltip next to the feature. */
  description?: string
}

export interface PricingPlan {
  id: string
  name: string
  /** Who the plan is for. */
  description?: string
  /**
   * A number: one-time price, shown without a period suffix. Per period: a subscription, shown
   * with the selected period's suffix. `null` or missing: the plan shows `customPrice`.
   */
  price?: number | Partial<Record<BillingPeriod, number | null>>
  /** Text in place of the price, for plans without one ("Talk to us"). */
  customPrice?: string
  /** Small text under the price: one text ("One-time payment") or one per period ("Billed R$ 960 yearly"). */
  priceNote?: string | Partial<Record<BillingPeriod, string>>
  features: PricingFeature[]
  /** Highlights the plan: primary border, solid CTA, lifted on large screens. */
  highlighted?: boolean
  /** Badge text on top of the card ("Most popular"). */
  badge?: string
  cta: { label: string; href?: string; onClick?: () => void }
}

export interface PricingTableProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  plans: PricingPlan[]
  /** Controlled period. */
  period?: BillingPeriod
  defaultPeriod?: BillingPeriod // 'monthly'
  onPeriodChange?: (period: BillingPeriod) => void
  /** Periods offered in the toggle. With only one, or with no plan priced per period, there's no toggle. */
  periods?: BillingPeriod[] // ['monthly', 'yearly']
  /** Badge next to the yearly option ("Save 20%"). */
  yearlyBadge?: string
  /** Currency and locale of the prices (`Intl.NumberFormat`). */
  currency?: string // 'USD'
  locale?: string // 'en-US'
  /** Component rendered in place of `<a>` for CTAs with `href` (e.g. Next.js `Link`). */
  linkComponent?: LinkComponent
  /** Heading level of the plan names. */
  headingLevel?: 2 | 3 | 4 // 3
  // Texts (English defaults):
  label?: string // 'Pricing plans' — aria-label of the section
  billingLabel?: string // 'Billing period' — name of the toggle group
  monthlyLabel?: string // 'Monthly'
  yearlyLabel?: string // 'Yearly'
  monthlySuffix?: string // '/month'
  yearlySuffix?: string // '/year'
  includedLabel?: string // 'Included' — hidden text of an included feature
  notIncludedLabel?: string // 'Not included' — hidden text of a missing feature
  featureHelpLabel?: (feature: string) => string // (f) => `More about ${f}`
}
```

O `PricingCard` recebe um `plan` e o `period`, mais as mesmas props de moeda, link, título e
textos que fazem sentido para um cartão. A `PricingTable` repassa as dela.

Decisões:

- **Assinatura ou compra avulsa, pelo formato do `price`.** Um número (`price: 497`) é um
  pagamento único: sai sem sufixo de período, não muda com o alternador, e a `priceNote` pode
  dizer "Pagamento único" ou "Em até 12x". Um objeto por período é uma assinatura. Os dois podem
  conviver na mesma tabela ("Mensal R$ 49/mês" ao lado de "Vitalício R$ 497"). Se nenhum plano
  tem preço por período, o alternador não aparece: uma tabela só de compras avulsas fica sem ele.
- **O preço anual é o que o app passa.** Uns sites mostram o anual como "R$ 80/mês, cobrado
  anualmente" e outros como "R$ 960/ano". O componente não calcula nada: mostra
  `price[period]` com o sufixo do período, e o app usa `priceNote` para a outra metade
  ("Cobrado R$ 960 por ano"). Para mostrar o equivalente mensal no anual, o app passa
  `yearlySuffix="/mês"`.
- **Moeda:** `Intl.NumberFormat(locale, { style: 'currency', currency })` com `formatToParts`,
  para a moeda sair menor que o número (`R$` pequeno, `49` grande, `,90` pequeno). Valores
  inteiros saem sem centavos (`R$ 49`). O `locale` tem padrão fixo (`en-US`) e não o do
  navegador: com o padrão do navegador, o servidor e o cliente poderiam formatar diferente e a
  hidratação quebraria.
- **CTA:** com `href`, um `Button asChild` sobre o `linkComponent` (padrão `'a'`); sem ele, um
  `<button>` com o `onClick`. Variante `primary` no plano em destaque e `outline` nos outros,
  em largura total no rodapé do cartão.
- **Server Components:** `plans` com `href` funciona vindo do servidor. `cta.onClick` e o
  `linkComponent` precisam de um arquivo `'use client'`, como já está no README (`AppLink`).

### Estrutura, visual e acessibilidade

- **Seção:** `<section aria-label={label}>`, com o alternador no topo e os cartões numa grade:
  uma coluna no celular e, a partir de `md`/`lg`, uma por plano (de 1 a 4 colunas, por uma tabela
  `Record<number, string>` de classes). Os cartões têm a mesma altura e o CTA fica no rodapé.
- **Cartão:** `<article aria-labelledby={id do nome}>`. Nome como título (`headingLevel`),
  descrição em `text-muted-foreground`, preço, nota, CTA e a lista de recursos (`<ul>`).
- **Destaque:** borda `border-2 border-primary`, sombra maior e, a partir de `lg`, um
  deslocamento para cima (`lg:-translate-y-2`). O `badge` vira um `Badge` `primary` sobre a borda
  superior. O destaque não depende só da cor: o selo diz em texto, e o CTA muda de estilo.
- **Preço:** número em `text-4xl font-bold`, moeda e centavos em `text-xl`, sufixo do período em
  `text-sm text-muted-foreground`. O leitor de tela lê o preço inteiro numa só frase (o número
  formatado e o sufixo).
- **Alternador:** um grupo de botões de opção (`<fieldset>` com `<legend className="sr-only">`
  e dois `<input type="radio">` com aparência de controle segmentado). As setas do teclado trocam
  de opção, como em qualquer grupo de rádio, sem código próprio. O `yearlyBadge` vai dentro do
  rótulo do anual, então também é lido. A troca de período não é anunciada numa região
  `aria-live`: anunciar todos os preços de novo seria barulhento, e o estado do rádio já é lido.
- **Recursos:** incluído com `CheckIcon` em `text-success`; ausente com `XIcon` e o texto em
  `text-muted-foreground`, **sem riscado**. O riscado atrapalha a leitura e não é anunciado; o
  estado vai num texto `sr-only` (`includedLabel` / `notIncludedLabel`). O esmaecido é pela cor
  `muted-foreground`, que passa no contraste, e não por `opacity`, que não passaria.
- **Tooltip:** com `description`, um botão com `InfoIcon` ao lado do recurso, nome
  `featureHelpLabel(label)`, dentro do `Tooltip` do base-ds (abre com o mouse e com o foco do
  teclado, e liga o texto por `aria-describedby`).
- Só tokens, nos dois temas. Ícones por `IconBase` com import nomeado.

### Testes (TDD, escritos antes)

- uma `<section>` com o `label` e um `<article>` por plano, nomeado pelo nome do plano;
- o preço do período padrão e, depois de trocar no alternador, o do outro, com o sufixo certo;
  `onPeriodChange`; o `period` controlado;
- a formatação: `pt-BR`/`BRL` (`R$ 49`, `R$ 49,90`), `en-US`/`USD`, valor inteiro sem centavos;
- `customPrice` quando não há preço para o período, e a `priceNote` do período;
- sem alternador quando `periods` tem um só período; o `yearlyBadge` dentro do rótulo do anual;
- compra avulsa: `price` numérico sem sufixo, igual nos dois períodos, com a `priceNote` em texto
  único; uma tabela só de compras avulsas sem alternador; uma tabela que mistura os dois;
- destaque: o `badge`, a borda e o CTA `primary`; os outros com `outline`;
- CTA com `href` vira link (inclusive com um `linkComponent` de teste), sem `href` vira botão e
  chama o `onClick`;
- recursos: o texto escondido de incluído e não incluído, e o botão de ajuda com o tooltip;
- um teste por prop de texto, com valores em português;
- `jest-axe` sem violações.

**Stories:** `Default` (três planos, o do meio em destaque), `WithYearlyDiscount`,
`CustomPrice` (Enterprise "Fale com vendas"), `SinglePeriod`, `OneTimePurchase` (pacotes de
pagamento único, sem alternador), `MixedPlans` (mensal ao lado de vitalício), `CardAlone` (um `PricingCard`
sozinho), `Interactive` (com `play`: trocar o período muda os preços) e `CustomLabels` (tudo em
português, com `pt-BR`/`BRL`). O addon de a11y confere tudo nos dois temas.

## Lote 2

- **`Slider`** (átomo, `src/components/atoms/Slider/`): um `<input type="range">` nativo com
  aparência dos tokens (trilha `bg-muted`, preenchimento e polegar `primary`, anel de foco
  `ring`). Props `value`/`defaultValue`/`onChange(value)`, `min`, `max`, `step`, `aria-label`, e
  `formatValue?: (value) => string` para o `aria-valuetext` ("10 usuários" em vez de "10"). O
  input nativo já traz teclado (setas, Page Up/Down, Home/End) e leitor de tela. Funciona dentro
  do `FormField`.
- **Quantidade na `PricingTable`:** uma prop `quantity` com
  `{ label, min, max, step, value/defaultValue, onChange, formatValue }`, que mostra um `Slider`
  entre o alternador e os cartões. O `price` de um plano passa a aceitar também uma função,
  `(context: { period, quantity }) => number | null`, para o app calcular o preço.
- Testes e stories no mesmo molde do lote 1 (inclusive `CustomLabels` do `Slider`).

## Exportação, versão e changelog

- Pela raiz: `PricingTable`, `PricingCard` e os tipos (`PricingTableProps`, `PricingCardProps`,
  `PricingPlan`, `PricingFeature`, `BillingPeriod`); no lote 2, `Slider` e `SliderProps`.
- Componentes novos, sem mudar o que existe: **patch** em cada lote (v0.5.9 e v0.5.10), com
  "Ajustes necessários nos apps: nenhum" e uma seção no README.
- Nenhum token novo: os tamanhos de texto, cores, sombras e raios já existem.

## Fora do escopo

- Tabela comparativa de recursos (uma matriz com todos os planos nas colunas).
- Moeda escolhida pela pessoa, impostos, cupons e cálculo de desconto.
- Mais de dois períodos (trimestral, por exemplo).
- Integração com gateway de pagamento: o CTA só leva ao link ou chama o `onClick`.

## Checklist final

Em cada lote: `npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`,
`npm run build` + `npm run check:dist`.
