# Plano: rótulos customizáveis no botão do `PasswordInput` (issue #47)

## Contexto

O botão de mostrar/ocultar do `PasswordInput`
(`src/components/molecules/PasswordInput/PasswordInput.tsx`) tem o `aria-label` fixo em inglês:

```tsx
aria-label={showPassword ? 'Hide password' : 'Show password'}
```

Não há prop para trocar esse texto. Num app em português, como o `ecommerce`, o leitor de tela
anuncia "Show password", e os testes do app precisam procurar o botão pelo texto em inglês.

## Mudança

Duas props opcionais, com o texto atual em inglês como padrão, no mesmo padrão do `SearchField`
(#31), do `TransferList` (#24) e do `dismissLabel` do `Alert`:

```tsx
export type PasswordInputProps = Omit<InputProps, 'type'> & {
  /** `aria-label` do botão quando a senha está oculta. Padrão `'Show password'`. */
  showLabel?: string
  /** `aria-label` do botão quando a senha está visível. Padrão `'Hide password'`. */
  hideLabel?: string
}

export function PasswordInput({
  className,
  showLabel = 'Show password',
  hideLabel = 'Hide password',
  ...props
}: PasswordInputProps) {
  // ...
  aria-label={showPassword ? hideLabel : showLabel}
```

As duas props saem do `...props` na desestruturação, então não chegam ao `<input>` como atributo
desconhecido.

Hoje o `PasswordInputProps` nem é exportado. Ele passa a ser exportado no componente e reexportado
em `src/index.ts` (`export type { PasswordInputProps } ...`), como pede a convenção do repo.

## TDD

Em `PasswordInput.test.tsx`, escrever primeiro os testes abaixo e ver que falham:

1. `it('uses showLabel as the toggle aria-label while the password is hidden')`: com
   `showLabel="Mostrar senha"`, `getByRole('button', { name: 'Mostrar senha' })` existe.
2. `it('uses hideLabel as the toggle aria-label while the password is visible')`: com
   `hideLabel="Ocultar senha"`, depois do clique, `getByRole('button', { name: 'Ocultar senha' })`
   existe.
3. `it('does not forward showLabel/hideLabel to the input')`: o `<input>` não tem os atributos
   `showlabel` nem `hidelabel`.

Os testes atuais com "Show password" / "Hide password" continuam como estão e garantem o padrão
sem quebra. Depois de ver os testes falharem, aplicar a mudança e confirmar que passam.

## Story

Criar em `PasswordInput.stories.tsx` a story `CustomLabels`, com
`showLabel: 'Mostrar senha'`, `hideLabel: 'Ocultar senha'` e um `aria-label` em português no
campo. Ela documenta as props e também passa pelo axe no `test:stories`.

## Versão e changelog

Versão **0.4.3** (patch): props novas e opcionais, sem mudança de comportamento.

Entrada no `CHANGELOG.md`, seção **Adicionado**: "`PasswordInput`: props `showLabel` e
`hideLabel` para o `aria-label` do botão de mostrar/ocultar (padrões `'Show password'` e
`'Hide password'`); o tipo `PasswordInputProps` passa a ser exportado". Na seção "Ajustes
necessários nos apps": nenhum é obrigatório. Os apps podem passar os rótulos em português e trocar
nos testes a busca por `/show password/i`.

Commit (em português) com o código, o bump para `0.4.3` e o CHANGELOG, seguido da tag `v0.4.3`.
O push da tag fica a critério do autor.

## Fora do escopo

As issues #48 (`PinInput`) e #49 (`Carousel`) pedem a mesma coisa em outros componentes. Elas
ficam para entregas próprias.

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`.
