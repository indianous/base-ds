# Plano: `aria-describedby` do `FormField` sem apontar para a dica escondida (issue #51)

## Contexto

O `FormField` (`src/components/molecules/FormField/FormField.tsx`) calcula os ids assim:

```tsx
const hintId = hint ? `${id}-hint` : undefined
const errorId = error ? `${id}-error` : undefined
```

A dica só é renderizada quando não há erro (`{hint && !error && …}`), mas o `hintId` entra no
`aria-describedby` do controle sempre que existe `hint`. Com `hint` e `error` ao mesmo tempo, o
controle sai com `aria-describedby="<id>-hint <id>-error"`, e `<id>-hint` aponta para um elemento
que não existe no DOM. Isso afeta todo controle dentro do `FormField`. O problema foi encontrado
durante a #48.

O efeito prático é pequeno: os leitores de tela ignoram ids inexistentes, e o erro continua sendo
anunciado. Mesmo assim, é uma referência ARIA inválida, e um teste de integração que confira o
`aria-describedby` exato encontra o id da dica, que não existe.

## Mudança

O `hintId` só existe quando a dica é de fato renderizada:

```tsx
const showHint = Boolean(hint) && !error
const hintId = showHint ? `${id}-hint` : undefined
const errorId = error ? `${id}-error` : undefined
// ...
{showHint && (
  <Text id={hintId} …>{hint}</Text>
)}
```

A mesma condição (`showHint`) passa a decidir as duas coisas, a renderização da dica e o id, e os
dois não podem mais divergir. Nada mais muda: a dica continua escondida quando há erro, e o erro
continua com `role="alert"`.

## TDD

Em `FormField.test.tsx`, escrever primeiro o teste abaixo e ver que falha:

1. `it('child aria-describedby points only to the error when both hint and error are provided')`:
   com `hint` e `error`, o controle tem `aria-describedby="email-error"`.

E um segundo teste, que fixa a regra geral e protege contra regressão:

2. `it('every id in aria-describedby refers to an element in the DOM')`: para as combinações sem
   nada, só `hint`, só `error` e `hint` + `error`, cada id do `aria-describedby` existe no
   `document`.

Os testes atuais continuam como estão.

Depois, voltar o teste de integração do `PinInput` (#48) a usar `hint` **e** `error`, como estava
planejado lá. Ele foi simplificado por causa deste bug.

## Story

Criar em `FormField.stories.tsx` a story `WithHintAndError`, com os dois preenchidos. Ela mostra
que o erro substitui a dica e passa pelo axe no `test:stories`.

## Versão e changelog

Versão **0.4.7** (patch): correção sem mudança de API.

Entrada no `CHANGELOG.md`, seção **Corrigido**: "`FormField`: com `hint` e `error` ao mesmo tempo,
o `aria-describedby` do controle apontava também para a dica, que não é renderizada nesse caso.
Agora aponta só para o erro." Na seção "Ajustes necessários nos apps": nenhum. Só se algum teste de
app esperava `"<id>-hint <id>-error"`, o que seria improvável.

Primeiro um commit só com o plano. Depois do OK, um commit com o código, o bump para `0.4.7` e o
CHANGELOG, a tag `v0.4.7` e o push. O commit fecha a issue (`Closes #51`).

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`.
