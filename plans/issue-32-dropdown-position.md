# Issue #32 — DropdownMenu: opção de abrir para cima (`position`)

Link: https://github.com/(repo)/issues/32

## Problema

`DropdownMenu` sempre abre o painel abaixo do trigger (`top-full mt-1`, hardcoded em
`DropdownMenu.tsx:119`). Não existe forma de abrir para cima. Isso quebra o caso de uso do
`SidebarAvatar` no `ecommerce`, que fica fixado no rodapé da sidebar e não tem espaço abaixo.

## Solução proposta (atualizada: 4 direções)

A issue pedia só `top`/`bottom`, mas foi decidido cobrir os 4 lados para dar a mesma flexibilidade
que `Tooltip` já tem. Reaproveitar o tipo `TooltipSide` existente em `src/utils/tooltipPosition.ts`
(`'top' | 'bottom' | 'left' | 'right'`) em vez de criar um union novo — evita duplicar o conceito de
"lado" que já existe no design system.

Adicionar prop `position?: TooltipSide` (default `'bottom'`, preservando o comportamento atual).

Sem detecção automática de espaço/flip (o que `Tooltip` faz via `notEnoughSpace`) — fora de escopo;
a prop é só explícita.

### Papel de `align` conforme `position`

`align` continua controlando o eixo perpendicular ao `position`, seguindo a convenção comum de
popover (side + align ortogonais, como Radix):

- `position` = `'top' | 'bottom'` → `align` controla o eixo **horizontal** (`start` = `left-0`,
  `end` = `right-0`) — comportamento atual, inalterado.
- `position` = `'left' | 'right'` → `align` controla o eixo **vertical** (`start` = `top-0`,
  `end` = `bottom-0`).

### Mudança de classes

Em `DropdownMenu.tsx`, o painel é posicionado via `absolute` dentro do container `relative
inline-block` (sem portal, diferente do `Tooltip` que usa coordenadas calculadas via
`getBoundingClientRect`). Dá para resolver tudo com lookup tables de classes Tailwind, seguindo a
convenção do repo (`Record<Variant, string>` + `cn()`).

```tsx
const sideClass: Record<TooltipSide, string> = {
  top: 'bottom-full mb-1',
  bottom: 'top-full mt-1',
  left: 'right-full mr-1',
  right: 'left-full ml-1',
}

const isVerticalSide = position === 'top' || position === 'bottom'

const alignClass = isVerticalSide
  ? align === 'end'
    ? 'right-0'
    : 'left-0'
  : align === 'end'
    ? 'bottom-0'
    : 'top-0'
```

```tsx
className={cn(
  'absolute z-20 min-w-[10rem] rounded-md border border-border bg-background py-1 shadow-md',
  sideClass[position],
  alignClass,
)}
```

### Assinatura

```tsx
import type { TooltipSide } from '../../../utils/tooltipPosition'

export interface DropdownMenuProps {
  trigger: ReactElement
  items: DropdownMenuItem[]
  align?: 'start' | 'end'
  position?: TooltipSide
  onOpenChange?: (open: boolean) => void
  className?: string
}
```

```tsx
export function DropdownMenu({
  trigger,
  items,
  align = 'start',
  position = 'bottom',
  onOpenChange,
  className,
}: DropdownMenuProps) {
```

## TDD — testes primeiro (`DropdownMenu.test.tsx`)

Descrições em inglês, seguindo convenção do repo. Adicionar antes da implementação (devem falhar
com o código atual, que sempre usa `top-full`/`left-0`):

1. `'opens below the trigger by default'` — sem prop `position`, `getByRole('menu')` tem
   `toHaveClass('top-full')`.
2. `'opens above the trigger when position="top" is set'` — `toHaveClass('bottom-full')`, não tem
   `top-full`.
3. `'opens to the left of the trigger when position="left" is set'` —
   `toHaveClass('right-full')`.
4. `'opens to the right of the trigger when position="right" is set'` —
   `toHaveClass('left-full')`.
5. `'aligns vertically with align="end" when position is left or right'` — renderiza com
   `position="left" align="end"`, verifica `toHaveClass('bottom-0')`.

## Storybook

Adicionar uma story `Positions` mostrando os 4 lados lado a lado (ex.: grid com um `DropdownMenu`
por posição, cada um com espaço suficiente ao redor para não estourar a viewport do Storybook):

```tsx
export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-16 p-16">
      {(['top', 'bottom', 'left', 'right'] as const).map((position) => (
        <DropdownMenu
          key={position}
          trigger={<Button>{position}</Button>}
          position={position}
          items={[
            { label: 'Edit', onClick: () => {} },
            { label: 'Duplicate', onClick: () => {} },
          ]}
        />
      ))}
    </div>
  ),
}
```

## Arquivos afetados

- `src/components/molecules/DropdownMenu/DropdownMenu.tsx` — prop `position` (`TooltipSide`),
  lookup tables `sideClass`/`alignClass`.
- `src/components/molecules/DropdownMenu/DropdownMenu.test.tsx` — 5 novos testes.
- `src/components/molecules/DropdownMenu/DropdownMenu.stories.tsx` — story `Positions`.

`src/index.ts` não precisa mudar (componente já exportado; só o shape da prop muda).
`TooltipSide` já é exportado de `src/utils/tooltipPosition.ts` — sem export novo necessário ali,
mas talvez precise ser re-exportado de `DropdownMenu.tsx` ou já esteja acessível via
`src/index.ts` (verificar durante implementação se `TooltipSide` está no barrel export).

## Fora de escopo

- Auto-flip por espaço disponível na viewport (como `Tooltip` faz) — não pedido.
- Mudanças no `ecommerce` (`SidebarAvatar.tsx`) — fora deste repo.

## Passos de execução

1. Escrever os 5 testes novos em `DropdownMenu.test.tsx` (devem falhar).
2. Rodar `npm test` para confirmar a falha.
3. Implementar a prop `position` em `DropdownMenu.tsx` (reaproveitando `TooltipSide`).
4. Rodar `npm test` até passar.
5. Adicionar story `Positions`.
6. Rodar `npm run lint` e `npm run build`.
7. Commit em português.
