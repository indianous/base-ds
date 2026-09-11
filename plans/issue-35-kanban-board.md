# Plano: KanbanBoard — colunas + cards arrastáveis (issue #35)

## Contexto

O projeto **lead-system** precisa de uma tela de Kanban (`/leads`) com colunas por
etapa do funil (`Novo` → `Contatado` → `Proposta enviada` → `Em negociação` →
`Fechado`/`Perdido`) e cards de lead arrastáveis entre colunas. Hoje o base-ds não
tem organismo para esse padrão; o time montaria isso combinando `Card` avulso com
`dnd-kit` direto na aplicação, fora do design system.

## Decisão de dependência (confirmada com o usuário)

Adicionar `@dnd-kit/core`, `@dnd-kit/sortable` e `@dnd-kit/utilities` como
**dependencies** (não devDependencies — são usadas em runtime pelo componente).
É a primeira dependência de UI do pacote além de `clsx`/`tailwind-merge`/
`lucide-react`. Justificativa: dnd-kit dá suporte a teclado e a mouse/touch prontos
e testado, o que bate com o pedido explícito da issue ("suporte a teclado"); a
alternativa de reimplementar HTML5 DnD nativo + navegação por teclado do zero foi
descartada por ser mais código e mais superfície de bugs de acessibilidade para
manter no design system.

`tsup.config.ts` continua com `external: ['react', 'react-dom']` — dnd-kit só usa
React (sem `fs`/APIs Node), então `platform: 'browser'` não precisa de ajuste.

## API proposta

```ts
interface KanbanColumn<TCard extends { id: string }> {
  id: string
  title: string
  cards: TCard[]
}

interface KanbanBoardProps<TCard extends { id: string }> {
  columns: KanbanColumn<TCard>[]
  renderCard: (card: TCard) => ReactNode
  onCardMove: (cardId: string, fromColumnId: string, toColumnId: string, newIndex: number) => void
  getCardAriaLabel?: (card: TCard) => string // default: `Card ${card.id}`
  columnWidth?: string // classe Tailwind, ex. 'w-72'; default 'w-72'
  className?: string
}

export function KanbanBoard<TCard extends { id: string }>(
  props: KanbanBoardProps<TCard>,
): ReactElement
```

Componente genérico (como `Table`), com `<TCard,>` na assinatura para evitar
ambiguidade de JSX. Conteúdo do card é 100% do consumidor via `renderCard`
(sem prop `children` além disso, já que cada card precisa de seu próprio render).

## Estado: espelho local + callback controlado

A issue pede API controlada (`onCardMove` notifica, app decide a mutação real).
Mas dnd-kit precisa de feedback visual imediato durante o arraste (reordenar a UI
enquanto o ponteiro se move, antes do `drop`). Solução (padrão comum em exemplos
multi-container do dnd-kit):

- `KanbanBoard` mantém um estado espelho (`useState`) inicializado a partir de
  `columns` e resincronizado via `useEffect` sempre que a prop `columns` mudar
  (identidade de array nova vinda do pai).
- Durante `onDragOver`, o espelho é atualizado otimisticamente para refletir a
  posição atual do drag (cross-column incluído).
- Em `onDragEnd`, calcula-se o resultado final via uma função pura
  `computeCardMove` (ver abaixo) e chama-se `onCardMove(cardId, fromColumnId,
toColumnId, newIndex)` — a store real fica por conta do app, que deve
  devolver `columns` atualizado por props (fechando o ciclo controlado).

## Função pura `computeCardMove` (exportada só para teste, não no índice público)

```ts
function computeCardMove<TCard extends { id: string }>(
  columns: KanbanColumn<TCard>[],
  cardId: string,
  fromColumnId: string,
  toColumnId: string,
  newIndex: number,
): KanbanColumn<TCard>[]
```

Isola a lógica de "remover de uma coluna e inserir em outra índice X" de toda a
maquinaria do dnd-kit, o que permite testar os casos de borda (reordenar dentro da
mesma coluna, mover para o fim, mover para coluna vazia) sem depender de simulação
de drag no jsdom.

## Drag handle e acessibilidade

- Cada card recebe um handle dedicado (botão com ícone `GripVertical` do
  lucide-react) — `{...attributes}`/`{...listeners}` do `useSortable` vão **só**
  no handle, não no card inteiro, para o conteúdo do card continuar selecionável/
  clicável normalmente.
- `KeyboardSensor` com `sortableKeyboardCoordinates` habilita mover com teclado
  (Space para pegar, setas para mover, Space para soltar, Esc para cancelar —
  comportamento padrão do dnd-kit).
- Cada coluna é um `useDroppable` (contêiner) envolvendo um `SortableContext`
  (`verticalListSortingStrategy`) dos seus cards — necessário mesmo com 0 cards,
  para aceitar drop em coluna vazia.
- `DragOverlay` para o preview flutuante durante drag por ponteiro.
- `aria-label` do handle via `getCardAriaLabel` (default `Card ${card.id}`).
- Cabeçalho de coluna mostra `title` + contagem (`cards.length`).

## Arquivos afetados

- `package.json` — novas dependencies.
- `src/components/organisms/KanbanBoard/KanbanBoard.tsx`
- `src/components/organisms/KanbanBoard/KanbanBoard.stories.tsx`
- `src/components/organisms/KanbanBoard/KanbanBoard.test.tsx`
- `src/index.ts` — exporta `KanbanBoard`, `KanbanBoardProps`, `KanbanColumn`.

## Casos de teste (TDD — escrever antes da implementação)

1. Renderiza título e contagem de cada coluna a partir de `columns`.
2. `renderCard` é chamado para cada card e o conteúdo retornado aparece dentro da
   coluna correta.
3. Coluna sem cards renderiza sem quebrar, com contagem 0.
4. `computeCardMove`: reordenar dentro da mesma coluna (índice 0 → 2 em 3 itens).
5. `computeCardMove`: mover card para outra coluna, índice no meio.
6. `computeCardMove`: mover card para o fim de uma coluna vazia (newIndex 0).
7. Handle de drag tem `role="button"`, é focável e tem `aria-label` derivado de
   `getCardAriaLabel` (ou default).
8. Nenhuma violação de acessibilidade (`jest-axe`) no board renderizado (múltiplas
   colunas, cards e coluna vazia).
9. Integração de teclado (pegar card com Space, mover com seta, soltar com Space)
   disparando `onCardMove` com os argumentos esperados — tentativa real com
   `KeyboardSensor` + jsdom, mockando `Element.prototype.getBoundingClientRect`
   (dnd-kit depende de medições de rect). **Risco assumido**: se isso se provar
   instável em jsdom, o teste será restrito a verificar que o handle responde ao
   evento de teclado (`keydown` Space não lança erro) e a integração completa fica
   validada manualmente no Storybook — vou reportar qual caminho foi seguido ao
   final da implementação em vez de simplesmente pular o teste em silêncio.

Todas as descrições de teste em inglês.

## Stories

- Default: colunas do funil (`Novo`, `Contatado`, `Proposta enviada`, `Em
negociação`, `Fechado`, `Perdido`) com cards de exemplo (nome do lead, tipo,
  canal, score) usando `Avatar`/`Badge`/`Typography` já existentes via
  `renderCard`.
- Coluna vazia.
- Muitos cards por coluna / scroll horizontal do board com `columnWidth` fixo.

## Fora de escopo

- Persistência real / chamada de API (fica com a aplicação via `onCardMove`).
- Múltiplos boards, swimlanes, filtros/ordenação de cards.
- Drag entre boards diferentes.

## Passos de implementação

1. `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`.
2. Testes de renderização estática (casos 1–3, 7, 8) — falhando.
3. Implementar render estático de colunas/cards (sem DnD ainda) até esses testes
   passarem.
4. Testes de `computeCardMove` (casos 4–6) — falhando; implementar a função.
5. Integrar dnd-kit (`DndContext`, sensors, `SortableContext`, `useDroppable`,
   `useSortable`, `DragOverlay`) usando `computeCardMove` no `onDragEnd`.
6. Tentar o teste de integração por teclado (caso 9); ajustar conforme resultado.
7. Stories.
8. Exportar em `src/index.ts`.
9. `npm test`, `npm run lint`, `npm run build`.
