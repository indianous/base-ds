# Plano: rótulos, `autoComplete` e integração com o `FormField` no `PinInput` (issue #48)

## Contexto

O `PinInput` (`src/components/molecules/PinInput/PinInput.tsx`) vai ser usado no `ecommerce` para o
código de 6 dígitos da verificação em duas etapas. Hoje ele tem três limitações:

1. Rótulos fixos em inglês: o grupo tem `aria-label="PIN input"` e cada campo
   `aria-label="PIN digit N"`.
2. Não aceita `autoComplete`. Sem `autoComplete="one-time-code"`, o iOS, o Android e os
   gerenciadores de senha não oferecem o preenchimento automático do código.
3. Não aceita `id`. O `FormField` injeta no filho, via `cloneElement`, as props `id`,
   `aria-describedby` e `aria-invalid`, e o `PinInput` descarta as três. Com isso, o
   `<label htmlFor>` do `FormField` aponta para um `id` que não existe, e a dica e o erro não ficam
   associados aos campos. O `CLAUDE.md` pede que controles de formulário repassem esses atributos
   ao input de verdade.

## Mudança

Props novas e opcionais. Sem elas, o componente se comporta como hoje:

```ts
export interface PinInputProps {
  // ...props atuais
  /** `aria-label` do grupo. Padrão `'PIN input'`. */
  groupLabel?: string
  /** `aria-label` de cada campo, a partir da posição (começa em 1). Padrão `` n => `PIN digit ${n}` ``. */
  digitLabel?: (n: number) => string
  /** Aplicado só no primeiro campo, por exemplo `'one-time-code'`. */
  autoComplete?: string
  /** `id` do primeiro campo, para o `<label htmlFor>` do `FormField` focar nele. */
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
}
```

- **`groupLabel` / `digitLabel`:** substituem os textos fixos. É o mesmo padrão do `SearchField`
  (#31) e do `PasswordInput` (#47).
- **`id`:** vai só no primeiro campo. Clicar no rótulo do `FormField` foca o primeiro dígito.
- **`aria-describedby` / `aria-invalid`:** vão em **todos** os campos. A pessoa pode estar em
  qualquer dígito quando o erro aparece, e o leitor de tela anuncia a descrição de cada campo ao
  focar nele.
- **`autoComplete`:** vai só no primeiro campo. Nesse campo, o `maxLength` passa de `1` para
  `length`, porque o preenchimento automático coloca o código inteiro ali e um `maxLength={1}` pode
  cortá-lo.

### Preenchimento automático distribuindo os dígitos

Hoje o `handleChange` fica só com o último dígito digitado (`slice(-1)`). Se o sistema preencher
`"123456"` no primeiro campo, o componente guarda só o `6`. A correção:

- Extrair a lógica de distribuição do `handlePaste` para uma função `fillFrom(index, digits)`:
  preenche a partir de `index`, chama `onChange` e `onComplete` e move o foco.
- No `handleChange`: se chegar mais de um dígito e o campo estava vazio, chamar
  `fillFrom(index, digits)`. Caso contrário, manter o comportamento atual (último dígito).
- O `handlePaste` passa a usar a mesma `fillFrom`, sem mudar o que faz.

### Acessibilidade com o `FormField`

O nome acessível do primeiro campo continua vindo do `aria-label` (`digitLabel(1)`), porque
`aria-label` tem prioridade sobre o `<label>`. O `<label>` do `FormField` serve para o clique e o
foco, e o contexto vem do `groupLabel`. Por isso, a recomendação para os apps é passar como
`groupLabel` o mesmo texto do rótulo do `FormField`. Isso vai para o README/CHANGELOG. Não vou
adicionar `name`: com um dígito por campo, ele não tem uso real.

## TDD

Em `PinInput.test.tsx`, escrever primeiro os testes abaixo e ver que falham:

1. `it('uses groupLabel as the group aria-label')`
2. `it('uses digitLabel for each input aria-label')`: `digitLabel={(n) => \`Dígito ${n}\`}`gera`Dígito 1`…`Dígito 6`.
3. `it('applies autoComplete only to the first input')`
4. `it('applies id only to the first input')`
5. `it('forwards aria-describedby and aria-invalid to every input')`
6. `it('distributes a multi-digit value set on an empty input (autofill)')`: com
   `fireEvent.change` de `'123456'` no primeiro campo, todos os campos ficam preenchidos e
   `onComplete` recebe `'123456'`.
7. `it('integrates with FormField: label focuses the first input and hint/error are linked')`:
   renderiza dentro do `FormField` com `hint` e `error`, clica no rótulo, confere o foco no primeiro
   campo, o `aria-describedby` e o `aria-invalid`, e roda o axe sem violações.

Os testes atuais, com "PIN digit", continuam como estão e garantem os padrões.

## Stories

Em `PinInput.stories.tsx`:

- `OneTimeCode`: `length: 6`, rótulos em português e `autoComplete: 'one-time-code'`.
- `InFormField`: dentro de um `FormField` com `hint` e `error`. Passa pelo axe no `test:stories`.

## Versão e changelog

Versão **0.4.4** (patch): props novas e opcionais. A distribuição no `handleChange` só atua quando
chega mais de um dígito num campo vazio, o que hoje não funciona de qualquer jeito.

Entrada no `CHANGELOG.md`:

- **Adicionado:** `groupLabel`, `digitLabel`, `autoComplete`, `id`, `aria-describedby` e
  `aria-invalid` no `PinInput`.
- **Corrigido:** um código preenchido de uma vez no primeiro campo (preenchimento automático) passa
  a ser distribuído entre os campos.
- **Ajustes necessários nos apps:** nenhum é obrigatório. Os apps podem passar os rótulos em
  português, `autoComplete="one-time-code"`, e o `groupLabel` igual ao rótulo do `FormField`.

Primeiro um commit só com o plano. Depois do OK, um commit com o código, o bump para `0.4.4` e o
CHANGELOG, a tag `v0.4.4` e o push, como na #47.

## Fora do escopo

A issue #49 (`Carousel`) fica para a próxima entrega.

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`.
