# Plano: componente de aviso fixo `Alert` (issue #45)

## Contexto

O ecommerce precisa de avisos fixos, que fazem parte do layout:

- a faixa "Você está vendo a loja como um cliente" com o botão "Voltar ao painel";
- o aviso "Confirme seu e-mail…" com o botão "Reenviar e-mail".

O base-ds não tem nenhum componente assim. O `Toast` não serve: ele flutua, some sozinho e sempre
mostra o botão de fechar.

## Decisões

- **Nome:** `Alert`, o nome mais comum em outras bibliotecas (shadcn, MUI, Chakra), que cobre
  tanto o uso em faixa quanto o uso em bloco. `Banner` combina mal com `layout="inline"` e se
  confunde com o landmark `role="banner"`.
- **Camada:** `molecules`, porque o `Alert` compõe dois átomos, `Icon` e `Button`. Fica em
  `src/components/molecules/Alert/`.
- **Nomes das variantes:** `info | success | warning | danger | neutral`, com `info` por padrão. O
  nome é `danger`, como no `Badge` e no `Button`, e não `destructive` como no `Toast`, que é a
  exceção.
- **Versão:** 0.4.2 (patch). O CHANGELOG classifica "componentes novos sem impacto" como patch.

## API

```tsx
type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral'
type AlertLayout = 'full' | 'inline'

interface AlertOwnProps {
  variant?: AlertVariant // padrão 'info'
  layout?: AlertLayout // padrão 'inline'
  icon?: React.ReactNode // undefined → ícone padrão da variante; null → sem ícone
  title?: React.ReactNode
  children?: React.ReactNode // descrição
  actions?: React.ReactNode
  onDismiss?: () => void
  dismissLabel?: string // padrão 'Dismiss'
}

export type AlertProps = AlertOwnProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof AlertOwnProps>
```

O `Omit` tira o `title` nativo (string) para dar lugar ao `title` como ReactNode. Os demais
atributos (`className`, `id`, `aria-*`, `data-*`, `role`…) são repassados à `<div>` raiz.

## Aparência (só tokens)

Tabelas `Record` compostas com `cn()`:

| Variante  | Contêiner                                                                  | Ícone padrão    |
| --------- | -------------------------------------------------------------------------- | --------------- |
| `info`    | `bg-info-muted text-info-muted-fg border-info-border`                      | `Info`          |
| `success` | `bg-success-muted text-success-muted-fg border-success-border`             | `CheckCircle2`  |
| `warning` | `bg-warning-muted text-warning-muted-fg border-warning-border`             | `AlertTriangle` |
| `danger`  | `bg-destructive-muted text-destructive-muted-fg border-destructive-border` | `XCircle`       |
| `neutral` | `bg-muted text-foreground border-border`                                   | `Info`          |

Todos os pares `*-muted-fg`/`*-muted` e `muted-foreground`/`muted` já passam no AA no
`contrast.test.ts`. O `foreground` sobre `muted` (usado no `neutral`) é neutral-900 sobre
neutral-100, bem acima de 4.5.

| Layout   | Classes                                      |
| -------- | -------------------------------------------- |
| `full`   | `w-full border-b px-4 py-3` (sem arredondar) |
| `inline` | `rounded-lg border p-4`                      |

Estrutura:

```
<div role=… className="flex items-start gap-3 …">
  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
    <div className="flex min-w-0 flex-1 basis-48 items-start gap-3">
      {ícone (aria-hidden, flex-shrink-0)}
      <div className="min-w-0 text-sm">
        {title && <p className="font-semibold">…</p>}
        {children && <div>…</div>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap gap-2">…</div>}
  </div>
  {onDismiss && <Button variant="ghost" size="sm" iconOnly aria-label={dismissLabel}>X</Button>}
</div>
```

As ações ficam à direita do texto quando há espaço e descem para baixo dele quando não há
(`flex-wrap` com `basis-48` no texto). Isso depende da largura real do `Alert`, não da tela.
Um primeiro teste com `sm:flex-row` quebrava dentro de um card estreito no desktop: o breakpoint
olha a largura da tela, então o texto ficava com uma palavra por linha. O botão de fechar fica
sempre no canto superior direito, fora do bloco que quebra.

## Semântica

- `role` padrão: `status` para `info`, `success` e `neutral`; `alert` para `warning` e `danger`.
- O consumidor pode passar `role` e `aria-label`, que sobrescrevem o padrão. Isso atende o
  pedido da issue de uma `region` com nome:
  `<Alert role="region" aria-label="Aviso da equipe">`. Sem `role`, o `aria-label` só dá nome ao
  `status`/`alert`.
- O ícone padrão é decorativo (`aria-hidden`), porque a variante já está no `role` e no texto.

## TDD — testes (`Alert.test.tsx`), escritos antes da implementação

1. renderiza o título e a descrição (`children`);
2. aplica as classes de cada variante (`it.each`);
3. `role="status"` para info/success/neutral e `role="alert"` para warning/danger;
4. um `role` passado substitui o padrão (`region` com `aria-label` é achado por
   `getByRole('region', { name })`);
5. `layout="full"` usa `border-b` sem `rounded-lg`; `inline` (padrão) usa `rounded-lg border`;
6. mostra o ícone padrão da variante (um `svg` com `aria-hidden`), usa o `icon` passado e não
   mostra ícone com `icon={null}`;
7. renderiza `actions`, inclusive `Button as="a"` (o link aparece com `role="link"`);
8. sem `onDismiss`, não há botão de fechar;
9. com `onDismiss`, o botão "Dismiss" chama o callback ao ser clicado (`userEvent`);
10. `dismissLabel` troca o `aria-label` do botão;
11. repassa `className` (misturado) e atributos HTML (`id`, `data-testid`);
12. não tem violações no axe: um caso completo, com título, ações e fechar.

## Stories (`Alert.stories.tsx`)

- uma story por variante (`Info`, `Success`, `Warning`, `Danger`, `Neutral`);
- `FullWidth` com o caso da equipe: `neutral`, `layout="full"`, ícone `Eye`, ação
  `Button as="a"` "Voltar ao painel";
- `WithActions` com o caso do e-mail: `warning`, ação "Reenviar e-mail";
- `Dismissible`;
- `WithoutIcon`;
- `LongContentWithActions` num contêiner estreito, para verificar a quebra quando falta espaço;
- `AllVariants`.

Todas passam pelo axe (contraste incluso) no `test:stories`.

## API pública, versão e changelog

- `src/index.ts`, seção Molecules: exportar `Alert` e os tipos `AlertProps`, `AlertVariant` e
  `AlertLayout`.
- `package.json` e `package-lock.json` sobem para **0.4.2**.
- `CHANGELOG.md`, seção **Adicionado**: o `Alert` com um resumo da API, sem "Ajustes necessários".
- README: conferir se existe uma lista de componentes e, se existir, incluir o `Alert`.
- Commits em português (plano; implementação + versão), seguidos da tag `v0.4.2`. O push fica
  para a sua confirmação.

## Verificação

`npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`, `npm run test:stories` e
`npm run build`.
