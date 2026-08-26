# Plano: Sidebar — agrupamento de itens por categoria (issue #34)

## Contexto

`Sidebar` (`src/components/organisms/Sidebar/Sidebar.tsx`) renderiza `items` num único
`<ul role="list">`, sem qualquer separação visual entre categorias. O consumidor
`ecommerce` precisa agrupar itens de navegação (Vendas, Catálogo, Pessoas, Sistema) em
menus que cresceram para 12–14 itens, e hoje só conseguiria fazer isso reimplementando
a navegação inteira fora do design system (o `Sidebar` já é dono do `<nav>`, incluindo o
toggle de colapsar).

## Decisão de API

Campo opcional `group?: string` em `SidebarItem` — não uma prop `groups` paralela.

- Um cabeçalho de grupo é inserido antes de cada sequência **contígua** de itens que
  compartilham o mesmo `group`. Se o mesmo nome de grupo aparecer em dois blocos não
  contíguos (intercalado com outro grupo), cada bloco contíguo recebe seu próprio
  cabeçalho — não há "merge" de grupos não adjacentes. Isso é intencional: a semântica é
  posicional (deriva da ordem do array), não uma alocação prévia de buckets.
- Itens sem `group` continuam renderizando normalmente, sem cabeçalho, em qualquer
  posição (início, meio ou fim da lista, misturados com itens agrupados).
- Grupo vazio resolve-se sozinho: como a presença do cabeçalho deriva dos itens
  recebidos (não de uma lista de grupos declarada à parte), se um consumidor filtra
  `items` por permissão e nenhum item de um grupo sobra, o cabeçalho correspondente
  simplesmente não é gerado — nenhuma lógica adicional necessária no app consumidor.
- Em modo `collapsed` (`w-14`), o texto do cabeçalho vira `sr-only`, replicando a
  convenção já usada para `label` do item (linhas 61-65 atuais).

## Estilo do cabeçalho de grupo

Reaproveitar a convenção já existente em `Navbar.tsx:87` para cabeçalho de subgrupo
mobile: `text-xs font-semibold uppercase text-muted-foreground`, adaptando o
espaçamento ao padding do `Sidebar` (`px-2`, já usado no `<ul>`) em vez do `px-3 py-1.5`
do Navbar.

Proposta de classes: `px-2 pt-3 pb-1 text-xs font-semibold uppercase text-muted-foreground`
(o primeiro cabeçalho da lista não deveria ter esse `pt-3` "extra" gerando espaço
duplicado com o padding do container — ver nota de implementação abaixo).

## Estrutura de renderização

Hoje: um único `<ul>` com um `<li>` por item.

Nova estrutura: continuar com um único `<ul role="list">` (não trocar por múltiplos
`<ul>`s por grupo — manter a lista como uma única lista semântica para leitores de
tela, já que os cabeçalhos de grupo não são itens de navegação). O cabeçalho de grupo
é injetado como um `<li>` adicional (sem `role="listitem"` explícito necessário, herda
do `<li>`) logo antes do primeiro item de cada bloco contíguo, contendo um `<span>`
(ou heading semântico — ver decisão abaixo) em vez do conteúdo de item normal.

Alternativa considerada e descartada: renderizar o cabeçalho fora do `<li>`, direto no
`<ul>`. Rejeitada porque filho direto de `<ul>` que não é `<li>` é inválido em HTML e
quebra a semântica de lista para leitores de tela.

### Elemento semântico do cabeçalho

Usar `<span>` simples (não heading `<h3>` etc.), consistente com o padrão já usado no
`Navbar.tsx:87` para o mesmo tipo de cabeçalho de agrupamento em navegação. Isso evita
introduzir uma hierarquia de headings dentro de uma `<nav>` que não tem headings hoje.

## Lógica de agrupamento

Pré-processar `items` num array de "linhas de renderização" antes do `.map()`:

```ts
type SidebarRow =
  { type: 'header'; group: string; key: string } | { type: 'item'; item: SidebarItem; key: string }

function buildRows(items: SidebarItem[]): SidebarRow[] {
  const rows: SidebarRow[] = []
  let previousGroup: string | undefined
  items.forEach((item, index) => {
    if (item.group !== undefined && item.group !== previousGroup) {
      rows.push({ type: 'header', group: item.group, key: `group-${index}` })
    }
    rows.push({ type: 'item', item, key: String(index) })
    previousGroup = item.group
  })
  return rows
}
```

Isso resolve contiguidade automaticamente: um novo cabeçalho só é emitido quando o
`group` do item atual difere do `group` do item anterior (incluindo a transição
`undefined -> 'X'` e `'X' -> undefined`, que não gera cabeçalho para o lado
`undefined`).

## Arquivos afetados

- `src/components/organisms/Sidebar/Sidebar.tsx` — adicionar campo `group?: string` à
  interface `SidebarItem`; adicionar função/lógica de agrupamento; renderizar
  cabeçalho de grupo como `<li>` intercalado.
- `src/components/organisms/Sidebar/Sidebar.test.tsx` — novos testes (ver abaixo).
- `src/components/organisms/Sidebar/Sidebar.stories.tsx` — nova story demonstrando
  itens agrupados (ex. replicando o exemplo da issue: Vendas/Catálogo + item solto).

Nenhuma mudança em `src/index.ts` é necessária — `Sidebar` e `SidebarItem` (se já
exportados) continuam com a mesma assinatura de export, só ganham um campo opcional.
Verificar durante a implementação se `SidebarItem` já é exportado como tipo público; se
sim, o novo campo já flui automaticamente.

## Casos de teste (TDD — escrever antes da implementação)

1. Cabeçalho de grupo é renderizado antes do primeiro item de um grupo (texto do nome
   do grupo visível).
2. Dois itens consecutivos com o mesmo `group` gera **um único** cabeçalho (não
   duplicado).
3. Itens sem `group` não geram cabeçalho algum.
4. Item sem `group` entre dois grupos diferentes não impede o cabeçalho do grupo
   seguinte de aparecer.
5. Dois blocos não contíguos com o mesmo nome de `group` (intercalados por outro grupo
   ou por item sem grupo) geram dois cabeçalhos separados, não um só.
6. Em modo `collapsed`, o texto do cabeçalho de grupo tem classe `sr-only`.
7. Nenhuma violação de acessibilidade (`jest-axe`) com itens agrupados, expandido e
   colapsado.
8. Lista sem nenhum `group` definido em nenhum item mantém o comportamento atual
   (nenhuma regressão) — reaproveitar/confirmar os testes existentes continuam
   passando sem alteração.

Todas as descrições de teste em inglês, conforme convenção do repositório.

## Fora de escopo

- Não introduzir prop `groups` paralela para customizar ordem/label de exibição do
  grupo — o nome do grupo exibido é o próprio valor de `group`.
- Não adicionar colapso/expansão por grupo (accordion) — fora do pedido da issue.
- Não mexer em `AdminShell`/`EmployeeShell`/`DashboardMobileNavList` do `ecommerce`
  (fora deste repositório).

## Passos de implementação

1. Escrever os testes novos em `Sidebar.test.tsx` (falhando).
2. Adicionar `group?: string` à interface `SidebarItem`.
3. Implementar a função de agrupamento e ajustar o `.map()` do `<ul>` para iterar sobre
   as linhas pré-processadas, renderizando `<li>` de cabeçalho ou `<li>` de item.
4. Rodar `npm test` até os testes passarem.
5. Adicionar story em `Sidebar.stories.tsx` com itens agrupados.
6. Rodar `npm run lint` e `npm run build` para garantir que nada quebrou.
