# Plano: elementos lazy vindos de Server Components (issue #60)

## Contexto

No `portfolio` (Next.js 16, React 19.2), um Server Component usa
`<Button asChild><AppLink href="/projects">…</AppLink></Button>`, e o `next dev` quebra com
`TypeError: Cannot read properties of undefined (reading 'className')`.

Quando um Server Component passa a um client component um elemento que também é client, o React 19
pode entregar esse elemento como **elemento lazy** (`$$typeof: Symbol.for('react.lazy')`), em
especial no modo de desenvolvimento. O `props` dele é `undefined` até ser resolvido, e o
`cloneElement` não aceita esse tipo de objeto. No `next build`, a página é pré-renderizada sem
erro. Os testes com Testing Library não pegam o problema, porque não passam pela fronteira entre
servidor e cliente.

### Todos os pontos afetados

A issue cita `Button`, `Sidebar` e `Tooltip`. Procurei todo `cloneElement` e toda leitura de
`.props` sobre elementos que vêm do app. São **cinco** pontos:

| componente     | elemento do app                    | o que faz com ele                                |
| -------------- | ---------------------------------- | ------------------------------------------------ |
| `Button`       | o filho, com `asChild`             | lê `className` e `onClick` e clona               |
| `Tooltip`      | o gatilho (filho)                  | lê os handlers (`onMouseEnter` …) e clona        |
| `DropdownMenu` | `trigger`                          | lê `onClick` e clona                             |
| `FormField`    | o controle (filho, ex.: `<Input>`) | clona para injetar `id`, `aria-describedby` etc. |
| `Sidebar`      | `asChild` de cada item             | clona com o conteúdo do item                     |

O `FormField` deve ser o caso mais comum: `<FormField><Input /></FormField>` num formulário
montado num Server Component cai no mesmo problema.

### Como o Radix resolveu

O `Slot` do Radix ([código][radix-slot])
detecta o elemento lazy (`$$typeof === Symbol.for('react.lazy')` e um `_payload` com `then`) e o
resolve com `React.use(child._payload)` antes de clonar. Para funcionar com React 18, que não tem
`use`, ele acessa a função de um jeito que o bundler não analisa (`React[' use '.trim()]`), e só a
chama quando ela existe. No React 18, os elementos lazy desse tipo também não aparecem, porque vêm
do Flight do React 19.

## Mudanças

### `src/utils/useResolvedElement.ts`

Um hook interno que faz o mesmo que o Radix:

```ts
export function useResolvedElement(node: ReactNode): ReactNode
```

- se o nó for um elemento lazy com `_payload` "thenable" e o React tiver `use`, devolve
  `use(node._payload)`, que é o elemento resolvido. O `use` suspende se a resolução não estiver
  pronta, como o próprio React faz com esses elementos;
- em qualquer outro caso, devolve o nó como veio.

Ele é um hook (nome com `use`) porque chama o `use` do React: precisa ser chamado no topo do
componente, sem condição. O comentário no código explica o acesso ao `use` sem import nomeado.

### Os cinco componentes

- **`Button`**: resolve o `children` no topo, antes do ramo do `asChild`.
- **`Tooltip`**: resolve o filho antes de ler os handlers e clonar.
- **`DropdownMenu`**: resolve o `trigger`.
- **`FormField`**: resolve o filho antes de clonar.
- **`Sidebar`**: o `asChild` está dentro de um `map` dos itens, e um hook não pode ser chamado num
  laço. O ramo do `asChild` vira um subcomponente interno (`SidebarItemAsChild`), que chama o hook
  no próprio topo.

A API não muda. A alternativa da issue, um `linkComponent` no `Button`, não é necessária com a
correção e fica de fora.

## Testes (TDD, escritos antes)

O jsdom não passa pela fronteira entre servidor e cliente, então os testes montam um elemento
lazy igual ao do Flight: `{ $$typeof: Symbol.for('react.lazy'), _payload, _init }`, com um
`_payload` "thenable" já resolvido (`status: 'fulfilled'`, `value: <elemento>`), que o `use` do
React 19 lê de forma síncrona.

- `src/utils/useResolvedElement.test.tsx`: resolve um elemento lazy; devolve como veio um elemento
  comum, um texto e `null`.
- Um teste por componente, cada um com o elemento lazy no lugar do elemento do app, que hoje
  quebra:
  - `Button asChild` com um `<a>` lazy: renderiza o `<a>` com as classes do botão e chama o
    `onClick` do filho e o do botão;
  - `Tooltip` com um gatilho lazy: o tooltip aparece no foco, e o handler do filho é chamado;
  - `DropdownMenu` com `trigger` lazy: o menu abre no clique;
  - `FormField` com um `<input>` lazy: o input recebe o `id` e o `aria-describedby`;
  - `Sidebar` com um item `asChild` lazy: o link aparece com o conteúdo do item.

## Verificação no Next.js

Os testes simulam o elemento lazy, mas o problema só aparece de verdade no `next dev`. Para
confirmar a correção no ambiente onde ela acontece, monto no scratchpad um app Next.js 16.3.6
mínimo, que não entra no repositório e não acrescenta dependência ao base-ds. Ele tem um Server
Component com `<Button asChild><AppLink /></Button>` e `<FormField><Input /></FormField>`. No
`next dev`, carrego a página no Chromium com a v0.5.2, que deve reproduzir o erro da issue, e
depois com o tarball da correção, sem erro no console e com o link e o input funcionando.

Essa etapa pode sair se você preferir: os testes unitários continuam cobrindo a correção.

## Versão e changelog

Correção de bug, sem mudança de API: **patch**, v0.5.3. "Corrigido": os cinco componentes, com o
cenário (Server Component passando um elemento client). "Ajustes necessários nos apps": nenhum. O
`portfolio` pode voltar a usar o `Button asChild` em Server Components.

## Fora do escopo

- `linkComponent` no `Button`: a correção torna desnecessário.
- `Breadcrumb` sem `linkComponent`: é a #61.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist`.

[radix-slot]: https://github.com/radix-ui/primitives/blob/main/packages/react/slot/src/slot.tsx

## Resultado (implementação)

- **Reprodução**: no app Next.js 16.3.6 mínimo, com a v0.5.2, as 5 páginas (cada componente num
  Server Component) quebraram no `next dev`. O `Button` com o erro da issue
  (`Cannot read properties of undefined (reading 'className')`) e os outros 4 com
  `Element type is invalid … got: undefined`, que é o `cloneElement` sobre o nó lazy.
- **Testes**: o `lazyElementForTests` (em `src/utils`) monta o nó como o Flight. Os 5 testes novos
  falharam com os mesmos dois erros do `next dev` antes da correção.
- **Correção**: o hook `useResolvedElement` nos 5 componentes. No `Sidebar`, o ramo do `asChild`
  virou o subcomponente `SidebarItemAsChild`.
- **Verificação**: com o tarball da correção, as 5 páginas renderizam no `next dev` sem erro no
  console e sem o diálogo de erro do Next. O link do `Button` tem as classes do botão, o input do
  `FormField` tem o `aria-describedby`, e o tooltip, o menu e o link do `Sidebar` funcionam. A
  mesma checagem com a v0.5.2 mostra o diálogo de erro.
