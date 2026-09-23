# Plano: impedir quebra de linha dentro do `Badge` (issue #46)

## Contexto

A classe base do `Badge` (`src/components/atoms/Badge/Badge.tsx`) é só
`'inline-flex items-center font-medium'`. Se o texto tem espaços e o badge fica num espaço
estreito, o texto quebra dentro da pílula. Por exemplo, "Casa e Jardim" vira três linhas nas tags
de categoria do ecommerce. Um badge é um rótulo curto, e quebrar linha dentro dele não tem uso.

Hoje o ecommerce contorna o problema passando `className="whitespace-nowrap"` em cada `Badge`.

## Mudança

Colocar `whitespace-nowrap` na classe base:

```tsx
'inline-flex items-center whitespace-nowrap font-medium',
```

Quem quiser o comportamento antigo passa `className="whitespace-normal"`. O `cn()` usa o
tailwind-merge, então o `className` do consumidor substitui a classe base.

## TDD

Em `Badge.test.tsx`, escrever primeiro dois testes e ver que falham:

1. `it('does not wrap text by default (whitespace-nowrap)')`: `toHaveClass('whitespace-nowrap')`.
2. `it('lets className override the no-wrap behavior')`: com `className="whitespace-normal"`, o
   elemento tem `whitespace-normal` e **não** tem `whitespace-nowrap`. Esse teste garante o
   caminho de saída que a issue promete.

Depois aplicar a mudança e confirmar que os testes passam.

## Story

Criar em `Badge.stories.tsx` a story `LongTextInNarrowContainer`: um badge "Casa e Jardim"
dentro de um contêiner estreito (por exemplo, `w-16`). Ela documenta o comportamento e também
passa pelo axe no `test:stories`.

## Impacto em quem usa o `Badge` dentro da biblioteca

- `MultiSelect` e `TagsInput` usam o `Badge` como chip, dentro de um contêiner com `flex-wrap`.
  Com a mudança, um chip de texto muito longo deixa de quebrar por dentro e pode passar da largura
  do campo. Considero aceitável e coerente com a issue, porque chips são rótulos curtos. O caso
  fica registrado no CHANGELOG.
- `FilterDropdown` (contador) e o `KanbanBoard` (stories) usam textos curtos e não mudam.

## Versão e changelog

Versão **0.4.1** (patch). Nenhum app precisa de ajuste, e o workaround do ecommerce continua
funcionando: ele fica só redundante. Essa publicação patch também pode servir de teste para o
Dependabot da #44, se algum app já estiver configurado.

Entrada no `CHANGELOG.md`, seção **Alterado**: "`Badge` não quebra mais linha dentro da pílula
(`whitespace-nowrap`); para voltar ao comportamento anterior, passe
`className="whitespace-normal"`". Mais uma nota: os apps podem remover o
`className="whitespace-nowrap"` que usavam como workaround.

Commit (em português) com o bump para `0.4.1` e o CHANGELOG, seguido da tag `v0.4.1`. O push da
tag fica a critério do autor.

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`.
