# Plano: zerar as falhas de acessibilidade do Storybook (issue #41)

## Contexto

`npm run test:stories` falha em 28 stories de 10 componentes. O Storybook roda o axe em toda
story (`.storybook/preview.tsx`: `a11y: { test: 'error' }`), mas nada obriga a rodar essa suíte:
`npm test` só cobre o projeto `unit` (jsdom, onde o axe **não mede contraste**), e o workflow de
publicação da #40 deixou `test:stories` de fora justamente por causa dessas falhas.

Mapeamento completo (rodado sobre a v0.3.0: 236 stories, 28 falhas):

| Causa                                                             | Onde aparece                                                                                                | Tipo de correção   |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------ |
| `muted-foreground` sobre `muted` = 4.39                           | Avatar (fallback), Badge `default`, chips de MultiSelect/TagsInput, ConversationList, badges do KanbanBoard | token              |
| branco sobre `success` = 3.29, `warning` = 3.18, `info` = 4.09    | Badge `success`/`warning`/`info` (e KanbanBoard, que usa Badge)                                             | token              |
| `select-name` / `label`: campo sem nome acessível                 | stories de Select, NumberInput, TagsInput, MultiSelect                                                      | componente + story |
| Opções de TransferList desabilitada = 3.37 (`opacity-50`)         | TransferList `Disabled`                                                                                     | componente         |
| Chip de MultiSelect desabilitado = 1.88 (`opacity-50`)            | MultiSelect `Disabled`                                                                                      | componente         |
| `aria-required-children`: `listbox` vazio                         | TransferList `Empty`                                                                                        | componente         |
| Rótulo de anexo com `opacity-80` sobre `primary` = 3.89           | ConversationThread                                                                                          | componente         |
| `scrollable-region-focusable`: área de mensagens rolável sem foco | ConversationThread                                                                                          | componente         |

Mínimo usado em todo o plano: **WCAG AA, 4.5:1 para texto normal** (todos os textos afetados são
`text-xs`/`text-sm`).

## Parte 1 — tokens de cor

Os valores ficam em dois lugares que precisam andar juntos: `src/tokens/colors.json` (valores
hex dos semânticos) e `src/styles/theme.css` (semânticos apontando para primitivos via `var()`).
`theme-v4.css` só re-expõe nomes e não muda.

### Cores de status (sólidas) — um tom mais escuro

| Token                   | Hoje                       | Proposto            | Branco sobre ele |
| ----------------------- | -------------------------- | ------------------- | ---------------- |
| `--color-success`       | green-600 `#16a34a` (3.29) | green-700 `#15803d` | 5.02             |
| `--color-success-hover` | green-700                  | green-800 `#166534` | 7.13             |
| `--color-warning`       | amber-600 `#d97706` (3.18) | amber-700 `#b45309` | 5.02             |
| `--color-warning-hover` | amber-700                  | amber-800 `#92400e` | 7.09             |
| `--color-info`          | sky-600 `#0284c7` (4.09)   | sky-700 `#0369a1`   | 5.93             |
| `--color-info-hover`    | sky-700                    | sky-800 `#075985`   | 7.56             |

- O `-hover` desce junto para continuar mais escuro que a cor base.
- Os `-muted`/`-muted-fg`/`-border` não mudam (já passam: 4.57, 4.51, 5.17).
- Hoje só o `Badge` usa essas cores sólidas dentro da biblioteca; nos apps, afeta quem usa
  `bg-success`/`bg-warning`/`bg-info` diretamente.
- `primary`, `secondary` e `destructive` já passam (5.17, ~5.7, 4.83) e não mudam.

### Texto secundário — `muted-foreground`

`--color-muted-foreground`: neutral-500 `#6b7280` → **neutral-600 `#4b5563`**.

| Fundo                  | neutral-500 (hoje) | neutral-600 (proposto) |
| ---------------------- | ------------------ | ---------------------- |
| `background` `#ffffff` | 4.83               | 7.56                   |
| `neutral-50` `#f9fafb` | 4.63               | 7.23                   |
| `muted` `#f3f4f6`      | **4.39**           | 6.87                   |

**É a mudança com mais impacto visual:** `text-muted-foreground` aparece em 47 pontos dos
componentes (legendas, hints, timestamps, placeholders de estado vazio) e é muito usado nos apps.
O texto secundário fica visivelmente mais escuro. Alternativas consideradas:

- **Clarear `muted`** (neutral-100 → neutral-50): passa por pouco (4.63) e deixa `bg-muted`
  quase indistinguível do fundo branco — perde a função de superfície. Descartado.
- **Trocar só os componentes** que põem `text-muted-foreground` sobre `bg-muted` (Avatar, Badge,
  chips) para `text-foreground`: resolve a suíte, mas deixa o par de tokens reprovado para os
  apps, que continuariam combinando os dois. Descartado.

### Teste de contraste dos tokens (novo, TDD)

`src/tokens/contrast.test.ts` (projeto `unit`), escrito antes da troca e falhando hoje:

- Lê `src/styles/theme.css`, resolve cada semântico até o hex do primitivo.
- `it.each` com os pares de uso real, exigindo ≥ 4.5:
  `foreground`/`background`; `muted-foreground` sobre `background` e sobre `muted`;
  `<status>-foreground` sobre `<status>` para primary, secondary, success, warning, destructive,
  info; `<status>-muted-fg` sobre `<status>-muted` para os mesmos.
- `keeps colors.json in sync with theme.css`: os hex dos semânticos em `colors.json` batem com
  o que `theme.css` resolve.

É a trava que faltava: contraste passa a ser checado no `npm test`, não só no Storybook.

## Parte 2 — nome acessível nos campos de formulário

### Bug real: `FormField` não funciona com NumberInput, TagsInput e MultiSelect

`FormField` injeta `id`, `aria-describedby` (hint/erro) e `aria-invalid` no filho via
`cloneElement`. `Select` repassa tudo (`...props`), mas `NumberInput`, `TagsInput` e
`MultiSelect` têm props fechadas e **descartam `aria-describedby` e `aria-invalid`**: dentro de um
`FormField`, a mensagem de erro e o hint não são anunciados por leitores de tela.

Correção nos três: aceitar e repassar ao `<input>` interno as props
`aria-label`, `aria-labelledby`, `aria-describedby` e `aria-invalid`. Não abrir `...rest`
genérico: o elemento raiz dos três é um wrapper, e os atributos precisam ir para o input.

Testes (TDD) em cada `*.test.tsx`:

- `forwards aria-label to the input`
- `forwards aria-describedby and aria-invalid from FormField` (renderizando dentro de um
  `FormField` com `hint` e `error`, e conferindo `toHaveAccessibleDescription`)

### Stories

Stories de Select, NumberInput, TagsInput e MultiSelect ganham `aria-label` (ex.:
`'aria-label': 'Framework'`), já que mostram o campo isolado. Uma story `InFormField` em cada
um mostra o uso recomendado, com label visível.

## Parte 3 — correções pontuais nos componentes

1. **TransferList desabilitado:** marcar `aria-disabled="true"` no `listbox` e nas `option`s
   quando `disabled`. É a semântica correta (hoje só há `pointer-events-none opacity-50`, e o
   leitor de tela não sabe que está desabilitado) e a WCAG isenta componentes inativos de
   contraste — o axe deixa de cobrar. Se o axe ainda cobrar, trocar `opacity-50` por
   `text-muted-foreground` nas opções.
2. **MultiSelect desabilitado:** mesmo tratamento — `aria-disabled="true"` no wrapper dos chips
   quando `disabled` (o input já tem `disabled` nativo). Mesmo plano B.
3. **TransferList vazio:** hoje renderiza `role="listbox"` sem nenhuma `option`, só o texto
   "Empty". Quando a lista estiver vazia, renderizar `role="group"` (mantendo o
   `aria-labelledby`) sem `tabIndex`, com o texto "Empty"; volta a ser `listbox` quando houver
   itens.
4. **ConversationThread — rótulo de anexo:** remover `opacity-80` do bloco do anexo (ícone +
   "Image"); o texto herda a cor da bolha (`primary-foreground` sobre `primary` = 5.17).
5. **ConversationThread — área de mensagens:** `tabIndex={0}` no `role="log"` rolável, para
   quem usa teclado conseguir rolar o histórico (correção padrão da regra
   `scrollable-region-focusable`), com anel de foco pelos tokens
   (`focus-visible:ring-2 focus-visible:ring-ring`).

Testes (TDD) nos respectivos `*.test.tsx`: `aria-disabled` presente quando `disabled`; lista
vazia com `role="group"` e sem `listbox`; área de mensagens focável (`tabIndex 0`).

## Parte 4 — travar a regressão

- `.github/workflows/publish.yml`: adicionar `npx playwright install --with-deps chromium` e
  `npm run test:stories` antes do `npm publish` (anotado na #41 pela #40).
- `CLAUDE.md`: `npm run test:stories` passa a ser obrigatório antes de considerar uma entrega
  pronta (hoje as instruções só citam lint/test/build), e o teste de contraste dos tokens entra
  na seção de Design tokens ("mudou cor semântica → o teste de contraste precisa continuar
  passando").

## Versão e CHANGELOG

A troca de `muted-foreground` e das cores de status muda a aparência de todos os apps. Pela
convenção, mudança que pede ação nos apps sobe o _minor_: **`0.4.0`**. Isso também impede que
`npm update` (com `^0.3.0`) traga a mudança visual sem o app decidir.

`CHANGELOG.md`, entrada `0.4.0`:

- _Alterado_: tokens (tabela antes/depois); `aria-disabled` em TransferList/MultiSelect; lista
  vazia do TransferList como `group`; área de mensagens focável no ConversationThread.
- _Corrigido_: NumberInput, TagsInput e MultiSelect repassam `aria-*` (funcionam com
  `FormField`).
- _Ajustes necessários nos apps_: conferir visualmente telas com texto secundário e badges de
  status; campos NumberInput/TagsInput/MultiSelect sem label visível passam a aceitar
  `aria-label` — usar.

## Verificação

1. `npm run lint`, `npm test`, `npm run build`.
2. **`npm run test:stories` com 0 falhas** (hoje 28).
3. Conferência visual no Storybook (Badge `All Variants`, Avatar, KanbanBoard, ConversationList)
   antes de publicar — deixo o Storybook rodando para você ver, como na #39.
4. Publicação da `0.4.0` pela tag, **só com sua confirmação**, já com `test:stories` no
   workflow — o próprio run valida a Parte 4.

## Fora do escopo

- Tema escuro (não existe hoje).
- Revisar contraste de `border`/`input` (contraste de componente não-texto, 3:1) e das cores de
  gráfico — o axe não cobra, e é outra discussão de design.
- Ajustar telas nos apps.

## Commit

`Corrige contraste dos tokens e acessibilidade das stories (issue #41)`, com a versão `0.4.0` no
mesmo commit; a tag `v0.4.0` só é enviada após sua confirmação.
