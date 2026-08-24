# 0003 — SearchField: props para customizar label, aria-label, texto do botão e id (issue #31)

Status: aguardando confirmação

## Contexto

`SearchField` (`src/components/molecules/SearchField/SearchField.tsx`) tem
textos e `id` fixos, sem prop de customização:

```tsx
<Input id="search-field" ... aria-label="Search input" ... />
<Button type="submit" aria-label="Search" ...>Search</Button>
```

Isso impede:

- Uso em apps localizados (ex.: `ecommerce`, que precisa de textos em
  português nas telas de busca do dashboard — `ProductsContent`,
  `OrdersContent`, `SolicitacoesContent`).
- Duas instâncias de `SearchField` na mesma página (ex.: duas tabelas com
  busca própria) — o `id="search-field"` fixo colide no DOM.
- O padrão icon-only já usado em outras telas do projeto (`Button
iconOnly` com `aria-label`, sem texto visível).

Issue: https://github.com/indianous/base-ds/issues/31

## Diagnóstico

O `id` fixo é o bug mais sério (colisão de DOM real, não só falta de
i18n). O padrão já estabelecido no repo para gerar um `id` estável sem
forçar o consumidor a passar um é `useId()` — usado em `Tooltip`,
`MultiSelect`, `Tabs`, `FilterDropdown`, `Button`, `TransferList`,
`DropdownMenu`, `ImageGallery`, `Drawer` e `Dialog`. `SearchField` é hoje
a exceção que ainda usa uma string literal.

`Button` já suporta o padrão icon-only nativamente: `iconOnly` (esconde
via classe de tamanho quadrado) + `aria-label` viram automaticamente um
tooltip on hover/focus (`showTooltip = iconOnly && aria-label`, ver
`Button.tsx:75`). `Button` sempre renderiza `children` independente de
`iconOnly` — quem decide não passar texto visível é o chamador. Logo
`SearchField` só precisa deixar de passar `buttonLabel` como children
quando `buttonIconOnly` for `true`.

Não há breaking change necessário: os textos atuais em inglês
(`"Search input"` / `"Search"`) viram os **defaults** das novas props,
então consumidores existentes (e os testes atuais, que buscam por
`/search/i`) continuam funcionando sem alteração.

## Solução

Novas props em `SearchFieldProps`:

```ts
interface SearchFieldProps {
  onSearch: (value: string) => void
  placeholder?: string
  isLoading?: boolean
  defaultValue?: string
  className?: string
  id?: string
  label?: string
  buttonLabel?: string
  buttonIconOnly?: boolean
}
```

- `id` — usado no `Input` interno; se omitido, cai para `useId()` (em
  vez do `'search-field'` fixo atual). Resolve a colisão de DOM
  independentemente de o consumidor customizar textos ou não.
- `label` — vira o `aria-label` do `Input`. Default `'Search input'`
  (comportamento atual preservado).
- `buttonLabel` — vira o `aria-label` do `Button` **e**, quando
  `buttonIconOnly` for `false` (default), também o texto visível
  (children) do botão. Default `'Search'`.
- `buttonIconOnly` — quando `true`, não passa `buttonLabel` como
  children do `Button`, só como `aria-label` (delega pro padrão
  icon-only + tooltip que o `Button` já implementa). Default `false`.

`SearchField.tsx` resultante:

```tsx
import React, { useId, useState } from 'react'
import { cn } from '../../../utils/cn'
import { Input } from '../../atoms/Input/Input'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

interface SearchFieldProps {
  onSearch: (value: string) => void
  placeholder?: string
  isLoading?: boolean
  defaultValue?: string
  className?: string
  id?: string
  label?: string
  buttonLabel?: string
  buttonIconOnly?: boolean
}

export function SearchField({
  onSearch,
  placeholder,
  isLoading = false,
  defaultValue = '',
  className,
  id,
  label = 'Search input',
  buttonLabel = 'Search',
  buttonIconOnly = false,
}: SearchFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [value, setValue] = useState(defaultValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoading) {
      onSearch(value)
    }
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn('flex items-center gap-2', className)}
    >
      <div className="relative flex-1">
        <Input
          id={inputId}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
        />
      </div>
      <Button
        type="submit"
        aria-label={buttonLabel}
        isLoading={isLoading}
        leftIcon={<Icon name="Search" size="sm" />}
        iconOnly={buttonIconOnly}
      >
        {buttonIconOnly ? null : buttonLabel}
      </Button>
    </form>
  )
}
```

## TDD — ordem de escrita dos testes

Adicionar a `SearchField.test.tsx` (testes atuais continuam passando sem
alteração, já que os defaults preservam o texto em inglês):

1. usa `id` fornecido no `Input` interno (`getByRole('textbox')` tem
   `id="products-search"` quando `id="products-search"` é passado).
2. quando `id` não é fornecido, duas instâncias de `SearchField`
   renderizadas juntas geram `id`s diferentes no `Input` interno
   (regressão do bug de colisão relatado na issue).
3. usa `label` fornecido como nome acessível do input (`getByRole
('textbox', { name: 'Buscar produtos' })`).
4. usa `buttonLabel` fornecido como texto visível e nome acessível do
   botão (`getByRole('button', { name: 'Buscar' })`, e
   `getByText('Buscar')` dentro do botão).
5. com `buttonIconOnly`, o botão não renderiza `buttonLabel` como texto
   visível (`queryByText(buttonLabel)` ausente), mas mantém o nome
   acessível (`getByRole('button', { name: buttonLabel })` continua
   resolvendo, via `aria-label`).
6. `id`, `label`, `buttonLabel` e `buttonIconOnly` juntos não quebram a
   acessibilidade (`axe` sem violações) — estende o teste de
   acessibilidade já existente com uma variante customizada em vez de só
   o caso default.

## Stories

`SearchField.stories.tsx`:

- `Localized` — reproduz o exemplo da issue (`id="products-search"`,
  `label="Buscar produtos"`, `buttonLabel="Buscar"`,
  `placeholder="Buscar por nome..."`), pra validar visualmente o caso de
  uso do `ecommerce`.
- `IconOnlyButton` — `buttonIconOnly` com `buttonLabel="Buscar"`, pra
  validar visualmente o padrão icon-only + tooltip que o `Button` já
  fornece.

## Verificação

```
npm run lint
npm test
npm run build
```

## Arquivos afetados

- `src/components/molecules/SearchField/SearchField.tsx` (novas props
  `id`/`label`/`buttonLabel`/`buttonIconOnly`, troca do `id` fixo por
  `useId()`)
- `src/components/molecules/SearchField/SearchField.test.tsx` (6 testes
  novos)
- `src/components/molecules/SearchField/SearchField.stories.tsx` (2
stories novas: `Localized`, `IconOnlyButton`)
</content>
