# 0001 — FilterDropdown (issue #29)

Status: aguardando confirmação

## Contexto

O projeto `ecommerce` está padronizando os filtros de lista do dashboard (status
de pedido, categoria de produto, tipo/ação de auditoria, motivo de movimentação
de estoque, etc.) para permitir seleção de múltiplos valores no padrão "filtro
de coluna do Excel": um trigger compacto (nome do filtro + contador) que abre
um checklist em popover com "Selecionar todos"/"Limpar" e um botão "Aplicar"
que só então confirma a seleção — fechar sem aplicar descarta as mudanças.

O componente mais próximo hoje é o `MultiSelect`, mas ele aplica a seleção
imediatamente (sem passo de "Aplicar") e mostra os selecionados como badges
que crescem dentro do próprio campo — não serve como filtro compacto numa
barra com vários filtros lado a lado. Vamos criar um componente novo,
`FilterDropdown`, em vez de adaptar o `MultiSelect`.

Issue: https://github.com/indianous/base-ds/issues/29

## Onde fica

`src/components/molecules/FilterDropdown/` — `FilterDropdown.tsx` +
`FilterDropdown.stories.tsx` + `FilterDropdown.test.tsx`. Molécula, pois
depende só de átomos (`Button`, `Checkbox`, `Icon`, `Badge`).

## API

```ts
export interface FilterDropdownOption {
  value: string
  label: string
}

export interface FilterDropdownProps {
  label: string
  options: FilterDropdownOption[]
  value: string[]
  onApply: (next: string[]) => void
  align?: 'start' | 'end'
  disabled?: boolean
  className?: string
}
```

Sem prop `id` (diferente do `MultiSelect`) — o trigger é auto-contido (um
`Button`), todos os ids internos vêm de `useId()`, como em `DropdownMenu` e
`Tooltip`.

## Comportamento central (diferença chave em relação ao MultiSelect)

- Estado interno `draft: string[]`, reiniciado a partir de `value` toda vez
  que o popover abre:
  ```ts
  useEffect(() => {
    if (!open) return
    setDraft(value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  ```
- Toggle de checkbox, "Selecionar todos" e "Limpar" só alteram `draft` —
  nunca chamam `onApply`.
- "Aplicar" chama `onApply(draft)` e fecha o popover.
- Fechar por clique fora ou Escape apenas fecha (`setOpen(false)`), sem
  chamar `onApply`. Como `draft` é resetado a partir de `value` na próxima
  abertura, isso já descarta a mudança — não precisa de lógica de reversão
  explícita.

## Posicionamento do popover — decisão confirmada: portal + fixed

Existem dois padrões no repo:

- `DropdownMenu`/`MultiSelect`: `relative`/`absolute`, sem portal.
- `Tooltip`/`Button` icon-only: `createPortal` para `document.body` +
  `position: fixed`, recalculado em scroll/resize — implementado para
  corrigir a issue #22 (tooltip cortado por `overflow-hidden` de
  ancestrais).

Como o `FilterDropdown` será usado em barras de filtro/toolbars, que
tendem a estar dentro de cards ou headers com `overflow-hidden`, seguimos o
padrão do `Tooltip` (**confirmado com o usuário**) em vez de reproduzir o
bug já corrigido uma vez.

Implementação:

- Exportar `VIEWPORT_MARGIN = 40` de `src/utils/tooltipPosition.ts` (hoje é
  uma const local duplicada em três arquivos).
- Novo arquivo `src/utils/dropdownPosition.ts`:
  ```ts
  import { VIEWPORT_MARGIN } from './tooltipPosition'

  const GAP = 4 // mesmo espaçamento do mt-1 usado por DropdownMenu/MultiSelect

  export type DropdownAlign = 'start' | 'end'

  export interface DropdownCoords {
    left: number
    top?: number
    bottom?: number
  }

  export function computeDropdownCoords(
    rect: DOMRect,
    panelWidth: number,
    align: DropdownAlign,
  ): DropdownCoords {
    const notEnoughSpaceBelow = window.innerHeight - rect.bottom < VIEWPORT_MARGIN
    const notEnoughSpaceRight = rect.left + panelWidth > window.innerWidth - VIEWPORT_MARGIN
    const resolvedAlign: DropdownAlign = notEnoughSpaceRight ? 'end' : align
    const left = resolvedAlign === 'end' ? rect.right - panelWidth : rect.left

    return notEnoughSpaceBelow
      ? { left, bottom: window.innerHeight - rect.top + GAP }
      : { left, top: rect.bottom + GAP }
  }
  ```
  Ao inverter para cima, ancoramos com `bottom` em vez de `top` — evita
  medir a altura do painel antecipadamente (sem duas passadas, sem flash).
  A largura do painel é uma constante conhecida (classe Tailwind fixa, ex.
  `w-72` → `PANEL_WIDTH = 288`).
- Em `FilterDropdown.tsx`, recalcular coords num `useEffect` disparado por
  `open`, escutando `scroll` (capture: true) e `resize`, no mesmo padrão de
  `Tooltip.tsx`/`Button.tsx`.
- Como `Button` não é `forwardRef`, o trigger é envolvido num
  `<span ref={triggerRef} className="inline-block">` (mesmo truque do
  `Tooltip.tsx`), medido via `getBoundingClientRect()`.

## Outside click / Escape

Como o painel é portal (não é mais descendente do container `relative`),
o outside-click precisa checar dois refs:

```ts
useEffect(() => {
  if (!open) return
  const handlePointerDown = (e: MouseEvent) => {
    const target = e.target as Node
    const insideTrigger = triggerRef.current?.contains(target)
    const insidePanel = panelRef.current?.contains(target)
    if (!insideTrigger && !insidePanel) setOpen(false)
  }
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeAndFocusTrigger()
  }
  document.addEventListener('mousedown', handlePointerDown)
  document.addEventListener('keydown', handleKeyDown)
  return () => {
    document.removeEventListener('mousedown', handlePointerDown)
    document.removeEventListener('keydown', handleKeyDown)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [open])
```

`closeAndFocusTrigger` fecha e devolve foco ao botão do trigger (via
`triggerRef.current?.querySelector('button')?.focus()`, mesma técnica do
`DropdownMenu.tsx`).

## Acessibilidade

A issue sugere `role="listbox"`/checkbox por opção, mas essa combinação não
é uma composição ARIA válida (checkbox nativo + `role="option"` provavelmente
reprova no `jest-axe`). Em vez disso:

- Trigger (`Button`): `type="button"`, `aria-haspopup="true"`,
  `aria-expanded={open}`, `aria-controls={open ? panelId : undefined}`,
  `disabled`.
- Painel: sem `role` especial (não é modal — fecha em clique fora, então
  `role="dialog"` seria enganoso).
- Lista de checkboxes: `<div role="group" aria-label={label}>` envolvendo os
  `Checkbox` — padrão já usado no repo (`PinInput.tsx`).
- Badge de contagem: `<Badge variant="primary" size="sm">{value.length}</Badge>`,
  renderizado só quando `value.length > 0`.

## Esboço JSX

```tsx
;<span ref={triggerRef} className={cn('inline-block', className)}>
  <Button
    type="button"
    variant="outline"
    size="sm"
    disabled={disabled}
    aria-haspopup="true"
    aria-expanded={open}
    aria-controls={open ? panelId : undefined}
    rightIcon={<Icon name="ChevronDown" size="sm" />}
    onClick={() => setOpen((o) => !o)}
  >
    {label}
    {value.length > 0 && (
      <Badge variant="primary" size="sm" className="ml-1">
        {value.length}
      </Badge>
    )}
  </Button>
</span>

{
  open &&
    coords &&
    !disabled &&
    createPortal(
      <div
        ref={panelRef}
        id={panelId}
        style={{ position: 'fixed', left: coords.left, top: coords.top, bottom: coords.bottom }}
        className="z-20 w-72 rounded-md border border-border bg-background shadow-md"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <Button type="button" variant="ghost" size="sm" onClick={handleSelectAll}>
            Selecionar todos
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            Limpar
          </Button>
        </div>

        <div
          role="group"
          aria-label={label}
          className="flex max-h-60 flex-col gap-2 overflow-y-auto px-3 py-2"
        >
          {options.map((opt) => (
            <Checkbox
              key={opt.value}
              id={`${baseId}-option-${opt.value}`}
              label={opt.label}
              checked={draft.includes(opt.value)}
              onChange={() => toggleDraftOption(opt.value)}
            />
          ))}
        </div>

        <div className="border-t border-border px-3 py-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleApply}
          >
            Aplicar
          </Button>
        </div>
      </div>,
      document.body,
    )
}
```

## TDD — ordem de escrita dos testes (FilterDropdown.test.tsx)

Cada item abaixo deve ser escrito como teste falho antes da implementação
que o faz passar, na ordem:

1. renderiza o botão trigger com o `label`, sem badge de contagem quando
   `value` é `[]`
2. renderiza badge de contagem com `value.length` quando `value` não é vazio
3. não renderiza o checklist/painel antes do clique no trigger
4. abre o painel ao clicar no trigger; um `Checkbox` por opção
   (`getAllByRole('checkbox')`)
5. checkboxes refletem `value` como marcados na abertura
6. marcar um checkbox NÃO chama `onApply`
7. "Selecionar todos" marca todos sem chamar `onApply`
8. "Limpar" desmarca todos sem chamar `onApply`
9. clicar em "Aplicar" chama `onApply` com a seleção em progresso e fecha
   o painel
10. fechar por clique fora descarta mudanças — `onApply` nunca é chamado;
    reabrir mostra `value` original ainda marcado
11. fechar por Escape descarta mudanças da mesma forma, `onApply` nunca
    chamado
12. Escape devolve foco ao botão trigger (`toHaveFocus()`)
13. `aria-expanded` alterna `false`→`true` no trigger
14. `disabled` impede abrir o painel
15. `jest-axe`: sem violações fechado e sem violações aberto

## Stories (FilterDropdown.stories.tsx)

- `Default` — wrapper controlado (`ControlledFilterDropdown`, `useState` +
  `onApply={setValue}`, mesmo padrão do `ControlledMultiSelect`)
- `WithSelection` — `value` inicial não vazio, mostrando o badge
- `Empty` — sem seleção inicial
- `Disabled`
- `AlignEnd` — demonstra `align="end"`
- `InOverflowContainer` — envolve o componente num container estreito com
  `overflow-hidden`, prova visual de que o painel não é cortado (guarda de
  regressão direta para a decisão de portal, dado o histórico da issue #22)

## Wiring em src/index.ts

Inserir em ordem alfabética entre `FileUpload` e `FormField`:

```ts
export { FilterDropdown } from './components/molecules/FilterDropdown/FilterDropdown'
export type {
  FilterDropdownProps,
  FilterDropdownOption,
} from './components/molecules/FilterDropdown/FilterDropdown'
```

## Verificação

Nesta ordem, corrigindo qualquer falha antes de considerar concluído:

```
npm run lint
npm test
npm run build
```

`npm run test:stories` não é necessário — nenhuma molécula interativa do
repo (`MultiSelect`, `DropdownMenu`, `Tooltip`) usa `play functions`; a
cobertura de interação fica só em `.test.tsx`.

## Arquivos afetados

- `src/components/molecules/FilterDropdown/FilterDropdown.tsx` (novo)
- `src/components/molecules/FilterDropdown/FilterDropdown.test.tsx` (novo)
- `src/components/molecules/FilterDropdown/FilterDropdown.stories.tsx` (novo)
- `src/utils/dropdownPosition.ts` (novo)
- `src/utils/tooltipPosition.ts` (exportar `VIEWPORT_MARGIN`)
- `src/index.ts` (wiring)
