# Plano de Implementação — Button variante Brutalist, Dropdown Menu, Navbar avançada & Button polimórfico

> Data: 2026-07-14
> Escopo: 4 frentes de trabalho independentes, mas com uma ordem de implementação recomendada (ver seção final).

## Princípios seguidos neste plano

- **Tokens primeiro, componente depois.** Nenhum valor literal (cor, spacing, shadow, radius) é escrito direto em componente — tudo referencia `src/tokens/*.json` → `src/styles/theme.css` (custom properties) → `tailwind.config.js` (utilities).
- **Hierarquia Atomic Design** já estabelecida no repo (`atoms/ → molecules/ → organisms/`). Organisms não devem depender de outros organisms — apenas de molecules/atoms. Isso guia a decisão da Tarefa 2.
- Cada componente novo segue o padrão já existente: `Componente.tsx` + `Componente.stories.tsx` + `Componente.test.tsx` no mesmo diretório, export público em `src/index.ts`.
- Testes (`it`/`describe`) em inglês.
- Acessibilidade é first-class no repo (`eslint-plugin-jsx-a11y`, `jest-axe` instalado) — todo componente novo precisa de roles/aria corretos e cobertura de teclado.

## Metodologia de trabalho (TDD)

O projeto segue **TDD** — essa disciplina vale para toda tarefa deste plano, novo componente ou alteração em componente existente:

1. **Red** — escrever/atualizar `Componente.test.tsx` primeiro, cobrindo o comportamento novo (e os casos que já existiam, se a mudança for numa API existente). Rodar a suíte e confirmar que os testes novos falham pelo motivo certo (funcionalidade ainda não implementada).
2. **Green** — implementar o mínimo necessário em `Componente.tsx` para os testes passarem.
3. **Verificação de não-regressão** — após cada tarefa, rodar a suíte completa (`npm test`) e não só o arquivo alterado, já que vários componentes existentes importam `Button` (`Dialog`, `Drawer`) e mudanças ali podem quebrá-los silenciosamente.
4. **Storybook sempre atualizado** — todo componente novo ganha `Componente.stories.tsx`; todo componente alterado tem sua story existente revisada/expandida para cobrir os novos casos (variante, prop, estado). Nenhuma tarefa é considerada concluída com testes verdes mas Storybook desatualizado.

---

## 1. Button — nova variante `brutalist`

### Decisão de arquitetura

Não é um tema global — é **mais uma opção de `variant`** do `Button`, ao lado de `primary | secondary | ghost | outline | danger`. Comportamento especificado pelo usuário (substitui a referência externa, que não pôde ser acessada — fetch bloqueado com 403):

- **Repouso**: o botão fica deslocado `2px` para cima e para a esquerda em relação à sua posição "natural".
- **Hover ou press (`:active`)**: o botão desloca para baixo e para a direita, voltando à posição natural — efeito de "pressionar" contra a sombra.
- **Sombra**: não é `box-shadow` — é um `div` real, da mesma cor da borda, posicionado atrás do botão, na posição "natural" (sem deslocamento). Como o botão em repouso está deslocado para cima/esquerda, a sombra fica visível espiando por baixo/direita; ao pressionar, o botão cobre a sombra por completo.

Isso exige uma estrutura de DOM diferente das outras variantes: um wrapper relativo + um `div` de sombra atrás + o elemento interativo (`button`/`a`, via a prop `as` da Tarefa 4) na frente. Essa estrutura só é renderizada quando `variant === 'brutalist'` — as demais variantes continuam com o elemento único de hoje, sem nenhuma mudança de DOM ou de comportamento.

### Tokens necessários

Seguindo o princípio "sem valor literal no componente", e o mesmo padrão que `primary`/`secondary`/`danger` já usam (cada variante tem seu próprio grupo de tokens semânticos):

- `src/tokens/colors.json` (bloco `semantic`) — 3 tokens novos, **reaproveitando primitivos já existentes** (nenhuma cor primitiva nova precisa ser criada):
  ```json
  "brutalist":            "#fcd34d",              // = primitive.amber.300
  "brutalist-foreground": "var(--color-foreground)",
  "brutalist-border":     "var(--color-foreground)"
  ```
  `brutalist-border` é a mesma cor usada tanto na borda do botão quanto no `div` de sombra — por isso precisa ser um único token, nunca duas cores hardcoded repetidas.
- `src/styles/theme.css` — as 3 variáveis correspondentes na seção "CORES — Semânticos", mais uma nova variável **component-scoped** (não vem do pipeline `tokens/*.json`, é específica do Button, então fica documentada como exceção no cabeçalho do arquivo):
  ```css
  --button-brutalist-offset: 2px;
  ```
  Dedicada (não reaproveita `--spacing-0-5`, que também vale `2px`) exatamente para poder ser ajustada depois sem afetar outros usos da escala de spacing — como o usuário pediu.
- `tailwind.config.js` — adicionar `brutalist: { DEFAULT, foreground, border }` em `theme.extend.colors`, no mesmo formato de `primary`/`secondary` (sem `hover`/`active`/`muted`, já que a variante não muda de cor — quem muda é a posição).
- Border width e radius **não** precisam de token novo: reaproveitam `border-2` (já existe, `--border-2`) e `rounded-none`/`rounded-sm` (já existem na escala de radius).

### Tarefas

1. **1.1** — Adicionar os 3 tokens de cor (`brutalist`, `brutalist-foreground`, `brutalist-border`) em `colors.json`, `theme.css` e `tailwind.config.js`.
2. **1.2** — Adicionar `--button-brutalist-offset: 2px` em `theme.css`, numa seção curta de "tokens específicos de componente", com comentário explicando por que foge do pipeline `tokens/*.json`.
3. **1.3** — Estender `ButtonVariant` para incluir `'brutalist'` e adicionar `variantClasses.brutalist` (`bg-brutalist text-brutalist-foreground border-2 border-brutalist-border rounded-none font-bold`, sem classe de `hover:bg-*`, já que a cor não muda).
4. **1.4** — Implementar o branch de render exclusivo da variante brutalist em `Button.tsx`:
   - wrapper `<span className="relative inline-block">`;
   - `<span aria-hidden="true" className="absolute inset-0 pointer-events-none bg-brutalist-border" />` (a "sombra", mesmo `border-radius` do botão, atrás — sem `z-index` extra necessário já que vem antes no DOM);
   - o elemento interativo (`button`/`a`, conforme `as` — Tarefa 4) com `relative z-10` e as classes de translate abaixo.
5. **1.5** — Classes de animação no elemento interativo: repouso = `-translate-x-[var(--button-brutalist-offset)] -translate-y-[var(--button-brutalist-offset)]`; `hover:translate-x-0 hover:translate-y-0`, `active:translate-x-0 active:translate-y-0` e, por consistência de acessibilidade (mesmo feedback visual para quem navega por teclado), `focus-visible:translate-x-0 focus-visible:translate-y-0`; `transition-transform` para suavizar.
6. **1.6** — Garantir que `disabled`/`isLoading` continuam aplicando opacidade/`pointer-events-none` no elemento interativo (o `div` de sombra já é `aria-hidden` + `pointer-events-none`, não interfere).
7. **1.7** — Storybook: story `Brutalist` (todas as `size`), `BrutalistDisabled`, `BrutalistAsLink` (`as="a"`), e incluir um exemplo na story `AllVariants` existente.
8. **1.8** — Testes em `Button.test.tsx`: renderiza o `div` de sombra (`aria-hidden`) só quando `variant="brutalist"`; classes de translate de repouso presentes; `disabled` continua bloqueando clique/pointer-events; nenhuma mudança de DOM nas outras variantes (regressão); `jest-axe` sem violações.

**Fora do escopo (para depois):** aplicar a mecânica brutalist a outros componentes além do Button — o pedido é explícito em começar só pelo Button. A cor padrão (`amber-300`) é só uma proposta inicial, documentada como fácil de trocar em `colors.json` a qualquer momento.

---

## 2. Dropdown Menu — decisão de hierarquia

### Decisão: **Molecule** (`src/components/molecules/DropdownMenu/`)

Justificativa:
- **Composição**: um `DropdownMenu` é um trigger (tipicamente um `Button`, atom) + uma lista de itens (atoms: `Icon`, texto). Isso é exatamente a definição de molecule usada no repo (ex.: `SearchField` = `Input` + `Button` + `Icon`; `FormField` = label + input + mensagem de erro).
- **Regra de camadas**: `Navbar` (organism) precisa usar `DropdownMenu` como um dos tipos de `NavItem` (Tarefa 3). Se `DropdownMenu` fosse organism, teríamos um organism dependendo de outro organism, o que quebra a hierarquia já adotada no projeto (organisms compõem apenas molecules/atoms). Classificando como molecule, `Navbar`, `Table` (menu de ações por linha) e `Sidebar` podem reutilizá-lo livremente no futuro.
- **Diferença para `Dialog`/`Drawer`/`Toast` (organisms)**: esses usam `createPortal` para um overlay full-screen com backdrop, pois precisam cobrir toda a tela. `DropdownMenu` é um painel **ancorado ao trigger** (posicionamento relativo/absoluto local, sem backdrop full-screen), mais próximo em espírito de um popover leve — não precisa de portal para funcionar corretamente na maioria dos casos de uso (Navbar, Table, Sidebar não têm `overflow: hidden` nos ancestrais diretos do trigger).

### API proposta (consistente com o padrão `items: Array<...>` já usado em `Navbar`/`Sidebar`)

```ts
export interface DropdownMenuItem {
  label: string
  icon?: ReactNode
  href?: string          // renderiza como link (via Button as="a", ver Tarefa 4)
  onClick?: () => void
  disabled?: boolean
  danger?: boolean        // usa tokens destructive
  type?: 'item' | 'separator'
}

export interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItem[]
  align?: 'start' | 'end'   // alinhamento do painel em relação ao trigger
  onOpenChange?: (open: boolean) => void
  className?: string
}
```

### Tarefas

1. **2.1** — Criar `src/components/molecules/DropdownMenu/DropdownMenu.tsx`: wrapper com `position: relative`, trigger clicável (`aria-haspopup="menu"`, `aria-expanded`), painel `role="menu"` posicionado com `absolute` + `align`.
2. **2.2** — Fechamento: click fora (listener em `document`), tecla `Escape`, seleção de item. Reusar o padrão de `useEffect` + listener já visto em `Dialog`/`Drawer`.
3. **2.3** — Navegação por teclado: `ArrowDown`/`ArrowUp` movem o foco entre itens (`role="menuitem"`), `Home`/`End` vão para o primeiro/último, `Enter`/`Space` ativam o item focado — via roving tabindex.
4. **2.4** — Itens: renderizar via `Button as="a"` (link) ou `Button as="button"` internamente (Tarefa 4 precisa estar pronta) para reaproveitar estilos/estados de disabled/hover; separador (`type: 'separator'`) como `<div role="separator">`.
5. **2.5** — `DropdownMenu.stories.tsx` (casos: básico, com ícones, com item `danger`, com separador, `align="end"`).
6. **2.6** — `DropdownMenu.test.tsx`: abre/fecha por clique, fecha com Escape, fecha ao clicar fora, navegação por setas, `onClick` do item é chamado e o menu fecha, item `href` renderiza link real, `jest-axe` sem violações.
7. **2.7** — Exportar `DropdownMenu` e `DropdownMenuProps`/`DropdownMenuItem` em `src/index.ts` (seção Molecules, ordem alfabética como o resto do arquivo).

---

## 3. Navbar avançada (busca, itens embaixo, mobile drawer, dropdown items, múltiplas actions)

### Decisões de API

`NavItem` vira união discriminada para suportar link ou dropdown:

```ts
type NavItem =
  | { type?: 'link'; label: string; href?: string; active?: boolean; onClick?: () => void }
  | { type: 'dropdown'; label: string; items: DropdownMenuItem[] }
```

`actions` passa de `ReactNode` único para `ReactNode[]`, permitindo múltiplas actions renderizadas com espaçamento/keys consistentes (breaking change aceitável — pacote está em `0.1.0`, pré-1.0).

Nova prop `search?: ReactNode` (o consumidor injeta um `SearchField` já existente, a Navbar só cuida do layout — evita a Navbar reimplementar lógica de busca que já existe em `molecules/SearchField`).

### Layout quando `search` está presente

- Linha 1 (altura atual, `h-14`): `logo` | `search` (centralizado, ocupando o espaço onde os `NavItems` ficariam) | `actions`.
- Linha 2 (nova, só existe se `search` estiver presente): `NavItems` centralizados horizontalmente, abaixo da linha 1, dentro do mesmo `<header>`.
- Quando `search` **não** está presente: comportamento atual é mantido — `NavItems` na linha única, entre `logo` e `actions`.

### Responsividade / mobile drawer

- Abaixo do breakpoint `md`: esconder a linha de `NavItems` (e a linha de busca, se aplicável, vira um ícone de busca que abre um campo, ou é movida para dentro do Drawer — decisão: mover para dentro do Drawer junto com os items, para simplificar) e mostrar um botão hambúrguer (`Icon name="Menu"`, `aria-label="Open navigation menu"`) à esquerda ou direita do `logo`.
- Ao clicar, abre o `Drawer` **já existente** (`organisms/Drawer`, `side="left"`) com: `search` (se houver) + lista de `NavItem` em coluna (dropdowns viram grupos expansíveis/accordion simples dentro do Drawer, não um `DropdownMenu` flutuante — não faz sentido ter popover dentro de um painel lateral já estreito).
- Estado `isMobileMenuOpen` controlado internamente por `useState` dentro do `Navbar` (sem exigir prop controlada de fora, consistente com `Sidebar`, que também gerencia seu próprio `isCollapsed`).

### Tarefas

1. **3.1** — Atualizar tipos em `Navbar.tsx`: `NavItem` como união discriminada, `actions?: ReactNode[]`, `search?: ReactNode`.
2. **3.2** — Implementar layout de duas linhas quando `search` está presente (flex-col no `<nav>`, linha 1 com `justify-between`, linha 2 com `justify-center`).
3. **3.3** — Renderização de `NavItem` do tipo `dropdown` usando o `DropdownMenu` (Tarefa 2) com o trigger estilizado igual ao link atual (`linkBaseClasses` + chevron `Icon name="ChevronDown"`).
4. **3.4** — Renderizar múltiplas `actions` com `gap-2` e `key` estável (index já é aceitável dado que a lista é estática por render).
5. **3.5** — Botão hambúrguer + breakpoint (`hidden md:flex` na linha de items desktop, `flex md:hidden` no botão hambúrguer).
6. **3.6** — Integração com `Drawer`: renderizar `<Drawer open={isMobileMenuOpen} onClose={...} side="left" title={...}>` com os `NavItem` em coluna; dropdowns dentro do Drawer renderizam como grupo (label + itens indentados), sem popover.
7. **3.7** — Atualizar `Navbar.stories.tsx`: novos cases `WithSearch`, `WithDropdownItem`, `WithMultipleActions`, `MobileDrawer` (forçar viewport pequeno via parâmetro do Storybook ou classe utilitária `max-w-sm`).
8. **3.8** — Atualizar `Navbar.test.tsx`: renderiza busca no lugar certo, items descem para segunda linha quando há busca, dropdown item abre o `DropdownMenu`, múltiplas actions renderizam todas, botão hambúrguer abre/fecha o Drawer, `jest-axe`.
9. **3.9** — Revisar `src/index.ts` — nenhuma mudança de export necessária (Navbar já exportado), mas conferir se `DropdownMenuItem`/`NavItem` precisam ser exportados como tipos públicos (recomendo exportar `NavItem` já que vira união discriminada útil para consumidores tipar arrays externos).

---

## 4. Button polimórfico (button **ou** link, nunca os dois)

### Decisão de API

Prop discriminante `as`, união discriminada em TypeScript — é a forma idiomática de garantir em tempo de compilação que as props de `<button>` (ex. `type="submit"`) e as de `<a>` (`href`, `target`, `rel`) não se misturem incorretamente:

```ts
type ButtonCommonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

type ButtonAsButton = ButtonCommonProps &
  { as?: 'button' } &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonCommonProps>

type ButtonAsLink = ButtonCommonProps &
  { as: 'a'; href: string } &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonCommonProps>

export type ButtonProps = ButtonAsButton | ButtonAsLink
```

- Default `as='button'` preserva 100% o comportamento/typing atual — **nenhum uso existente quebra** (`Dialog.tsx`, `Drawer.tsx` continuam funcionando sem alteração).
- Quando `as="a"`: `href` passa a ser obrigatório (erro de tipo se faltar); `disabled` nativo não existe em `<a>` — usar `aria-disabled="true"` + `tabIndex={-1}` + classe `pointer-events-none` quando `disabled`/`isLoading` forem passados nesse modo (compat prop mantida para API simétrica, mas tratada via aria em vez de atributo HTML).
- `isLoading` continua funcionando igual nos dois modos (troca `leftIcon` pelo `Spinner`).

### Tarefas

1. **4.1** — Reescrever `Button.tsx` com a união discriminada acima; extrair as classes/lógica comuns (spinner, ícones, `baseClasses`) para não duplicar entre os dois branches de render.
2. **4.2** — Render condicional: `as === 'a'` → `<a>` com `href`, `aria-disabled`, sem atributo `disabled`; caso contrário (default) → `<button>` como hoje.
3. **4.3** — Atualizar `Button.stories.tsx`: novo case `AsLink` (`as: 'a', href: '#', children: 'Go to docs'`) e `AsLinkDisabled`.
4. **4.4** — Atualizar `Button.test.tsx`: renderiza `<a>` quando `as="a"`, `href` propagado, `aria-disabled` quando `disabled`/`isLoading` + `as="a"`, `role`/tag corretos, garante que passar `href` sem `as="a"` não compila (teste de tipo, não runtime — comentário no arquivo de teste ou um `*.test-d.ts` se o projeto adotar `expectTypeOf`/`tsd`; caso contrário, documentar a checagem manual via `tsc --noEmit`).
5. **4.5** — Nenhuma mudança necessária em `Dialog.tsx`/`Drawer.tsx` (usam `as` default) — apenas rodar a suíte de testes existente para confirmar ausência de regressão.

---

## Ordem de implementação recomendada

`Button` é pré-requisito de `DropdownMenu` (itens com `href`) e de `Navbar` (trigger de dropdown, actions). Sugestão de sequência:

1. **Tarefa 4** — Button polimórfico (base para tudo que segue).
2. **Tarefa 1** — Variante `brutalist` do Button (mexe no mesmo arquivo/render que a Tarefa 4, evita dois PRs tocando `Button.tsx` em paralelo — o branch de DOM da variante já nasce ciente de `as`).
3. **Tarefa 2** — DropdownMenu (molecule).
4. **Tarefa 3** — Navbar avançada (consome DropdownMenu + Button).

## Riscos / pontos em aberto

- **Cor padrão da variante `brutalist`** (`amber-300` para o fundo) é uma escolha inicial razoável, não confirmada contra nenhuma referência visual (o link enviado não pôde ser acessado) — como o comportamento de animação/sombra já foi validado diretamente pelo usuário, o risco aqui é só estético/cosmético e trivial de ajustar depois via `colors.json`.
- **Breaking change** em `Navbar.actions` (`ReactNode` → `ReactNode[]`) afeta qualquer consumidor externo já usando a lib — como está em `0.1.0`, considerado aceitável, mas vale registrar no changelog/PR.
- **Token component-scoped fora do pipeline JSON** (`--button-brutalist-offset`) quebra a convenção "gerado a partir de `tokens/*.json`" — decisão deliberada (ver Tarefa 1.2), documentar bem no comentário do `theme.css` para não confundir o próximo dev que for gerar tokens a partir do JSON.
