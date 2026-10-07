# Plano: `Text` com corte em N linhas e altura reservada (issue #62)

## Contexto

Na vitrine de projetos do `portfolio`, o resumo de cada card deve mostrar no máximo 2 linhas,
cortando o resto com reticências, e ocupar sempre a altura de 2 linhas, para todos os cards terem o
mesmo tamanho. O `Text` aceita só `as`, `size`, `weight`, `color` e `className`. O app contorna
com `className="line-clamp-2 min-h-[2lh]"`, um valor arbitrário que foge da regra dos tokens.

A issue propõe `lines?: number` no `Text`, com a reserva de altura opcional, atrás de outra prop.

### Um defeito encontrado no mesmo componente

O `color="destructive"` do `Text` usa `text-destructive-foreground`, que é a cor do texto **sobre**
um fundo vermelho (branco no tema claro, quase preto no escuro), e não o vermelho de texto. Conferi
no Chromium: o texto sai com a mesma cor do fundo da página nos dois temas, ou seja, **invisível**
(contraste 1,00:1). Isso esconde:

- a mensagem de erro do `FormField`, com `role="alert"`, em todo formulário;
- o erro de tamanho do `FileUpload`.

O teste atual do `Text` confere justamente a classe errada. O addon de a11y das stories não
reprovou, embora as stories `Destructive` do `Text` e de erro do `FormField` existam. Não verifiquei
por quê; uma hipótese é o axe não tratar texto da mesma cor do fundo como violação. O token certo,
`destructive` sobre `background`, já tem o par garantido pelo teste de contraste (4,83:1 no
claro).

Procurei outros usos de `text-*-foreground` fora do fundo correspondente e achei mais um caso: o
botão de remover dos chips do `MultiSelect` e do `TagsInput` usa `hover:text-destructive-foreground`
sobre o chip `bg-muted`. O ícone some no hover. O mesmo botão tem `focus:outline-none` sem nenhum
anel de foco, como era o `Breadcrumb` antes da v0.5.4.

## Mudanças

### 1. `lines` e `reserveLines` no `Text`

```tsx
<Text color="muted" lines={2} reserveLines>
  {summary}
</Text>
```

- **`lines?: number`**: corta o texto em N linhas, com reticências. Sem a prop, nada muda.
- **`reserveLines?: boolean`** (padrão `false`): com `lines`, reserva a altura de N linhas mesmo
  com texto curto. Fica atrás de uma prop porque o corte sem altura fixa também é útil.

Implementação sem valores literais de design: o `Text` define uma variável CSS com o número de
linhas, `style={{ '--text-lines': lines }}`, e usa classes fixas que leem essa variável:

- `line-clamp-[var(--text-lines)]`: o `line-clamp` do Tailwind gera o
  `display: -webkit-box`, o `-webkit-box-orient: vertical`, o `overflow: hidden` e o
  `-webkit-line-clamp`;
- `min-h-[calc(var(--text-lines)*1lh)]`, com `reserveLines`: `1lh` é a altura de uma linha do
  próprio texto, então a reserva acompanha o `size` e o `line-height` do elemento.

As classes são fixas, então o Tailwind do app as encontra no `dist` (v3 e v4). Um número de linhas
dinâmico (`line-clamp-${lines}`) não seria encontrado. O `lh` existe nos navegadores desde 2023
(Chrome 109, Safari 16.4, Firefox 120). Num navegador mais antigo, só a reserva de altura deixa de
funcionar, e o corte continua.

Um `lines` que não seja um inteiro positivo é ignorado. O texto cortado continua inteiro no DOM,
então o leitor de tela lê tudo.

### 2. Correção: `color="destructive"`

`text-destructive-foreground` → `text-destructive`. O teste passa a conferir a classe certa.

### 3. Correção: botão de remover dos chips (`MultiSelect`, `TagsInput`)

- hover: `hover:text-destructive`, o vermelho de texto, visível sobre o `bg-muted` do chip;
- foco: `rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring`, como nos
  outros componentes.

## Testes (TDD, escritos antes)

`Text.test.tsx` (jsdom, sem layout):

- `lines={2}` define `--text-lines: 2` e a classe do corte;
- `reserveLines` acrescenta a classe da altura mínima, e sem `lines` não faz nada;
- sem `lines`, nenhuma das duas;
- `lines={0}` e `lines={1.5}` são ignorados;
- `color="destructive"` usa `text-destructive`.

Stories, com verificação no Chromium (`play`), porque o corte e a altura só existem com layout:

- **`Lines`**: com texto longo e `lines={2}`, o `-webkit-line-clamp` calculado é 2, e a altura é a
  de 2 linhas;
- **`ReservedLines`**: com texto curto e `reserveLines`, a altura é a de 2 linhas, igual à de um
  texto longo cortado;
- **`Destructive`**: a cor calculada é a do token `destructive` e diferente da cor do fundo. Esse
  teste cobre a lacuna do axe para esse componente.

`MultiSelect.test.tsx` e `TagsInput.test.tsx`: o botão de remover tem `hover:text-destructive` e o
anel de foco.

## Versão e changelog

A v0.5.5 (o arquivo de configuração de tema) está commitada, mas não publicada. Há duas opções:

- **A (recomendada)**: acrescentar estas mudanças à entrada da v0.5.5 e publicar as duas juntas.
  Assim nenhuma versão fica no CHANGELOG sem ter sido publicada.
- **B**: entrada própria na v0.5.6. Se a v0.5.5 nunca for publicada, ela fica no CHANGELOG sem ter
  existido no registry.

Em qualquer caso, é **patch**: uma prop nova e opcional mais duas correções. "Adicionado": `lines` e
`reserveLines` no `Text`. "Corrigido": a cor do `Text` `destructive` (erros do `FormField` e do
`FileUpload` invisíveis) e o botão de remover dos chips. "Ajustes necessários nos apps": nenhum. O
`portfolio` pode trocar o `className` do `ProjectCard` por `lines={2} reserveLines`.

## Fora do escopo

- Uma verificação automática de "texto da mesma cor do fundo" para todas as stories: é uma lacuna
  do axe. Se aparecer de novo, vira issue própria.
- Corte de texto no `Heading`.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist`.

## Resultado (implementação)

Entregue como planejado, junto da v0.5.5 (opção A).

- No Chromium, a story `Lines` confirmou que o texto longo é cortado em 2 linhas
  (`-webkit-line-clamp: 2`, com conteúdo além da altura visível) e mede o dobro de uma linha. O
  texto curto com `reserveLines` ficou com a mesma altura do cortado.
- A verificação de contraste da story `Destructive` reprovou com contraste 1 nos dois temas ao
  recolocar a classe antiga (`text-destructive-foreground`), e passou com a nova.
- O `Text` mescla o `style` do app com a variável `--text-lines`.
