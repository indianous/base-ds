# 0002 — Escape só fecha o overlay do topo (issue #30)

Status: aguardando confirmação

## Contexto

`Dialog` (`src/components/organisms/Dialog/Dialog.tsx`) registra um listener
global de `keydown` para Escape sempre que `open=true`, chamando `onClose` —
sem nenhuma coordenação entre instâncias. Quando dois `Dialog` estão abertos
ao mesmo tempo (ex.: confirmação de exclusão de banner aberta por cima do
dialog "Gerenciar banners", caso real do projeto `ecommerce`), apertar
Escape dispara os dois listeners e fecha os dois de uma vez — o usuário
perde o dialog de baixo mesmo só querendo cancelar a confirmação.

Issue: https://github.com/indianous/base-ds/issues/30

## Diagnóstico

`Drawer.tsx` tem o **bug idêntico** — o mesmo bloco de `useEffect` +
`document.addEventListener('keydown', ...)`, copiado sem nenhuma
coordenação entre instâncias. Como `Drawer` também é usado no projeto
`ecommerce` (menu de navegação mobile) e pode plausivelmente conviver com
um `Dialog` de confirmação por cima, faz sentido corrigir os dois com o
mesmo mecanismo — é a mesma causa raiz, não uma feature nova.

Não existe hoje no repo nenhum registro/pilha de overlays, contexto de
"topmost" ou utilitário reaproveitável para isso — precisa ser criado.

Outros componentes que também registram `keydown` global para Escape —
`Tooltip`, `Button` (tooltip embutido do icon-only), `FilterDropdown` e
`ImageGallery` (overlay de zoom) — tinham sido deixados de fora numa
primeira versão deste plano por serem semanticamente diferentes de um
modal bloqueante. **Escopo ampliado a pedido do usuário**: todos sofrem
da mesma causa raiz (listener de `keydown` independente, sem checar se é
o overlay do topo) e um cenário real dispara o mesmo bug — ex.: passar o
mouse num ícone com tooltip _dentro_ de um `Dialog` aberto e apertar
Escape hoje fecha o Dialog inteiro junto com o tooltip, quando o
esperado é fechar só o tooltip. Ver seção "Mudanças" abaixo para o
tratamento específico de cada um.

Também identificado: `useBodyScrollLock` (usado por `Dialog` e `Drawer`)
não é stack-aware — se dois dialogs empilhados fecham fora de ordem, o
`overflow` do `body` pode ser restaurado incorretamente. Hoje é "benigno
por sorte de ordem" (não reportado como bug). **Fora do escopo desta
issue** — registrar como risco conhecido, não corrigir agora.

## Solução: hook compartilhado `useStackedEscape`

Registro em pilha module-level (sem exigir um `Provider` — mantém o
padrão do design system de "solta o componente em qualquer lugar", sem
forçar consumidores a envolver a app). Cada instância recebe um token
estável (`useRef(Symbol())`), empilha o token quando abre, desempilha ao
fechar/desmontar. No `keydown`, cada instância verifica se o próprio
token é o topo da pilha antes de chamar `onClose` — funciona
independentemente da ordem de registro dos listeners, sem precisar de
`stopPropagation`.

`src/utils/useStackedEscape.ts`:

```ts
import { useEffect, useRef } from 'react'

let stack: symbol[] = []

export function useStackedEscape(open: boolean, onClose: () => void) {
  const tokenRef = useRef(Symbol())
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const token = tokenRef.current
    stack.push(token)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (stack[stack.length - 1] !== token) return
      onCloseRef.current()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      stack = stack.filter((t) => t !== token)
    }
  }, [open])
}
```

`onClose` fica numa ref (atualizada a cada render, fora do efeito) para
que o efeito dependa só de `[open]` — evita reempilhar/desempilhar o
token a cada re-render quando o consumidor passa uma arrow function
inline como `onClose` (o `Dialog`/`Drawer` atuais tinham `onClose` nas
deps do efeito, o que já causava esse churn desnecessário).

## Mudanças em Dialog.tsx e Drawer.tsx

Substituir o bloco local:

```ts
useEffect(() => {
  if (!open) return
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [open, onClose])
```

por:

```ts
useStackedEscape(open, onClose)
```

em ambos os arquivos (import de `../../../utils/useStackedEscape`).

## Mudanças em Tooltip.tsx, Button.tsx, FilterDropdown.tsx e ImageGallery.tsx

**`Tooltip.tsx`** — troca o bloco:

```ts
useEffect(() => {
  if (!visible) return
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') hide()
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [visible])
```

por `useStackedEscape(visible, hide)`.

**`Button.tsx`** (tooltip embutido do `iconOnly`) — troca:

```ts
useEffect(() => {
  if (!showTooltip || !tooltipVisible) return
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setTooltipVisible(false)
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [showTooltip, tooltipVisible])
```

por `useStackedEscape(showTooltip && tooltipVisible, () => setTooltipVisible(false))`.

**`FilterDropdown.tsx`** — o efeito atual mistura clique-fora (`mousedown`)
com Escape no mesmo `useEffect`. Precisa ser separado: o listener de
`mousedown` continua num `useEffect` próprio (comportamento inalterado);
o Escape sai desse efeito e vira uma chamada a
`useStackedEscape(open, closeAndFocusTrigger)`. Resultado (substituindo o
efeito único de hoje por dois):

```ts
useEffect(() => {
  if (!open) return
  const handlePointerDown = (e: MouseEvent) => {
    const target = e.target as Node
    const insideTrigger = triggerRef.current?.contains(target)
    const insidePanel = panelRef.current?.contains(target)
    if (!insideTrigger && !insidePanel) setOpen(false)
  }
  document.addEventListener('mousedown', handlePointerDown)
  return () => document.removeEventListener('mousedown', handlePointerDown)
}, [open])

useStackedEscape(open, closeAndFocusTrigger)
```

**`ImageGallery.tsx`** — o efeito atual mistura Escape com navegação por
seta (`ArrowLeft`/`ArrowRight`) no mesmo `useEffect`. Mesmo tratamento:
separar. Navegação por seta continua com listener próprio, inalterada
(não faz parte do bug de stacking); Escape sai e vira
`useStackedEscape(zoomOpen, () => setZoomOpen(false))`:

```ts
useEffect(() => {
  if (!zoomOpen) return
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goPrev()
    if (e.key === 'ArrowRight') goNext()
  }
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [zoomOpen])

useStackedEscape(zoomOpen, () => setZoomOpen(false))
```

## TDD — ordem de escrita dos testes

**`src/utils/useStackedEscape.test.ts`** (novo, via `renderHook` de
`@testing-library/react`, mesmo padrão de `useBodyScrollLock.test.ts`):

1. chama `onClose` ao pressionar Escape com uma única instância aberta
2. não chama `onClose` quando `open=false`
3. com duas instâncias montadas (a segunda aberta depois da primeira),
   Escape chama `onClose` só da mais recente (topo da pilha)
4. após desmontar/fechar a instância do topo, a próxima chamada de Escape
   aciona a instância que ficou por baixo
5. remove seu token da pilha ao desmontar (verificável indiretamente:
   reabrir a primeira instância depois da segunda desmontar volta a
   responder ao Escape)

**`Dialog.test.tsx`** (adicionar aos testes existentes):

6. com dois `Dialog` renderizados abertos ao mesmo tempo (um nas
   `children` do outro, cada um com seu próprio `onClose`), Escape chama
   só o `onClose` do de dentro
7. depois que o de dentro fecha (`open={false}` num rerender, simulando
   clique em "Cancelar"), Escape volta a chamar o `onClose` do de fora

**`Drawer.test.tsx`** (mesmo par de casos 6/7, adaptado para `Drawer`)

**Verificação cruzada** (dentro de `useStackedEscape.test.ts`, não
precisa ser componente real): duas instâncias do hook representando
tipos diferentes de overlay coordenam pela mesma pilha módulo-level —
prova de que a correção é um mecanismo compartilhado, não algo local a
`Dialog`.

**Testes de integração entre tipos diferentes de overlay** (o cenário
que motivou ampliar o escopo — um tooltip/dropdown/zoom aberto _dentro_
de um `Dialog`):

8. `Tooltip.test.tsx` — `Tooltip` envolvendo um botão, renderizado dentro
   das `children` de um `Dialog` aberto; mostra o tooltip (hover/focus),
   aperta Escape uma vez → só o tooltip esconde, `onClose` do `Dialog`
   não é chamado; aperta Escape de novo → agora `onClose` do `Dialog` é
   chamado.
9. `Button.test.tsx` — mesmo caso 8, mas com o tooltip embutido de um
   `Button iconOnly` dentro do `Dialog` (hover mostra o tooltip via
   `aria-label`, Escape fecha só o tooltip primeiro).
10. `FilterDropdown.test.tsx` — `FilterDropdown` aberto dentro das
    `children` de um `Dialog` aberto; Escape fecha só o painel do filtro
    primeiro (mantendo o `Dialog` aberto, `onClose` não chamado); Escape
    de novo fecha o `Dialog`.
11. `ImageGallery.test.tsx` — `ImageGallery` com o overlay de zoom aberto
    dentro de um `Dialog` aberto; Escape fecha só o zoom primeiro, depois
    o `Dialog`. Mais um teste de regressão: com o zoom aberto,
    `ArrowLeft`/`ArrowRight` continuam navegando normalmente (não fazem
    parte do stacking, comportamento inalterado).

## Stories

`Dialog.stories.tsx` — nova story `Stacked`: dialog "Gerenciar banners"
com um botão que abre um segundo `Dialog` de confirmação por cima
(replica o caso real do `ecommerce`), pra validar visualmente que Escape
fecha só o de confirmação.

## Verificação

```
npm run lint
npm test
npm run build
```

## Arquivos afetados

- `src/utils/useStackedEscape.ts` (novo)
- `src/utils/useStackedEscape.test.ts` (novo)
- `src/components/organisms/Dialog/Dialog.tsx` (troca o efeito local pelo hook)
- `src/components/organisms/Dialog/Dialog.test.tsx` (2 testes novos)
- `src/components/organisms/Dialog/Dialog.stories.tsx` (story `Stacked`)
- `src/components/organisms/Drawer/Drawer.tsx` (troca o efeito local pelo hook)
- `src/components/organisms/Drawer/Drawer.test.tsx` (2 testes novos)
- `src/components/molecules/Tooltip/Tooltip.tsx` (troca o efeito local pelo hook)
- `src/components/molecules/Tooltip/Tooltip.test.tsx` (1 teste de integração com Dialog)
- `src/components/atoms/Button/Button.tsx` (troca o efeito local pelo hook, tooltip icon-only)
- `src/components/atoms/Button/Button.test.tsx` (1 teste de integração com Dialog)
- `src/components/molecules/FilterDropdown/FilterDropdown.tsx` (separa mousedown/Escape, troca Escape pelo hook)
- `src/components/molecules/FilterDropdown/FilterDropdown.test.tsx` (1 teste de integração com Dialog)
- `src/components/organisms/ImageGallery/ImageGallery.tsx` (separa Arrow/Escape, troca Escape pelo hook)
- `src/components/organisms/ImageGallery/ImageGallery.test.tsx` (1 teste de integração com Dialog + regressão de Arrow keys)
