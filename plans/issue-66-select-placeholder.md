# Plano: `Select` sem `<option selected>` no placeholder (issue #66)

## Contexto

O `Select` marca a opção do placeholder com `selected`:

```tsx
<option value="" disabled selected={!value}>
```

O React não aceita `selected` em `<option>` e avisa no console (`Use the defaultValue or value
props on <select> instead of setting selected on <option>`) em toda tela com
`<Select placeholder=…>`. No ecommerce isso aparece em pelo menos seis formulários, e o app não
tem como evitar.

## O cuidado da correção

Só tirar o `selected` muda o comportamento. Pelo HTML, quando nenhuma opção está marcada, o
navegador escolhe a **primeira opção não desabilitada**. O placeholder é `disabled`, então um
`Select` não controlado com placeholder passaria a abrir com a primeira opção real escolhida, e o
formulário enviaria esse valor sem o usuário escolher nada.

A sugestão da issue (`value ?? ''`) também não serve como está: passar `value` a um `<select>`
sem `onChange` o torna controlado. O React avisa ("You provided a `value` prop without an
`onChange` handler") e o campo trava.

## Mudança

O `<select>` escolhe a opção pelo `value` ou pelo `defaultValue`, conforme o uso:

- **controlado** (`value !== undefined`): repassa o `value` como hoje. Com `value=""`, o
  placeholder fica marcado.
- **não controlado** (sem `value`): usa `defaultValue`. Se o app não passar um e houver
  `placeholder`, o padrão é `''`, e o placeholder fica marcado como hoje. Um `defaultValue` do app
  continua valendo.
- o `<option>` do placeholder fica só com `value=""` e `disabled`.

Isso vira duas linhas no destructuring (`value`, `defaultValue`) e
`defaultValue={value === undefined ? (defaultValue ?? (placeholder !== undefined ? '' : undefined)) : undefined}`,
ou, de forma mais legível, uma constante calculada antes do `return`.

Fora de escopo: `multiple` com placeholder (o tipo aceita, mas não faz sentido e hoje também não
funciona).

## Testes (TDD, escritos antes)

1. Renderizar `<Select placeholder options />` com `console.error` espionado: nenhuma chamada.
   Esse teste falha hoje, com o aviso do React.
2. Não controlado, com placeholder e sem `defaultValue`: `select.value === ''`, e o placeholder
   está marcado (`option.selected`). É a guarda contra a regressão descrita acima.
3. Não controlado, com `defaultValue="b"`: `select.value === 'b'`.
4. Controlado: `value=""` marca o placeholder, `value="a"` marca a opção `a`, e ao trocar o
   `value` por `rerender` a seleção acompanha.
5. Controlado com `onChange`, sem nenhum aviso no console.
6. Os testes que já existem (placeholder renderizado e desabilitado, `onChange`, axe) continuam
   valendo.

As stories não mudam. `npm run test:stories` confirma no Chromium que nada mudou visualmente nem
no a11y.

## Versão e changelog

Correção sem mudança de API: **patch**, v0.5.10. "Corrigido": o aviso do React no `Select` com
`placeholder`. "Ajustes necessários nos apps": nenhum.

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build`
e `npm run check:dist`.
