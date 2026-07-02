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

## Estrutura de Pastas Final

```
/src
  /assets           # SVGs e assets estáticos adicionais
  /tokens
    colors.json     # Paleta e semântica de cores
    spacing.json    # Escala de espaçamentos
    typography.json # Famílias, pesos, tamanhos
    shadows.json    # Elevações
    borders.json    # Raios e bordas
  /components
    /atoms
      /Button
      /Input
      /Typography
      /Icon
      /Badge
      /Spinner
    /molecules
      /FormField     # Label + Input + ErrorMessage
      /SearchField   # Input + Button
    /organisms
      /Card
      /Navbar
      /Sidebar
  /styles
    theme.css        # Variáveis CSS globais derivadas dos tokens
  /utils
    cn.ts            # clsx + tailwind-merge
  index.ts           # Ponto de exportação da biblioteca
```

---

## Tarefas de Implementação

### Fase 0 — Fundação do Projeto

**T-01: Inicializar projeto com Vite + TypeScript**
- `npm create vite@latest base-ds -- --template react-ts`
- Configurar `tsconfig.json` em modo strict (`"strict": true`, `noUncheckedIndexedAccess`, etc.)
- Remover boilerplate do Vite (App.tsx, main.tsx, etc.)

**T-02: Instalar e configurar Tailwind CSS**
- `npm install -D tailwindcss postcss autoprefixer`
- `npx tailwindcss init -p`
- Configurar `tailwind.config.js` para apontar para `./src/**/*.{ts,tsx}`

**T-03: Instalar e configurar Vitest + React Testing Library**
- `npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom jest-axe`
- Configurar `vite.config.ts` com `test: { environment: 'jsdom', setupFiles: ['./src/setupTests.ts'] }`
- Criar `src/setupTests.ts` com `import '@testing-library/jest-dom'`

**T-04: Configurar Storybook 8**
- `npx storybook@latest init`
- Configurar integração com Tailwind no `.storybook/preview.ts`
- Adicionar decorator para importar `theme.css`

**T-05: Configurar tsup para build de biblioteca**
- `npm install -D tsup`
- `tsup.config.ts`: entry `src/index.ts`, formatos `cjs` + `esm`, dts, external React
- Adicionar scripts `build`, `test`, `storybook` no `package.json`
- Configurar `package.json` fields: `main`, `module`, `types`, `exports`

**T-06: Configurar ESLint + Prettier**
- Regras de acessibilidade com `eslint-plugin-jsx-a11y`
- Integração TypeScript: `@typescript-eslint/eslint-plugin`

---

### Fase 1 — Design Tokens

**T-07: Definir tokens JSON**
- `src/tokens/colors.json`: tokens primitivos (palette) + semânticos (primary, secondary, destructive, neutral, success, warning)
- `src/tokens/spacing.json`: escala 4px base (1=4px, 2=8px, 3=12px, 4=16px...)
- `src/tokens/typography.json`: font-family, font-size, font-weight, line-height
- `src/tokens/shadows.json`: sm, md, lg, xl
- `src/tokens/borders.json`: border-radius (sm, md, lg, full), border-width

**T-08: Gerar theme.css a partir dos tokens**
- `src/styles/theme.css`: variáveis CSS mapeadas 1:1 dos JSONs de tokens
  ```css
  :root {
    --color-primary: #...;
    --color-primary-hover: #...;
    --spacing-1: 4px;
    ...
  }
  ```

**T-09: Configurar tailwind.config.js com tokens**
- Estender `theme.extend` com referências às variáveis CSS:
  ```js
  colors: { primary: 'var(--color-primary)', ... }
  spacing: { 1: 'var(--spacing-1)', ... }
  ```
- Regra: ZERO valores hardcoded — apenas `bg-primary`, nunca `bg-[#hex]`

---

### Fase 2 — Utilitários

**T-10: Implementar utilitário `cn()` (TDD)**
1. Escrever `src/utils/cn.test.ts` — testa merges de classes, conflitos Tailwind, valores falsy
2. Instalar `clsx` + `tailwind-merge`
3. Implementar `src/utils/cn.ts`

---

### Fase 3 — Atoms (TDD por componente)

Cada átomo segue o ciclo: **test → implementação → story → export**

**T-11: Typography**
- Interface: `variant` (h1–h6 | body | caption | label), `as` (polymorphic), `className`, `children`
- Testes: tag HTML correta por variant, classes corretas, acessível via axe

**T-12: Icon**
- Interface: `name` (keyof LucideIcons), `size` (sm|md|lg), `aria-label`
- Wrapper sobre Lucide React com tamanhos via tokens
- Testes: ícone correto, tamanho correto, aria-hidden quando decorativo

**T-13: Button**
- Interface: `variant` (primary|secondary|ghost|danger), `size` (sm|md|lg), `isLoading`, `leftIcon`, `rightIcon`, `disabled`, HTMLButtonElement props
- Testes: render, variantes, tamanhos, disabled bloqueia clicks, loading mostra Spinner e desabilita, aria correto

**T-14: Input**
- Interface: `size`, `state` (default|error|success), `disabled`, HTMLInputElement props, `id` obrigatório
- Testes: render, estados visuais, disabled, aria-invalid em error, axe clean

**T-15: Badge**
- Interface: `variant` (default|primary|success|warning|danger), `size`, children
- Testes: variantes, acessibilidade

**T-16: Spinner**
- Interface: `size`, `aria-label` (default "Carregando...")
- Testes: role="status", aria-label, tamanhos

---

### Fase 4 — Molecules (TDD por componente)

**T-17: FormField**
- Composição: Label (`htmlFor`) + Input + mensagem de erro/hint
- Interface: `label`, `error`, `hint`, `required`, `id`
- Testes: associação label-input, mensagem de erro, aria-describedby correto, axe clean

**T-18: SearchField**
- Composição: Input + Button (ícone de busca)
- Interface: `onSearch(value: string)`, `placeholder`, `isLoading`
- Testes: chama onSearch no submit e Enter, loading desabilita botão, acessibilidade

---

### Fase 5 — Organisms (TDD por componente)

**T-19: Card**
- Interface: `header` (ReactNode), `footer` (ReactNode), `children`, `variant` (flat|elevated|outlined)
- Testes: slots opcionais, variantes

**T-20: Navbar**
- Interface: `logo`, `items: NavItem[]`, `actions` (ReactNode), `sticky`
- WAI-ARIA: `role="navigation"`, `aria-label="Navegação principal"`
- Testes: logo e itens renderizados, active state, sticky, teclado navegável

**T-21: Sidebar**
- Interface: `items: SidebarItem[]`, `collapsed`, `onCollapse`, `footer`
- WAI-ARIA: `role="navigation"`, `aria-expanded` no toggle
- Testes: expande/colapsa, keyboard nav, axe clean

---

### Fase 6 — Exportação da Biblioteca

**T-22: Configurar index.ts com exports completos**
- Exportar todos os componentes, todas as interfaces TypeScript, utilitário `cn`
- `theme.css` exportado como side-effect import

**T-23: Build final e validação**
- `npm run build` via tsup
- Verificar que `dist/` contém `.js`, `.mjs`, `.d.ts`
- Smoke test: importar pacote localmente

---

## Ciclo TDD por Componente

```
1. RED   → Escrever ComponentName.test.tsx (todos os casos falham)
2. GREEN → Implementar ComponentName.tsx minimamente para passar
3. BLUE  → Refatorar sem quebrar testes
4. STORY → Escrever ComponentName.stories.tsx
```

Cada arquivo de teste deve cobrir:
- Render básico (by role ou snapshot)
- Todas as variantes de props
- Estados (disabled, loading, error)
- Acessibilidade com `jest-axe` → `expect(await axe(container)).toHaveNoViolations()`
- Interações com `@testing-library/user-event`

---

## Verificação Final

```bash
npm test          # Todos os testes passam
npm run build     # Dist gerado sem erros de tipo
npm run storybook # Todos os componentes documentados e interativos
```

**Checklist de conformidade:**
- Nenhuma classe Tailwind com valor hardcoded (`bg-[#]`, `text-[14px]`) no código
- Todos os tokens referenciados via `var(--token)` em `theme.css`
- `axe` clean em todos os componentes
- Todas as interfaces TypeScript exportadas via `index.ts`
