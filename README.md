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

3. **Dependência**, pelo nome com escopo:

   ```sh
   npm install @indianous/base-ds@^0.4.7
   ```

   O `package.json` do app fica com `"@indianous/base-ds": "^0.4.7"`, e os imports são
   `from '@indianous/base-ds'`. Não use um alias do npm (`"base-ds": "npm:@indianous/base-ds@…"`):
   o Dependabot não o resolve e deixa de propor atualizações
   ([issue #44](https://github.com/indianous/base-ds/issues/44)).

> **Não instale pelo diretório** (`npm install ../base-ds` ou
> `"@indianous/base-ds": "file:../base-ds"`).
> Isso cria um symlink para este repositório, e o código do base-ds (e o `lucide-react` que ele
> usa) passa a carregar o React de `base-ds/node_modules` — a cópia de desenvolvimento — em vez
> do React do app. Com duas instâncias de React carregadas, qualquer componente com hooks quebra
> com `Invalid hook call` ([issue #38](https://github.com/indianous/base-ds/issues/38)).

## Estilos

O CSS dos tokens é importado à parte, uma vez, no CSS global do app:

- Tailwind v3: `@import '@indianous/base-ds/styles';`
- Tailwind v4: `@import '@indianous/base-ds/styles/v4';` (inclui o bloco `@theme` que gera os utilitários
  `bg-primary`, `text-muted-foreground` etc.)

### Tema escuro

O tema claro é o padrão. Para o escuro, coloque a classe `dark` no `<html>`: os tokens de cor
(`--color-background`, `--color-primary` …) trocam de valor, e os componentes acompanham sem
nenhuma prop. A classe também funciona num trecho da página (`<section class="dark">`). O contraste
dos dois temas é verificado no base-ds.

- **Tailwind v4:** o `@import '@indianous/base-ds/styles/v4'` já liga a variante `dark:` à classe
  `.dark`, para o app usar `dark:` nos próprios estilos.
- **Tailwind v3:** para usar `dark:` no app, configure `darkMode: 'class'` no `tailwind.config`.
- Dê ao `<body>` o fundo e o texto do tema: `class="bg-background text-foreground"`.

A escolha do tema fica com o app: seguir o `prefers-color-scheme`, salvar a preferência do
visitante e oferecer um botão para alternar. Aplique a classe **antes da primeira pintura**, senão
a página aparece clara e depois escurece. O jeito comum é um script inline no `<head>`:

```html
<script>
  const saved = localStorage.getItem('theme')
  const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
  document.documentElement.classList.toggle('dark', dark)
</script>
```

No Next.js, o [`next-themes`](https://github.com/pacocoursey/next-themes) com `attribute="class"`
faz isso (script, preferência salva e sincronização entre abas).

## Atualizando

1. No app, `npm outdated @indianous/base-ds` mostra a versão instalada e a mais recente publicada.
2. Leia o [CHANGELOG no GitHub](https://github.com/indianous/base-ds/blob/main/CHANGELOG.md)
   das versões entre as duas — em especial a seção **"Ajustes necessários nos apps"**. (A cópia
   em `node_modules/@indianous/base-ds/CHANGELOG.md` é a da versão instalada, ainda sem as novidades.)
3. Atualize:
   - dentro da mesma série (`0.4.x`, correções e componentes novos):
     `npm update @indianous/base-ds`;
   - para uma série nova (`0.4.x → 0.5.0`, que pede ajustes no app):
     `npm install @indianous/base-ds@^0.5.0`.

Enquanto a versão for `0.x`, o `^` do npm só aceita atualizações de _patch_ — uma versão que
exige ajuste no app nunca entra sozinha por `npm update`.

### Dependabot

Para receber um PR a cada versão nova, crie `.github/dependabot.yml` no app:

```yaml
version: 2
registries:
  github-packages:
    type: npm-registry
    url: https://npm.pkg.github.com
    token: ${{ secrets.GH_PACKAGES_TOKEN }}
updates:
  - package-ecosystem: npm
    directory: /
    registries: [github-packages]
    schedule:
      interval: weekly
    # opcional: limita os PRs ao base-ds
    allow:
      - dependency-name: '@indianous/base-ds'
    # opcional: propõe o base-ds assim que ele é publicado
    cooldown:
      default-days: 3
      exclude:
        - '@indianous/base-ds'
```

O Dependabot só propõe uma versão depois que ela está publicada há 3 dias (a carência padrão).
Sem o bloco `cooldown`, a PR do base-ds chega uns 3 dias depois da publicação. O `exclude` tira só
o base-ds da carência, e as outras dependências continuam com ela.

`GH_PACKAGES_TOKEN` é um token clássico com `read:packages` (o mesmo tipo do token da
[Instalação](#instalação)), salvo como segredo **do Dependabot**, não de Actions:
`gh secret set GH_PACKAGES_TOKEN --app dependabot --repo <dono>/<app>`.

O PR do Dependabot não dispensa o passo 2: ele pode propor uma série nova, e os ajustes descritos
no CHANGELOG continuam por conta do app.

### Migrando do alias `base-ds`

Apps instalados com o alias `"base-ds": "npm:@indianous/base-ds@…"` (recomendado até a v0.4.7)
devem trocar para o nome com escopo:

1. `npm uninstall base-ds && npm install @indianous/base-ds@^<versão>`.
2. Imports: `from 'base-ds'` → `from '@indianous/base-ds'`, e `base-ds/styles` →
   `@indianous/base-ds/styles` (inclusive `/v4`).
3. Qualquer caminho `node_modules/base-ds` na configuração do app, como o `content` do Tailwind v3
   ou o `@source` do v4, passa a ser `node_modules/@indianous/base-ds`.

## Testando mudanças antes de publicar

Para experimentar no app uma mudança do base-ds que ainda não foi publicada, gere um tarball
local (o base-ds precisa estar clonado ao lado do app):

1. No base-ds: `npm run pack:local` → `.pack/indianous-base-ds-<versão>.tgz`.
2. No app: `npm install @indianous/base-ds@file:../base-ds/.pack/indianous-base-ds-<versão>.tgz`.
3. Ao terminar, volte para a versão publicada: `npm install @indianous/base-ds@^<versão>`.

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
  exporta (`node_modules/@indianous/base-ds/dist/index.d.ts`). Não recrie à mão uma receita que já é um
  componente.
- **Use os tokens.** Estilize com os utilitários ligados aos tokens (`bg-primary`,
  `text-muted-foreground`, `rounded-md`, ...), nunca com cores, espaçamentos, sombras ou raios
  literais.
- **Não contorne o base-ds no app.** Bug ou falta de algo (uma prop, uma variante, um
  componente) vira issue em [indianous/base-ds](https://github.com/indianous/base-ds/issues) —
  não um symlink, um wrapper que corrige comportamento ou uma cópia local do componente.

## Links com o roteador do app (Next.js)

O `Navbar`, o `Footer` e o `DropdownMenu` renderizam seus links como `<a href>`, o que recarrega a
página inteira a cada clique. Para navegar pelo roteador do app, passe o componente de link dele em
`linkComponent`:

```tsx
import Link from 'next/link'
import { Footer, Navbar } from '@indianous/base-ds'

<Navbar linkComponent={Link} items={[{ label: 'Projetos', href: '/projects', active: true }]} />
<Footer linkComponent={Link} columns={[...]} />
```

O componente recebe `href`, `className`, `children` e os atributos `aria-*` e `on*` de um `<a>`, e
precisa renderizar um `<a>` (o `Link` do Next.js já faz isso). O `Navbar` repassa o `linkComponent`
aos menus dropdown e fecha o drawer do celular quando um item é clicado.

O `Sidebar` resolve o mesmo problema com a prop `asChild` em cada item.

## Trecho para o `CLAUDE.md` dos apps

Copie para o `CLAUDE.md` de cada app que usa o base-ds:

```markdown
## Design system (base-ds)

- A UI vem do base-ds, instalado do GitHub Packages pelo nome com escopo
  (`"@indianous/base-ds": "^<versão>"`, `.npmrc` apontando `@indianous` para
  `https://npm.pkg.github.com`). Não usar alias `npm:` (o Dependabot não o resolve) nem instalar
  por `file:../base-ds` (symlink: causa duas instâncias de React).
- Antes de criar um componente de UI, conferir o que o base-ds exporta em
  `node_modules/@indianous/base-ds/dist/index.d.ts` e seguir as regras de
  `node_modules/@indianous/base-ds/README.md`.
- Estilizar só com os utilitários dos tokens do base-ds, sem valores literais.
- Faltou algo ou achou bug no base-ds: abrir issue em indianous/base-ds em vez de contornar no app.
- Ao começar uma tarefa de UI, rodar `npm outdated @indianous/base-ds`; se estiver atrás, ler
  https://github.com/indianous/base-ds/blob/main/CHANGELOG.md e atualizar conforme o README
  do base-ds.
```
