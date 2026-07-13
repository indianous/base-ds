# Plano de Implementação — Footer e Toast

## Contexto

Extensão do design system `base-ds` com 2 novos componentes: **Footer** e **Toast**. Segue os mesmos padrões já estabelecidos no projeto (Atomic Design, TDD estrito, tokens via `cn()`, Tailwind sem valores hardcoded, `jest-axe` obrigatório). Continua a numeração de tarefas do `IMPLEMENTATION_PLAN.md` a partir de **T-45**, e deve ser concluído **antes** de T-43/T-44 (export final da lib), já que os novos componentes também precisam constar no `index.ts`.

---

## Hierarquia: Atom, Molecule ou Organism?

### Footer → **Organism**

| Critério | Análise |
|---|---|
| Composição | Logo/marca + colunas de links de navegação + redes sociais (Icon+link) + texto de copyright — múltiplas áreas composicionais, não apenas 2 átomos combinados |
| Precedente no projeto | Espelha diretamente o **Navbar** (T-39), que também é `header`/`nav` de layout classificado como Organism |
| Estado interno | Baixo/nenhum, mas isso **não** rebaixa para Molecule — Card (T-36) também tem estado baixo e é Organism, pois representa uma "seção significativa da interface" |
| Conclusão | Organism — é o contraponto estrutural do Navbar: fecha o layout de página em vez de abri-lo |

### Toast → **Organism**

| Critério | Análise |
|---|---|
| Composição visual | Icon (status) + Text (título/descrição) + Button (fechar/ação) — isoladamente pareceria Molecule |
| Estado interno | **Complexo**: fila de múltiplos toasts simultâneos, timers de auto-dismiss, pause on hover, portal para `document.body`, gerenciamento global via Context (`ToastProvider` + hook `useToast`) |
| Precedente no projeto | Mesma classe de complexidade do **Dialog** (T-37) e **Drawer** (T-38): ambos usam `createPortal`, gerenciam foco/ciclo de vida e são Organisms mesmo sendo "poucos átomos" — a régua do projeto é *complexidade de estado + papel de seção reconhecível de UI*, não contagem de átomos |
| Conclusão | Organism — requer infraestrutura própria (Provider/Context) que nenhuma Molecule do projeto possui hoje |

> **Nota de arquitetura:** Toast é o primeiro componente do design system a exigir um React Context. Isso introduz um novo arquivo de suporte `ToastProvider.tsx` + hook `useToast.ts` dentro da própria pasta `Toast/`, não um padrão novo de pastas.

---

## Estrutura de Pastas (adição)

```
/src
  /components
    /organisms
      /Footer
        Footer.tsx
        Footer.test.tsx
        Footer.stories.tsx
      /Toast
        Toast.tsx              # componente visual individual (apresentação pura)
        Toast.test.tsx
        ToastProvider.tsx      # Context + reducer de fila + timers
        ToastProvider.test.tsx
        useToast.ts            # hook público (consome o Context)
        useToast.test.ts
        ToastViewport.tsx      # container com portal + aria-live, renderiza a fila
        ToastViewport.test.tsx
        Toast.stories.tsx
        index.ts               # re-export local (Toast, ToastProvider, useToast, types)
```

---

## Tarefas de Implementação

### T-45: Footer (Organism)

**Interface**
```ts
interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

interface FooterSocialLink {
  icon: ReactNode      // ex.: <Icon name="Github" />
  href: string
  label: string        // aria-label obrigatório
}

interface FooterProps {
  logo?: ReactNode
  columns?: FooterColumn[]
  socialLinks?: FooterSocialLink[]
  copyright?: string   // default: gerado com ano atual, ex. "© 2026 base-ds"
  className?: string
}
```

**WAI-ARIA**
- Elemento raiz `<footer>` com `role="contentinfo"` (implícito)
- Cada bloco de links: `<nav aria-label="{column.title}">`
- Links sociais: `aria-label` descritivo obrigatório (ex. "GitHub", não apenas o ícone)

**Ciclo TDD**

1. **RED** — `Footer.test.tsx`:
   - `it('renders as a contentinfo landmark')`
   - `it('renders logo slot when provided')`
   - `it('renders link columns with correct titles and links')`
   - `it('renders social links with accessible labels')`
   - `it('renders copyright text')`
   - `it('renders default copyright with current year when not provided')`
   - `it('has no accessibility violations')` (`jest-axe`)
2. **GREEN** — Implementar `Footer.tsx` com Tailwind + tokens (`bg-background`, `border-border`, `text-muted-foreground`), reutilizando `Icon` e `Text`/`Typography` já existentes para labels
3. **BLUE** — Extrair classes repetidas, revisar responsividade (colunas empilham em mobile via `grid-cols-1 md:grid-cols-N`)
4. **STORY** — `Footer.stories.tsx`: variantes "completo" (logo+colunas+social+copyright), "minimal" (somente copyright), "sem redes sociais"

---

### T-46: Toast (Organism)

**Interface**
```ts
type ToastVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info'

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number        // ms; default 5000; 0 = não fecha sozinho
  action?: { label: string; onClick: () => void }
}

interface ToastItem extends ToastOptions {
  id: string
}

// API pública consumida pelos componentes da aplicação
interface UseToastReturn {
  toast: (options: ToastOptions) => string   // retorna o id, permite dismiss manual
  dismiss: (id: string) => void
  toasts: ToastItem[]
}
```

**Composição**
- `ToastProvider`: Context + reducer (`ADD`, `DISMISS`, `REMOVE`) + gerenciamento de timers de auto-dismiss (`setTimeout` por toast, `clearTimeout` em unmount/dismiss)
- `useToast()`: hook que expõe `toast()`, `dismiss()`, `toasts` a partir do Context; lança erro se usado fora do Provider
- `ToastViewport`: container fixo (`createPortal` em `document.body`), `aria-live="polite"` (ou `"assertive"` para `variant="destructive"`), renderiza a lista de `Toast`
- `Toast`: apresentação pura — Icon (variant) + Text (título/descrição) + Button (fechar) + Button (action opcional)

**WAI-ARIA**
- Viewport: `role="region"` + `aria-label="Notifications"`, cada toast individual com `role="status"` (ou `role="alert"` para destructive) e `aria-live` coerente
- Botão fechar: `aria-label="Close notification"`

**Ciclo TDD** (arquivos separados por responsabilidade, na ordem abaixo)

1. **RED → GREEN → BLUE** — `Toast.tsx` (componente de apresentação, sem timers/Context):
   - `it('renders title and description')`
   - `it('renders correct icon per variant')`
   - `it('calls onDismiss when close button is clicked')`
   - `it('renders action button and calls its onClick')`
   - `it('has no accessibility violations')`

2. **RED → GREEN → BLUE** — `ToastProvider.tsx` + `useToast.ts`:
   - `it('throws when useToast is used outside ToastProvider')`
   - `it('adds a toast to the queue when toast() is called')`
   - `it('removes a toast when dismiss(id) is called')`
   - `it('auto-dismisses a toast after duration elapses')` (`vi.useFakeTimers()`)
   - `it('does not auto-dismiss when duration is 0')`
   - `it('supports multiple simultaneous toasts')`

3. **RED → GREEN → BLUE** — `ToastViewport.tsx`:
   - `it('renders inside a portal on document.body')`
   - `it('renders one Toast per queued item')`
   - `it('uses role="alert" for destructive variant and role="status" otherwise')`
   - `it('has no accessibility violations')`

4. **STORY** — `Toast.stories.tsx`: story com `ToastProvider` envolvendo um botão de trigger por variante (`default`, `success`, `warning`, `destructive`, `info`), incluindo exemplo com `action` e exemplo com `duration: 0`

**Decisão de dependência:** nenhuma lib externa — timers com `setTimeout`/`vi.useFakeTimers()` nos testes, sem `react-toastify`/`sonner`.

---

## Ciclo TDD (referência do projeto, sem alterações)

```
1. RED   → Escrever *.test.tsx (todos os casos devem falhar)
2. GREEN → Implementar minimamente para os testes passarem
3. BLUE  → Refatorar sem quebrar testes
4. STORY → Escrever *.stories.tsx com todas as variantes
```

Todo arquivo de teste cobre:
- Render básico via `getByRole`/`getByTestId`
- Todas as variantes de props
- Estados (disabled, loading, error quando aplicável)
- `expect(await axe(container)).toHaveNoViolations()`
- Interações via `@testing-library/user-event`
- **Descrições de `describe`/`it` em inglês** (convenção já usada em Navbar/Dialog/etc.)

---

## Impacto em Tarefas Existentes

- **T-43 (`index.ts` exports)**: incluir `Footer`, `Toast`, `ToastProvider`, `useToast` e os tipos `FooterProps`, `ToastOptions`, `ToastVariant`, `UseToastReturn`
- **Mapeamento de Componentes (README/overview)**: atualizar contagem de Organisms de 7 → **9**

---

## Resumo de Tarefas

| Tarefa | Componente | Arquivos novos | Depende de |
|---|---|---|---|
| T-45 | Footer | `Footer.tsx/.test.tsx/.stories.tsx` | `Icon`, `Typography` (existentes) |
| T-46 | Toast | `Toast.tsx`, `ToastProvider.tsx`, `useToast.ts`, `ToastViewport.tsx` (+ testes/stories) | `Icon`, `Button` (existentes) |

---

## Verificação Final

```bash
npm test -- Footer Toast    # Novos testes passam isoladamente
npm test                    # Suíte completa (44 + novos) permanece verde
npm run storybook           # Footer e Toast documentados e interativos
```

**Checklist de conformidade:**
- Zero classes Tailwind hardcoded — apenas tokens (`bg-background`, `text-muted-foreground`, etc.)
- `jest-axe` clean em Footer, Toast, ToastProvider e ToastViewport
- `useToast` lança erro claro fora de `ToastProvider` (evita uso indevido silencioso)
- Timers de auto-dismiss limpos corretamente em unmount (sem warnings de "state update on unmounted component")
- Todas as novas interfaces exportadas via `index.ts`
