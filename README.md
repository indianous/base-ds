# base-ds

Design system privado em React + TypeScript: componentes estilizados com Tailwind CSS e
controlados por tokens de design expostos como CSS custom properties.

As mudanças de cada versão estão no [CHANGELOG](./CHANGELOG.md).

## Requisitos

- `react` e `react-dom` `^18 || ^19` — são `peerDependencies`: o app precisa tê-los
  instalados, e o base-ds usa a mesma cópia do app.
- Tailwind CSS v3 ou v4 no app.

## Instalação (consumo local)

O base-ds não está publicado em registry. Os apps instalam um tarball gerado a partir deste
repositório, clonado lado a lado com o app:

1. No base-ds:

   ```sh
   npm run pack:local
   ```

   Gera `.pack/base-ds-<versão>.tgz` (por exemplo `.pack/base-ds-0.2.0.tgz`).

2. No app, em `package.json`:

   ```json
   "dependencies": {
     "base-ds": "file:../base-ds/.pack/base-ds-0.2.0.tgz"
   }
   ```

   e depois `npm install`.

> **Não instale pelo diretório** (`npm install ../base-ds` ou `"base-ds": "file:../base-ds"`).
> Isso cria um symlink para este repositório, e o código do base-ds (e o `lucide-react` que ele
> usa) passa a carregar o React de `base-ds/node_modules` — a cópia de desenvolvimento — em vez
> do React do app. Com duas instâncias de React carregadas, qualquer componente com hooks quebra
> com `Invalid hook call` ([issue #38](https://github.com/indianous/base-ds/issues/38)).
>
> Se o app usava o paliativo de symlink manual em `base-ds/node_modules/{react,react-dom}`,
> remova-o.

## Estilos

O CSS dos tokens é importado à parte, uma vez, no CSS global do app:

- Tailwind v3: `@import 'base-ds/styles';`
- Tailwind v4: `@import 'base-ds/styles/v4';` (inclui o bloco `@theme` que gera os utilitários
  `bg-primary`, `text-muted-foreground` etc.)

## Atualizando

1. Compare a versão em uso no app (nome do `.tgz` no `package.json`) com a versão em
   `../base-ds/package.json`.
2. Leia o [CHANGELOG](./CHANGELOG.md) das versões entre as duas — em especial a seção
   **"Ajustes necessários nos apps"**.
3. No base-ds: `git pull` e `npm run pack:local`.
4. No app: troque o nome do `.tgz` no `package.json` para a versão nova e rode `npm install`.

Cada versão gera um tarball com nome próprio. Não reaproveite um nome antigo com conteúdo
novo: o `package-lock.json` do app guarda o hash do arquivo, e a instalação falha por
integridade ou mantém a versão anterior.

## Regras de uso

- **Use o que já existe.** Antes de criar um componente de UI no app, confira o que o base-ds
  exporta (`node_modules/base-ds/dist/index.d.ts`). Não recrie à mão uma receita que já é um
  componente.
- **Use os tokens.** Estilize com os utilitários ligados aos tokens (`bg-primary`,
  `text-muted-foreground`, `rounded-md`, ...), nunca com cores, espaçamentos, sombras ou raios
  literais.
- **Não contorne o base-ds no app.** Bug ou falta de algo (uma prop, uma variante, um
  componente) vira issue em [indianous/base-ds](https://github.com/indianous/base-ds/issues) —
  não um symlink, um wrapper que corrige comportamento ou uma cópia local do componente.

## Trecho para o `CLAUDE.md` dos apps

Copie para o `CLAUDE.md` de cada app que usa o base-ds:

```markdown
## Design system (base-ds)

- A UI vem do `base-ds`, instalado como tarball (`file:../base-ds/.pack/base-ds-<versão>.tgz`).
  Nunca trocar para `file:../base-ds` (symlink): causa duas instâncias de React.
- Antes de criar um componente de UI, conferir o que o base-ds exporta em
  `node_modules/base-ds/dist/index.d.ts` e seguir as regras de `node_modules/base-ds/README.md`.
- Estilizar só com os utilitários dos tokens do base-ds, sem valores literais.
- Faltou algo ou achou bug no base-ds: abrir issue em indianous/base-ds em vez de contornar no app.
- Ao começar uma tarefa de UI, comparar a versão do `.tgz` no `package.json` com
  `../base-ds/package.json`; se estiver atrás, ler o `../base-ds/CHANGELOG.md` e atualizar.
```
