# Plano: ConversationThread + ConversationList — central de mensagens (issue #36)

## Contexto

O projeto **lead-system** precisa de uma central de mensagens (`/inbox` e
`/leads/[id]/chat`) onde o vendedor conversa com o lead (entrega via WhatsApp/
Telegram por trás), com histórico e atualização em tempo real. Não existe hoje
organismo de chat/thread no base-ds.

## Decisão de escopo: dois organismos separados

- `ConversationThread` — lista de mensagens de uma conversa + composer (tela
  `/leads/[id]/chat`).
- `ConversationList` — lista de conversas para a tela `/inbox`.

São independentes (não compartilham estado/contexto entre si — o app é quem liga
"selecionar conversa na lista" a "carregar mensagens no thread"), então cada um
ganha sua própria pasta (diferente do padrão `Toast/ToastProvider/ToastViewport`,
que colaboram via contexto).

## Tipos propostos

```ts
type MessageDirection = 'INBOUND' | 'OUTBOUND'
type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
type MessageMediaType = 'image' | 'audio' | 'document'

interface ConversationMessage {
  id: string
  direction: MessageDirection
  content: string
  timestamp: string | Date
  status?: MessageStatus // usado só para OUTBOUND
  mediaUrl?: string
  mediaType?: MessageMediaType
}

interface ConversationThreadProps {
  messages: ConversationMessage[]
  onSend: (content: string) => void
  composerPlaceholder?: string
  composerDisabled?: boolean
  className?: string
}
```

```ts
interface ConversationListItem {
  id: string
  leadName: string
  channel: string // ex.: 'whatsapp' | 'telegram', mas deixado como string livre
  lastMessagePreview: string
  timestamp: string | Date
  unreadCount?: number
}

interface ConversationListProps {
  conversations: ConversationListItem[]
  activeConversationId?: string
  onSelectConversation: (id: string) => void
  renderChannelIcon?: (channel: string) => ReactNode
  className?: string
}
```

### Decisões de design menores

- **Timestamp**: aceita `string | Date`. Se vier `Date`, formata com
  `Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' })`; se
  vier `string`, renderiza como veio (já formatada pelo app). Evita meter
  timezone/i18n completo no componente.
- **Ícone de canal**: lucide-react não tem ícones de marca (WhatsApp/Telegram) —
  não vale adicionar outra dependência (ex. simple-icons) só por isso. Prop
  opcional `renderChannelIcon(channel)` deixa o app injetar o ícone de marca real;
  sem ela, cai num ícone genérico (`MessageSquare`) + texto do `channel` como
  fallback visível.
- **Mídia anexada**: só indicação (ícone + rótulo "Imagem"/"Áudio"/"Documento"
  conforme `mediaType`), sem player/preview — a issue pede apenas "indicação
  visual", não renderização de mídia.
- **Composer**: input de uma linha (`Input` atom) + `Button` com ícone `Send`.
  Enter envia; botão desabilitado com texto vazio/whitespace; input limpa após
  `onSend`. Estado do texto digitado é interno ao componente (não exposto via
  prop), só o conteúdo final sai por `onSend(content)`.

## Preservação de scroll ao chegar mensagem nova

Não é "restaurar" scroll (não há reordenação, só `append` no fim do array).
O necessário é: **só rolar para o fim automaticamente se o usuário já estava no
fim**; se ele rolou pra cima pra ler histórico, deixar a posição como está.

Implementação: ref no container (`overflow-y-auto`), um `onScroll` que atualiza
um `useRef<boolean>` "estava perto do fim" (`scrollHeight - scrollTop -
clientHeight < threshold`), e um `useEffect`/`useLayoutEffect` disparado quando
`messages.length` aumenta que só seta `container.scrollTop =
container.scrollHeight` se aquele ref estava `true`.

## Estilo das bolhas

- `OUTBOUND`: alinhada à direita (`justify-end`), `bg-primary
text-primary-foreground`.
- `INBOUND`: alinhada à esquerda (`justify-start`), `bg-muted text-foreground`.
- Ícone de status por `Record<MessageStatus, {icon, className}>`: `Clock`
  (PENDING), `Check` (SENT), `CheckCheck` (DELIVERED, cor neutra),
  `CheckCheck` (READ, `text-primary` para diferenciar de DELIVERED), `AlertCircle`
  em `text-destructive` (FAILED) — todos ícones já disponíveis via lucide-react.

## Arquivos afetados

- `src/components/organisms/ConversationThread/ConversationThread.tsx`
- `src/components/organisms/ConversationThread/ConversationThread.stories.tsx`
- `src/components/organisms/ConversationThread/ConversationThread.test.tsx`
- `src/components/organisms/ConversationList/ConversationList.tsx`
- `src/components/organisms/ConversationList/ConversationList.stories.tsx`
- `src/components/organisms/ConversationList/ConversationList.test.tsx`
- `src/index.ts` — exporta os dois componentes e seus tipos públicos.

## Casos de teste — ConversationThread (TDD)

1. Renderiza mensagens na ordem recebida.
2. Mensagens `OUTBOUND` e `INBOUND` recebem estilos/alinhamento diferentes
   (assert via classe ou `data-direction`).
3. Ícone de status correto por `MessageStatus` em mensagens `OUTBOUND`; nenhum
   ícone de status em mensagens `INBOUND`.
4. Indicador de mídia aparece quando `mediaUrl` está presente, com rótulo
   correspondente ao `mediaType`; ausente quando não há `mediaUrl`.
5. Timestamp `Date` é formatado; timestamp `string` é renderizado verbatim.
6. Digitar no composer e clicar em enviar chama `onSend(content)` e limpa o
   campo.
7. Pressionar Enter no composer também dispara o envio.
8. Botão de enviar fica desabilitado com o campo vazio/só espaços.
9. `composerDisabled` desabilita input e botão.
10. Ao adicionar uma nova mensagem (re-render com array maior) estando o usuário
    "no fim" do scroll, o container rola para o fim automaticamente (mock de
    `scrollHeight`/`scrollTop`/`clientHeight`, já que jsdom não faz layout real).
11. Mesma situação, mas com o usuário previamente scrollado para cima: o
    `scrollTop` não é forçado de volta ao fim.
12. Nenhuma violação de acessibilidade (`jest-axe`).

## Casos de teste — ConversationList (TDD)

1. Renderiza uma linha por conversa com `leadName`, prévia e timestamp.
2. Indicador de não lida aparece quando `unreadCount > 0` e some quando
   `0`/`undefined`.
3. Clicar numa linha chama `onSelectConversation(id)`.
4. Linha com `id === activeConversationId` recebe estilo ativo + `aria-current`.
5. Navegação por teclado (Tab + Enter/Space na linha focada) também dispara
   `onSelectConversation` (linhas são `button`, comportamento nativo).
6. `renderChannelIcon`, quando fornecido, é usado; sem ele, cai no ícone/rótulo
   genérico de fallback.
7. Nenhuma violação de acessibilidade (`jest-axe`).

Todas as descrições de teste em inglês.

## Stories

- `ConversationThread`: conversa de exemplo com mensagens INBOUND/OUTBOUND
  variando status e uma com mídia anexada.
- `ConversationThread` com `composerDisabled`.
- `ConversationList`: lista de conversas com e sem não lidas, uma ativa.

## Fora de escopo

- WebSocket/transporte real — o app injeta mensagens novas via prop `messages`.
- Upload ou player real de mídia (áudio/imagem/documento).
- Busca, paginação ou agrupamento por data na lista de conversas/mensagens.
- Marcar como lida automaticamente por scroll.

## Passos de implementação

1. Testes de `ConversationThread` (casos 1–12) — falhando.
2. Implementar `ConversationThread.tsx` até os testes passarem.
3. Testes de `ConversationList` (casos 1–7) — falhando.
4. Implementar `ConversationList.tsx` até os testes passarem.
5. Stories dos dois.
6. Exportar em `src/index.ts`.
7. `npm test`, `npm run lint`, `npm run build`.
