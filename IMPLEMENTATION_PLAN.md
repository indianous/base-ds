# Plano de Implementação — Design System Core (base-ds)

## Contexto

Projeto greenfield de uma biblioteca de componentes React reutilizável, orientada a Design Tokens e Atomic Design. O desenvolvimento segue TDD estrito: testes são escritos antes de qualquer implementação. A biblioteca será exportada como pacote NPM interno para consumo em futuros produtos frontend.

---

## Stack Definida

| Camada | Ferramenta |
|---|---|
| Framework | React 18 + TypeScript 5 (strict) |
| Estilização | Tailwind CSS 3 (integrado a tokens) |
| Build da lib | **tsup** (bundler zero-config, gera CJS + ESM + types) |
| Testes | **Vitest** + React Testing Library + jest-axe (a11y) |
| Documentação | Storybook 8 |
| Qualidade | ESLint + Prettier |
| Utilitário CSS | clsx + tailwind-merge → `cn()` |
| Ícones | Lucide React (tree-shakeable) |

---

## Definições: Atomic Design

### Atoms
Elementos fundamentais e indivisíveis da interface. Não podem ser decompostos em unidades menores sem perder seu significado funcional. Possuem uma única responsabilidade visual ou interativa e não dependem de outros componentes para existir. São a matéria-prima do sistema.

> Exemplos: um botão, um ícone, um campo de texto puro, um checkbox.

### Molecules
Combinações funcionais de dois ou mais átomos que formam uma unidade com propósito específico. A combinação resolve um problema de interação que nenhum átomo resolve sozinho. São componentes autocontidos, mas mais simples que seções de layout.

> Exemplos: campo de busca (Input + Button), campo de formulário (Label + Input + mensagem de erro), input de senha (Input + botão de visibilidade).

### Organisms
Seções de interface relativamente complexas, compostas por moléculas e/ou átomos organizados para formar uma área significativa da interface. Possuem identidade visual própria, podem ter estado interno complexo e geralmente correspondem a blocos reconhecíveis de uma página.

> Exemplos: navbar completa, tabela de dados, dialog modal, sidebar de navegação.

---

## Mapeamento de Componentes

### Atoms (15 componentes)
| Componente | Justificativa |
|---|---|
| Button | Ação interativa única, indivisível |
| Input | Campo de texto base, elemento HTML nativo encapsulado |
| Icon | Símbolo visual único, wrapper do Lucide React |
| Spinner | Indicador de carregamento, elemento visual único |
| Badge | Rótulo visual autocontido |
| Typography > Heading | Elemento de texto semântico (h1–h6) |
| Typography > Text | Elemento de texto semântico (p, span, label) |
| Checkbox | Elemento de formulário binário nativo encapsulado |
| Radio | Elemento de seleção exclusiva nativo encapsulado |
| Switch | Alternância binária — visualmente diferente do Checkbox, mesmo propósito |
| Skeleton | Placeholder de carregamento — forma visual única sem composição |
| Avatar | Representação visual de usuário — imagem ou iniciais |
| Image | Exibição de imagem com aspect ratio e fallback controlados |
| Select | Seleção de opção única — dropdown nativo encapsulado com estilo |
| QrCode | Geração e exibição de QR code — elemento visual único gerado |

### Molecules (10 componentes)
| Componente | Composição |
|---|---|
| NumberInput | Input + Button (incrementar) + Button (decrementar) |
| PasswordInput | Input + Icon/Button (alternar visibilidade) |
| PinInput | N × Input em sequência fixa para captura de PIN/OTP |
| TagsInput | Input + Badge (tags gerenciadas) |
| Rating | N × Icon/estrela interativos com estado de hover e seleção |
| FileUpload | Button + Input[type=file] oculto + lista de arquivos |
| SearchField | Input + Button com ícone de busca |
| FormField | Typography (label) + qualquer átomo de controle + Typography (erro/hint) |
| Breadcrumb | N × Typography/Link + Icon (separador) — trilha de navegação |
| Pagination | N × Button + estado de página — navegação entre páginas |

### Organisms (7 componentes)
| Componente | Justificativa |
|---|---|
| Dialog | Overlay + cabeçalho + corpo + rodapé + ações — seção modal completa |
| Card | Container de conteúdo com múltiplas áreas composicionais (header, body, footer) |
| Drawer | Painel lateral deslizante — overlay com estrutura própria |
| Navbar | Logo + itens de navegação + ações — barra de navegação principal |
| Sidebar | Itens de navegação + grupos + colapso — navegação lateral |
| Carousel | N × slides + controles de navegação — ciclador de conteúdo |
| Table | Cabeçalhos + linhas + células + sorting + estado vazio — grid de dados |

---

## Estrutura de Pastas Final

```
/src
  /assets               # SVGs e assets estáticos adicionais
  /tokens
    colors.json         # Paleta primitiva + tokens semânticos
    spacing.json        # Escala de espaçamentos (base 4px)
    typography.json     # Famílias, pesos, tamanhos, line-height
    shadows.json        # Elevações (sm, md, lg, xl)
    borders.json        # Raios e larguras de borda
  /components
    /atoms
      /Avatar
      /Badge
      /Button
      /Checkbox
      /Icon
      /Image
      /Input
      /QrCode
      /Radio
      /Select
      /Skeleton
      /Spinner
      /Switch
      /Typography
        Heading.tsx
        Text.tsx
    /molecules
      /Breadcrumb
      /FileUpload
      /FormField
      /NumberInput
      /Pagination
      /PasswordInput
      /PinInput
      /Rating
      /SearchField
      /TagsInput
    /organisms
      /Card
      /Carousel
      /Dialog
      /Drawer
      /Navbar
      /Sidebar
      /Table
  /styles
    theme.css            # Variáveis CSS globais derivadas dos tokens
  /utils
    cn.ts                # clsx + tailwind-merge
  index.ts               # Ponto de exportação da biblioteca
```

---

## Tarefas de Implementação

### Fase 0 — Fundação do Projeto

**T-01: Inicializar projeto com Vite + TypeScript**
- `npm create vite@latest base-ds -- --template react-ts`
- Configurar `tsconfig.json` modo strict: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`
- Remover boilerplate do Vite (App.tsx, main.tsx, index.css)

**T-02: Instalar e configurar Tailwind CSS**
- `npm install -D tailwindcss postcss autoprefixer`
- `npx tailwindcss init -p`
- Configurar `tailwind.config.js` content: `./src/**/*.{ts,tsx}`

**T-03: Instalar e configurar Vitest + React Testing Library**
- `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-axe`
- `npm install -D @types/jest-axe`
- Configurar `vite.config.ts`: `test: { environment: 'jsdom', setupFiles: ['./src/setupTests.ts'] }`
- Criar `src/setupTests.ts` com `import '@testing-library/jest-dom'`

**T-04: Configurar Storybook 8**
- `npx storybook@latest init`
- Configurar integração com Tailwind em `.storybook/preview.ts`
- Decorator para importar `theme.css` globalmente

**T-05: Configurar tsup para build de biblioteca**
- `npm install -D tsup`
- `tsup.config.ts`: entry `src/index.ts`, formatos `['cjs', 'esm']`, `dts: true`, `external: ['react', 'react-dom']`
- Scripts `package.json`: `"build"`, `"test"`, `"test:ui"`, `"storybook"`, `"build-storybook"`
- Fields `package.json`: `"main"`, `"module"`, `"types"`, `"exports"`

**T-06: Configurar ESLint + Prettier**
- `eslint-plugin-jsx-a11y` para regras de acessibilidade
- `@typescript-eslint/eslint-plugin` para TypeScript strict
- `.prettierrc` com configuração padrão do projeto

---

### Fase 1 — Design Tokens

**T-07: Definir tokens JSON**
- `src/tokens/colors.json`: primitivos (gray-50…950, blue-50…950, etc.) + semânticos (primary, secondary, destructive, neutral, success, warning, info)
- `src/tokens/spacing.json`: escala 4px base (1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 8=32px, 10=40px, 12=48px, 16=64px)
- `src/tokens/typography.json`: font-family (sans, mono), font-size (xs→4xl), font-weight (regular, medium, semibold, bold), line-height
- `src/tokens/shadows.json`: none, sm, md, lg, xl
- `src/tokens/borders.json`: radius (none, sm, md, lg, xl, full), width (1, 2)

**T-08: Gerar theme.css a partir dos tokens**
- `src/styles/theme.css` com variáveis CSS mapeadas 1:1:
  ```css
  :root {
    --color-primary: #...;
    --color-primary-foreground: #...;
    --spacing-1: 4px;
    --radius-md: 6px;
    ...
  }
  ```

**T-09: Configurar tailwind.config.js com tokens**
- `theme.extend.colors`: `{ primary: 'var(--color-primary)', ... }`
- `theme.extend.spacing`: `{ 1: 'var(--spacing-1)', ... }`
- `theme.extend.borderRadius`: `{ md: 'var(--radius-md)', ... }`
- **Regra:** zero valores hardcoded — `bg-primary`, nunca `bg-[#hex]` ou `p-4` literal

---

### Fase 2 — Utilitários

**T-10: Implementar utilitário `cn()` (TDD)**
1. Escrever `src/utils/cn.test.ts`: merge de classes, resolução de conflitos Tailwind, valores falsy ignorados
2. `npm install clsx tailwind-merge`
3. Implementar `src/utils/cn.ts`

---

### Fase 3 — Atoms (TDD por componente)

Ciclo obrigatório por átomo: **test → implementação → story → export**

**T-11: Typography > Heading**
- Interface: `as` (h1–h6), `size` (xl|2xl|3xl|4xl), `weight` (regular|medium|semibold|bold), `className`, `children`
- Testes: tag HTML correta, tamanho e peso corretos, axe clean

**T-12: Typography > Text**
- Interface: `as` (p|span|label|caption), `size` (xs|sm|md|lg), `weight`, `color` (muted|default|destructive), `className`, `children`
- Testes: tag HTML correta, variantes de cor, axe clean

**T-13: Icon**
- Interface: `name` (union dos ícones Lucide exportados), `size` (sm=16|md=20|lg=24|xl=32), `aria-label?`, `className`
- Comportamento: `aria-hidden="true"` quando sem `aria-label`, `role="img"` com `aria-label` quando descritivo
- Testes: ícone correto renderizado, tamanhos corretos, aria-hidden vs aria-label, axe clean

**T-14: Button**
- Interface: `variant` (primary|secondary|ghost|outline|danger), `size` (sm|md|lg), `isLoading?`, `leftIcon?` (ReactNode), `rightIcon?` (ReactNode), `disabled?`, todos HTMLButtonElement props
- Testes: render, todas variantes, todos tamanhos, disabled bloqueia click, loading mostra Spinner e `disabled`, `aria-busy` em loading, axe clean

**T-15: Input**
- Interface: `id` (obrigatório), `size` (sm|md|lg), `state` (default|error|success), `disabled?`, todos HTMLInputElement props
- Testes: render por tipo (text, email, password), estados visuais, `aria-invalid` em error, disabled bloqueia input, axe clean

**T-16: Checkbox**
- Interface: `id` (obrigatório), `label?`, `checked?`, `indeterminate?`, `disabled?`, `onChange`, todos HTMLInputElement props
- Testes: render, marcado/desmarcado, indeterminate, disabled, teclado (Space para toggle), `aria-checked`, axe clean

**T-17: Radio**
- Interface: `id` (obrigatório), `label?`, `value`, `checked?`, `disabled?`, `onChange`, todos HTMLInputElement props
- Testes: render, selecionado/não selecionado, disabled, navegação por teclado, `aria-checked`, axe clean

**T-18: Switch**
- Interface: `id` (obrigatório), `label?`, `checked?`, `disabled?`, `onChange`
- WAI-ARIA: `role="switch"`, `aria-checked`
- Testes: render, toggle on/off, disabled, Space para toggle, aria-checked sincronizado, axe clean

**T-19: Select**
- Interface: `id` (obrigatório), `options: SelectOption[]`, `value?`, `placeholder?`, `disabled?`, `state` (default|error|success), `onChange`
- Testes: render com opções, seleção de valor, placeholder, disabled, `aria-invalid` em error, axe clean

**T-20: Badge**
- Interface: `variant` (default|primary|success|warning|danger|info), `size` (sm|md), `children`
- Testes: variantes, tamanhos, axe clean

**T-21: Spinner**
- Interface: `size` (sm|md|lg), `aria-label?` (default: "Carregando...")
- Testes: `role="status"`, aria-label correto, tamanhos, axe clean

**T-22: Skeleton**
- Interface: `width?`, `height?`, `variant` (line|circle|rect), `className`
- Testes: variantes de forma, dimensões aplicadas, axe clean (decorativo, sem papel semântico)

**T-23: Avatar**
- Interface: `src?`, `alt`, `fallback` (iniciais ou ícone), `size` (sm|md|lg|xl), `shape` (circle|square)
- Testes: imagem quando `src` presente, fallback quando `src` ausente ou falha, tamanhos, formas, alt correto, axe clean

**T-24: Image**
- Interface: `src`, `alt`, `aspectRatio?` (square|video|portrait), `objectFit?` (cover|contain), `fallback?` (ReactNode), `className`
- Testes: render, fallback em erro de carregamento, aspect-ratio aplicado, alt obrigatório, axe clean

**T-25: QrCode**
- Interface: `value` (string a codificar), `size?` (número em px), `errorCorrection?` (L|M|Q|H), `className`
- Testes: renderiza elemento canvas/svg, `aria-label` ou `role="img"`, axe clean
- Dependência: `npm install qrcode` + `@types/qrcode`

---

### Fase 4 — Molecules (TDD por componente)

**T-26: NumberInput**
- Composição: Input + Button (−) + Button (+)
- Interface: `id` (obrigatório), `value?`, `min?`, `max?`, `step?`, `disabled?`, `onChange`
- Testes: incrementa/decrementa, respeita min/max, disabled, input direto, axe clean

**T-27: PasswordInput**
- Composição: Input + Icon/Button (toggle de visibilidade)
- Interface: todos os props de Input, sem `type` exposto
- Testes: type alterna entre password/text, botão tem aria-label descritivo, axe clean

**T-28: PinInput**
- Composição: N × Input em sequência
- Interface: `length` (número de dígitos), `value?`, `onChange`, `onComplete(value: string)`, `disabled?`, `mask?` (ocultar dígitos)
- Testes: foco avança automaticamente, backspace retrocede, paste distribui dígitos, onComplete disparado, disabled, axe clean

**T-29: TagsInput**
- Composição: Input + Badge (tags) + Button de remoção por tag
- Interface: `value: string[]`, `onChange`, `placeholder?`, `disabled?`, `maxTags?`
- Testes: adiciona tag (Enter/vírgula), remove tag (clique no × ou Backspace), maxTags bloqueia adição, axe clean

**T-30: Rating**
- Composição: N × Icon interativo (estrelas ou símbolos customizáveis)
- Interface: `value?`, `max?` (default 5), `onChange?`, `readOnly?`, `size` (sm|md|lg), `icon?` (ReactNode)
- WAI-ARIA: `role="radiogroup"`, cada estrela `role="radio"`, `aria-label` descritivo
- Testes: hover preview, click seleciona valor, readOnly desabilita interação, teclado (←/→), axe clean

**T-31: FileUpload**
- Composição: Button + Input[type=file] oculto + lista de arquivos selecionados
- Interface: `accept?`, `multiple?`, `maxSize?`, `onChange`, `disabled?`, `dragAndDrop?`
- Testes: clique abre seletor, drag-and-drop (quando habilitado), validação de tipo/tamanho, lista arquivos, remove arquivo, axe clean

**T-32: SearchField**
- Composição: Input + Button (ícone de busca)
- Interface: `onSearch(value: string)`, `placeholder?`, `isLoading?`, `defaultValue?`
- Testes: chama onSearch no submit e Enter, loading desabilita botão e mostra Spinner, limpar campo, axe clean

**T-33: FormField**
- Composição: Text (label) + slot para controle (qualquer átomo) + Text (erro) + Text (hint)
- Interface: `label`, `id` (propagado ao controle via children), `error?`, `hint?`, `required?`, `children`
- Testes: `htmlFor` conecta label ao controle, mensagem de erro aparece e some, `aria-describedby` correto, required asterisco, axe clean

**T-34: Breadcrumb**
- Composição: N × link/texto (Text) + Icon (separador)
- Interface: `items: BreadcrumbItem[]` (`{ label, href?, onClick? }`), `separator?` (ReactNode)
- WAI-ARIA: `nav` com `aria-label="Breadcrumb"`, último item `aria-current="page"`
- Testes: itens renderizados, último sem link, separadores corretos, axe clean

**T-35: Pagination**
- Composição: Button (anterior) + N × Button (páginas) + Button (próximo) + Text (página atual)
- Interface: `currentPage`, `totalPages`, `onPageChange(page: number)`, `showEdges?`, `siblings?`
- WAI-ARIA: `nav` com `aria-label="Paginação"`, `aria-current="page"` na página ativa
- Testes: navega anterior/próximo, desabilita nos extremos, página ativa marcada, axe clean

---

### Fase 5 — Organisms (TDD por componente)

**T-36: Card**
- Composição: container + slot header + slot body + slot footer
- Interface: `header?` (ReactNode), `footer?` (ReactNode), `children`, `variant` (flat|elevated|outlined), `padding?` (sm|md|lg)
- Testes: slots opcionais, variantes visuais, padding, axe clean

**T-37: Dialog**
- Composição: overlay + container + Heading (título) + corpo + rodapé com ações (Button)
- Interface: `open`, `onClose`, `title`, `description?`, `children`, `footer?`, `size` (sm|md|lg|fullscreen)
- WAI-ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, foco aprisionado ao abrir, retorno de foco ao fechar
- Testes: abre/fecha, Escape fecha, clique no overlay fecha, foco trap, retorno de foco, axe clean

**T-38: Drawer**
- Composição: overlay + painel deslizante + Heading + corpo + rodapé
- Interface: `open`, `onClose`, `title`, `children`, `footer?`, `placement` (left|right|top|bottom), `size` (sm|md|lg|full)
- WAI-ARIA: `role="dialog"`, `aria-modal="true"`, foco trap, Escape fecha
- Testes: abre/fecha, placement correto, Escape fecha, foco trap, axe clean

**T-39: Navbar**
- Composição: logo slot + N × link/item (Text+Icon) + slot de ações
- Interface: `logo` (ReactNode), `items: NavItem[]` (`{ label, href, icon?, active?, children? }`), `actions?` (ReactNode), `sticky?`
- WAI-ARIA: `role="navigation"`, `aria-label="Navegação principal"`
- Testes: logo renderizado, itens ativos, sticky aplica classe, teclado navegável, axe clean

**T-40: Sidebar**
- Composição: N × item de navegação + grupos + Button de colapso + slot footer
- Interface: `items: SidebarItem[]`, `collapsed?`, `onCollapse?`, `footer?` (ReactNode)
- WAI-ARIA: `role="navigation"`, `aria-label="Navegação lateral"`, `aria-expanded` no toggle
- Testes: expandido/colapsado, itens e grupos, footer, teclado, axe clean

**T-41: Carousel**
- Composição: N × slides + Button (anterior) + Button (próximo) + indicadores (dots)
- Interface: `items: CarouselItem[]`, `autoPlay?`, `interval?`, `loop?`, `showIndicators?`, `showControls?`
- WAI-ARIA: `role="region"`, `aria-label="Carrossel"`, `aria-live="polite"` para auto-play
- Testes: navega entre slides, auto-play inicia/pausa, loop, indicadores sincronizados, axe clean

**T-42: Table**
- Composição: `thead` + `tbody` + `tfoot` + estado vazio + estado de carregamento (Skeleton)
- Interface: `columns: ColumnDef[]`, `data: T[]`, `isLoading?`, `emptyState?` (ReactNode), `onSort?`, `sortable?`
- WAI-ARIA: `role="table"` implícito (elemento `<table>`), `aria-sort` nas colunas ordenáveis, `caption` obrigatório
- Testes: colunas e dados renderizados, estado vazio, estado loading, click ordena coluna e troca aria-sort, axe clean

---

### Fase 6 — Exportação da Biblioteca

**T-43: Configurar index.ts com exports completos**
- Exportar todos os componentes por nome
- Exportar todas as interfaces TypeScript (`export type { ButtonProps, InputProps, ... }`)
- `import './styles/theme.css'` como side-effect no entry point

**T-44: Build final e validação**
- `npm run build` via tsup sem erros de tipo
- Verificar `dist/`: `index.js`, `index.mjs`, `index.d.ts`
- Smoke test: criar projeto de teste local e importar pacote via `file:../base-ds`

---

## Ciclo TDD por Componente

```
1. RED   → Escrever ComponentName.test.tsx (todos os casos devem falhar)
2. GREEN → Implementar ComponentName.tsx minimamente para os testes passarem
3. BLUE  → Refatorar sem quebrar testes
4. STORY → Escrever ComponentName.stories.tsx com todas as variantes
```

Cada arquivo de teste deve cobrir:
- Render básico via `getByRole` ou `getByTestId`
- Todas as variantes de props
- Estados (disabled, loading, error, readOnly)
- Acessibilidade: `expect(await axe(container)).toHaveNoViolations()`
- Interações com `@testing-library/user-event` (click, type, keyboard)

---

## Resumo de Tarefas

| Fase | Tarefas | Qtd |
|---|---|---|
| 0 — Fundação | T-01 a T-06 | 6 |
| 1 — Tokens | T-07 a T-09 | 3 |
| 2 — Utilitários | T-10 | 1 |
| 3 — Atoms | T-11 a T-25 | 15 |
| 4 — Molecules | T-26 a T-35 | 10 |
| 5 — Organisms | T-36 a T-42 | 7 |
| 6 — Export + Build | T-43 a T-44 | 2 |
| **Total** | | **44** |

---

## Verificação Final

```bash
npm test          # Todos os 44 testes de componentes passam
npm run build     # Dist gerado sem erros de tipo
npm run storybook # Todos os 32 componentes documentados e interativos
```

**Checklist de conformidade:**
- Nenhuma classe Tailwind com valor hardcoded (`bg-[#]`, `text-[14px]`, `p-4` literal)
- Todos os tokens referenciados via `var(--token)` em `theme.css`
- `jest-axe` clean em todos os componentes
- Todas as interfaces TypeScript exportadas via `index.ts`
- Storybook com story para cada variante de cada componente
