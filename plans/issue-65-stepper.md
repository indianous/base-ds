# Plano: `Stepper`, indicador de etapas (issue #65)

## Contexto

O checkout do `ecommerce-frontend` vai virar três etapas: **Carrinho → Entrega → Pagamento**. O
base-ds não tem um componente que mostre em que etapa a pessoa está, então o app escreve só
"Etapa 2 de 3 — Entrega". A issue pede um `Stepper` com estados por etapa, volta a etapas
concluídas, uma versão compacta no celular e acessibilidade completa.

## API

`src/components/molecules/Stepper/Stepper.tsx`:

```ts
export interface StepperStep {
  id: string
  label: string
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  steps: StepperStep[]
  /** `id` of the current step. */
  current: string
  /** Called with a completed step's `id` when it's clicked. Without it, no step is a button. */
  onStepClick?: (id: string) => void
  /** `aria-label` of the list of steps. */
  label?: string // 'Steps'
  /** Visually hidden state of a completed step. */
  completedStepLabel?: string // 'completed'
  /** Visually hidden state of the current step. */
  currentStepLabel?: string // 'current'
  /** Visually hidden state of a step not reached yet. */
  upcomingStepLabel?: string // 'not started'
  /** Visible text of the compact (mobile) view, from the current step's position. */
  progressMessage?: (step: number, total: number, label: string) => string
  // default: (step, total, label) => `Step ${step} of ${total} — ${label}`
}
```

- **`current` só por `id`.** A issue fala em "ou um índice", mas aceitar os dois num `string |
number` deixa ambíguo um `id` como `'2'`. O `id` é o que o app já tem na rota. Se o `current` não
  existir em `steps`, todas as etapas ficam futuras (sem erro, nada no `console`).
- **`label` em vez de `aria-label`**, pela convenção dos textos do `CLAUDE.md` (`label` é o nome do
  grupo do próprio componente). O exemplo da issue fica
  `<Stepper label="Etapas do pedido" … />`. Os outros atributos vão para o `<div>` de fora.
- Os textos seguem a convenção: padrão em inglês na desestruturação, um JSDoc por prop, e o que
  depende da posição é uma função (`progressMessage`).

## Estrutura e visual

```
 (✓)───────(2)───────(3)
Carrinho  Entrega  Pagamento
```

- **Desktop (a partir de `sm`):** `<ol aria-label={label}>` com um `<li>` por etapa, em linha.
  Cada etapa tem um círculo (o número, ou um `CheckIcon` quando concluída, via `IconBase`) e o
  rótulo abaixo. Entre as etapas, uma linha que fica `bg-primary` quando a etapa anterior está
  concluída e `bg-border` antes disso.
  - **concluída:** círculo `bg-primary text-primary-foreground`, rótulo `text-foreground`;
  - **atual:** círculo com borda `border-primary` e número `text-primary`, rótulo em negrito,
    `aria-current="step"` no `<li>`;
  - **futura:** círculo com borda `border-border` e número `text-muted-foreground`, rótulo
    `text-muted-foreground`.
  - O círculo é `aria-hidden` (a posição já vem do `<ol>`). Depois do rótulo, um texto
    `sr-only` com o estado (`, completed` / `, current` / `, not started`).
- **Celular (abaixo de `sm`):** no lugar do `<ol>`, um bloco compacto com o texto de
  `progressMessage` ("Step 2 of 3 — Delivery") e uma barra de progresso (`bg-primary` sobre
  `bg-muted`, largura proporcional à etapa atual, `aria-hidden`, já que o texto diz o mesmo). Sem
  rolagem horizontal. A troca é por CSS (`sm:hidden` / `hidden sm:block`): o que está escondido
  fica com `display: none`, então o leitor de tela não ouve as duas versões. Sem estado nem
  efeito, então renderiza igual no servidor.
- **Clique:** com `onStepClick`, só as etapas concluídas viram `<button type="button">` (círculo +
  rótulo), com o anel de foco padrão (`focus:outline-none focus:ring-2 focus:ring-ring`) e um
  hover no rótulo. A atual e as futuras continuam texto, não focáveis. No celular não há volta pelo
  Stepper: a versão compacta não lista as etapas, e o app já tem os botões "Voltar" do formulário.
- Só tokens (`primary`, `primary-foreground`, `border`, `muted`, `muted-foreground`,
  `foreground`, `ring`), nos dois temas. Os pares de texto usados já estão nos pares de contraste.

## Testes (TDD, escritos antes)

- um `<ol>` com o `label` como nome e um `<li>` por etapa, na ordem;
- `aria-current="step"` só na etapa atual;
- o texto de estado de cada etapa (concluída / atual / futura) e o ícone de check nas concluídas;
- sem `onStepClick`, nenhum botão; com ele, só as concluídas são botões, e o clique chama
  `onStepClick(id)`; a atual e as futuras não são botões;
- a versão compacta: o texto padrão "Step 2 of 3 — Delivery" e a largura da barra (2 de 3);
- `current` inexistente: todas futuras, sem `aria-current`;
- as classes de troca por tamanho de tela (`hidden sm:block` / `sm:hidden`) — o jsdom não aplica
  media queries;
- um teste por prop de texto, com valores em português (`label`, `completedStepLabel`,
  `currentStepLabel`, `upcomingStepLabel`, `progressMessage`);
- `jest-axe` sem violações, com e sem `onStepClick`.

**Stories:** `Default` (etapa 2 de 3), `FirstStep`, `LastStep`, `Clickable` (com `play`: clicar
numa concluída chama o `onStepClick`, e a futura não é botão), `Mobile` (com o viewport de celular
do Storybook, para ver a versão compacta) e `CustomLabels` (o checkout em português). O addon de
a11y confere tudo nos dois temas.

## Exportação, versão e changelog

- `Stepper`, `StepperProps` e `StepperStep` pela raiz (`src/index.ts`).
- Componente novo, sem mudar o que existe: **patch**, **v0.5.8**. CHANGELOG com "Ajustes
  necessários nos apps: nenhum", e seção "Stepper" no README com o exemplo do checkout em
  português.
- O `check:dist` e o `bundle.test.ts` já cobrem o arquivo novo (cada componente vira um arquivo
  próprio do build).

## Fora do escopo

- Stepper vertical e etapas com descrição, erro ou etapa opcional.
- Navegação entre etapas no celular pelo próprio Stepper.
- Gerenciar o fluxo (avançar, validar etapa): o componente só mostra o estado, e o app controla o
  `current`.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist`.

## Resultado (implementação)

Entregue como planejado. Detalhes que o plano não fixava:

- O sublinhado de hover vai só no rótulo das etapas clicáveis (`group-hover:underline`).
- A linha entre as etapas vai de centro a centro dos círculos, por baixo deles. Fica `bg-primary`
  até a etapa atual e `bg-border` depois dela.
- O visual foi conferido no Storybook (claro, escuro e 375 px de largura).
