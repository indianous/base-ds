# base-ds

Design system privado em React + TypeScript: componentes estilizados com Tailwind CSS e
controlados por tokens de design expostos como CSS custom properties.

As mudanças de cada versão estão no [CHANGELOG](./CHANGELOG.md).

## Requisitos

- `react` e `react-dom` `^18 || ^19` — são `peerDependencies`: o app precisa tê-los
  instalados, e o base-ds usa a mesma cópia do app.
- Tailwind CSS v3 ou v4 no app.

## Instalação

O base-ds é publicado como `@indianous/base-ds` no registry npm do GitHub Packages. O registry
exige autenticação para instalar, então cada app precisa de um token.

1. **Token.** Crie um token clássico do GitHub (_Settings → Developer settings → Personal access
   tokens → Tokens (classic)_) com o escopo `read:packages` — o registry npm do GitHub não aceita
   token _fine-grained_. Exporte-o no seu shell (por exemplo no `~/.bashrc`), nunca no
   repositório:

   ```sh
   export GITHUB_PACKAGES_TOKEN=ghp_...
   ```

2. **`.npmrc` do app** (pode ser commitado, porque não contém o token):

   ```ini
   @indianous:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
   ```

3. **Dependência com alias**, para o pacote continuar em `node_modules/base-ds` e os imports
   `from 'base-ds'` / `'base-ds/styles'` não mudarem:

   ```sh
   npm install base-ds@npm:@indianous/base-ds@^0.3.0
   ```

   O `package.json` do app fica com `"base-ds": "npm:@indianous/base-ds@^0.3.0"`.

> **Não instale pelo diretório** (`npm install ../base-ds` ou `"base-ds": "file:../base-ds"`).
> Isso cria um symlink para este repositório, e o código do base-ds (e o `lucide-react` que ele
> usa) passa a carregar o React de `base-ds/node_modules` — a cópia de desenvolvimento — em vez
> do React do app. Com duas instâncias de React carregadas, qualquer componente com hooks quebra
> com `Invalid hook call` ([issue #38](https://github.com/indianous/base-ds/issues/38)).

## Estilos

O CSS dos tokens é importado à parte, uma vez, no CSS global do app:

- Tailwind v3: `@import 'base-ds/styles';`
- Tailwind v4: `@import 'base-ds/styles/v4';` (inclui o bloco `@theme` que gera os utilitários
  `bg-primary`, `text-muted-foreground` etc.)

## Atualizando

1. No app, `npm outdated base-ds` mostra a versão instalada e a mais recente publicada.
2. Leia o [CHANGELOG no GitHub](https://github.com/indianous/base-ds/blob/main/CHANGELOG.md)
   das versões entre as duas — em especial a seção **"Ajustes necessários nos apps"**. (A cópia
   em `node_modules/base-ds/CHANGELOG.md` é a da versão instalada, ainda sem as novidades.)
3. Atualize:
   - dentro da mesma série (`0.3.x`, correções e componentes novos): `npm update base-ds`;
   - para uma série nova (`0.3.x → 0.4.0`, que pede ajustes no app):
     `npm install base-ds@npm:@indianous/base-ds@^0.4.0`.

Enquanto a versão for `0.x`, o `^` do npm só aceita atualizações de _patch_ — uma versão que
exige ajuste no app nunca entra sozinha por `npm update`.

## Testando mudanças antes de publicar

Para experimentar no app uma mudança do base-ds que ainda não foi publicada, gere um tarball
local (o base-ds precisa estar clonado ao lado do app):

1. No base-ds: `npm run pack:local` → `.pack/indianous-base-ds-<versão>.tgz`.
2. No app: `npm install base-ds@file:../base-ds/.pack/indianous-base-ds-<versão>.tgz`.
3. Ao terminar, volte para a versão publicada: `npm install base-ds@npm:@indianous/base-ds@^<versão>`.

Use sempre o tarball, nunca o diretório (ver o aviso em [Instalação](#instalação)).

## Publicando uma versão

Para quem mantém o base-ds:

1. Suba a versão no `package.json` (`npm version <versão> --no-git-tag-version`) seguindo o
   [CHANGELOG](./CHANGELOG.md): _minor_ quando os apps precisam de ajuste, _patch_ no resto.
2. Adicione a entrada da versão no `CHANGELOG.md`.
3. Commit, `git tag v<versão>` e `git push origin main v<versão>`.

O push da tag dispara o workflow `.github/workflows/publish.yml`, que confere se a tag bate com o
`package.json`, roda lint e testes, faz o build e publica. Acompanhe com `gh run watch`.

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

- A UI vem do `base-ds`, instalado do GitHub Packages como alias
  (`"base-ds": "npm:@indianous/base-ds@^<versão>"`, `.npmrc` apontando `@indianous` para
  `https://npm.pkg.github.com`). Nunca instalar por `file:../base-ds` (symlink): causa duas
  instâncias de React.
- Antes de criar um componente de UI, conferir o que o base-ds exporta em
  `node_modules/base-ds/dist/index.d.ts` e seguir as regras de `node_modules/base-ds/README.md`.
- Estilizar só com os utilitários dos tokens do base-ds, sem valores literais.
- Faltou algo ou achou bug no base-ds: abrir issue em indianous/base-ds em vez de contornar no app.
- Ao começar uma tarefa de UI, rodar `npm outdated base-ds`; se estiver atrás, ler
  https://github.com/indianous/base-ds/blob/main/CHANGELOG.md e atualizar conforme o README
  do base-ds.
```
