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

O Tailwind do app também precisa ler as classes usadas dentro dos componentes. Aponte para a
**pasta** `dist`, não para um arquivo: desde a v0.4.11, cada componente fica num arquivo próprio.

- Tailwind v4: `@source '../node_modules/@indianous/base-ds/dist';` (caminho relativo ao CSS)
- Tailwind v3: `'./node_modules/@indianous/base-ds/dist/**/*.js'` no `content`

### Personalizando o tema

Um app pode trocar cores, fontes, espaçamento, raios, bordas e sombras do base-ds com um arquivo de
configuração. O comando `base-ds-theme` valida esse arquivo e gera um CSS para a web e um JSON para
o React Native.

1. **`base-ds.config.ts`** na raiz do app:

   ```ts
   import { defineTheme } from '@indianous/base-ds/theme'

   export default defineTheme({
     colors: {
       light: { primary: 'violet-700', 'primary-hover': 'violet-800' },
       dark: { primary: 'violet-400', 'primary-hover': 'violet-300' },
     },
     fontFamily: { sans: "'Inter', ui-sans-serif, system-ui, sans-serif" },
     spacing: { 4: '18px' },
     radius: { md: '8px' },
   })
   ```

   As chaves são os nomes dos tokens: o editor autocompleta e aponta um nome errado. As cores
   aceitam um nome da paleta (`'violet-600'`) ou um hex (`'#5b21b6'`). Só tokens que já existem
   podem ser personalizados.

2. **`npx base-ds-theme`** gera o `base-ds.theme.css` e o `base-ds.theme.json` ao lado do config.
   Coloque-o num script, como `"prebuild": "base-ds-theme"`, e use `base-ds-theme --check` no CI
   para barrar arquivos desatualizados.

3. **Importe o CSS depois do base-ds:**

   ```css
   @import '@indianous/base-ds/styles/v4';
   @import './base-ds.theme.css';
   ```

O comando **falha** quando:

- um token ou uma cor não existe;
- uma combinação de texto e fundo fica abaixo de 4,5:1 em algum tema, usando os mesmos pares que o
  base-ds garante para os próprios tokens. A mensagem diz o par, o tema e a razão, por exemplo
  `primary-foreground sobre primary (claro): 1,85:1, mínimo 4,50:1`.

Ele **avisa** quando uma cor que muda com o tema é personalizada só em `light`: o tema escuro
continua com o valor do base-ds. Com `--strict`, o aviso vira erro. Os caminhos dos arquivos
gerados podem mudar em `output: { css, json }`.

O `.ts` é lido pelo próprio Node, que remove os tipos sozinho a partir da versão 22.18. Com Node
mais antigo, use `base-ds.config.mjs`. Para chamar de um script próprio, `buildTheme(config)`, de
`@indianous/base-ds/theme`, devolve o CSS, o JSON, os erros e os avisos sem escrever nada.

Sobrescrever variáveis à mão num CSS depois do import continua funcionando, mas sem nenhuma dessas
verificações.

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

## Tamanho do bundle

Importar um componente leva ao cliente só ele e o que ele usa: os imports continuam
`from '@indianous/base-ds'`, e o bundler do app descarta o resto. Numa página Next.js com
`Heading`, `Text`, `Button` e `Container`, o base-ds acrescenta ~34 KB (11 KB com gzip).

A exceção é o `Icon`: ele busca o ícone pelo nome, então todos os ícones do `lucide-react`
(~650 KB) entram no bundle de quem o usa. No app, importe o ícone direto:

```tsx
import { MenuIcon } from 'lucide-react'

;<MenuIcon className="h-5 w-5" aria-hidden="true" />
```

## Links com o roteador do app (Next.js)

O `Navbar`, o `Footer`, o `DropdownMenu` e o `Breadcrumb` renderizam seus links como `<a href>`, o que recarrega a
página inteira a cada clique. Para navegar pelo roteador do app, passe o componente de link dele em
`linkComponent`:

```tsx
// app/AppLink.tsx
'use client'
export { default as AppLink } from 'next/link'
```

```tsx
// em qualquer página ou layout, inclusive Server Components
import { Footer, Navbar } from '@indianous/base-ds'
import { AppLink } from './AppLink'

<Navbar linkComponent={AppLink} items={[{ label: 'Projetos', href: '/projects', active: true }]} />
<Footer linkComponent={AppLink} columns={[...]} />
```

O arquivo `'use client'` é necessário. O `Navbar` e o `Footer` são client components, e um Server
Component só consegue passar a eles um componente que venha de um arquivo `'use client'`. O
`import Link from 'next/link'` direto num Server Component falha no build, com
`Functions cannot be passed directly to Client Components`. Dentro de um client component, o
`Link` pode ser passado direto.

O componente recebe `href`, `className`, `children` e os atributos `aria-*` e `on*` de um `<a>`, e
precisa renderizar um `<a>` (o `Link` do Next.js já faz isso). O `Navbar` repassa o `linkComponent`
aos menus dropdown e fecha o drawer do celular quando um item é clicado.

O `Sidebar` resolve o mesmo problema com a prop `asChild` em cada item.

## Imagens com o Next.js

O `Image` carrega em modo lazy (`loading="lazy"`) e decodifica de forma assíncrona por padrão.
Marque a imagem principal da página (o banner, a foto do produto) com `priority`, que vira
`loading="eager"` e `fetchPriority="high"`. Sem isso, ela espera o layout e o LCP piora. Passe
também `sizes`, para o navegador escolher a resolução certa.

Para otimizar as imagens com o `next/image` (redimensionamento, WebP/AVIF, `srcset`), passe um
componente de imagem em `imageComponent`. Como no `linkComponent`, ele fica num arquivo
`'use client'`:

```tsx
// app/StoreImage.tsx
'use client'
import NextImage from 'next/image'
import type { ImageComponent } from '@indianous/base-ds'

export const StoreImage: ImageComponent = (props) => <NextImage {...props} fill />
```

```tsx
import { Image, ImageGallery } from '@indianous/base-ds'
import { StoreImage } from './StoreImage'

<Image imageComponent={StoreImage} src={url} alt="Blusa" aspectRatio="square" sizes="25vw" />
<ImageGallery imageComponent={StoreImage} images={images} sizes="(min-width: 768px) 50vw, 100vw" />
```

- O componente recebe só atributos padrão de `<img>` (`src`, `alt`, `className`, `onError`,
  `loading`, `decoding`, `fetchPriority`, `sizes`, `width` e `height`). Não há `priority`, que o
  `next/image` do Next.js 16 descontinuou.
- Com `fill`, a imagem ocupa a `<div>` do `Image`, que precisa ter altura: use `aspectRatio` ou dê
  um tamanho no `className`. Não passe `width`/`height` junto com `fill`.
- Imagens de outro domínio precisam estar em `images.remotePatterns` no `next.config`.
- No `ImageGallery`, a imagem principal tem `priority` por padrão (use `priority={false}` se a
  galeria ficar abaixo da dobra), e as miniaturas carregam em modo lazy com `sizes="64px"`. O zoom
  continua um `<img>` com a imagem original.
- O `fetchPriority` foi verificado com o React 19. Com o React 18, o React pode avisar no console
  e ignorar o atributo. O resto continua funcionando.

## Realce de código

O base-ds tem tokens para realce de sintaxe, nos dois temas e com contraste verificado contra o
fundo do bloco: `--color-code-background`, `--color-code-foreground` e
`--color-code-token-<tipo>` (`comment`, `keyword`, `string`, `string-expression`, `constant`,
`function`, `parameter`, `punctuation` e `link`). No Tailwind, eles viram utilitários como
`bg-code-background` e `text-code-token-keyword`.

Os nomes seguem as variáveis do tema `css-variables` do [Shiki](https://shiki.style). Assim, o
realce roda no build, sem JS no cliente, e acompanha o tema escuro. O base-ds não depende do Shiki:
o app cria o tema com o prefixo dos tokens.

```ts
import { codeToHtml, createCssVariablesTheme } from 'shiki'

const baseDsTheme = createCssVariablesTheme({
  name: 'base-ds',
  variablePrefix: '--color-code-',
  fontStyle: true,
})

const html = await codeToHtml(code, { lang: 'ts', theme: baseDsTheme })
```

```tsx
import { Code, CodeBlock } from '@indianous/base-ds'

<CodeBlock html={html} language="TypeScript" label="Exemplo de código" />
<CodeBlock language="Bash">npm run build</CodeBlock>  {/* sem realce */}
<p>Rode <Code>npm install</Code> antes.</p>
```

- O `html` é inserido como HTML: passe só a saída do realçador, gerada no build, **nunca** texto
  vindo de usuários.
- Para Markdown, o `@shikijs/rehype` aceita o mesmo tema
  (`rehypePlugins: [[rehypeShiki, { theme: baseDsTheme }]]`). O `<pre>` que ele gera pode ser
  mapeado para o `CodeBlock`, ou estilizado com os mesmos tokens.
- O tema `css-variables` tem só 9 tipos de token, menos que os temas comuns do Shiki, e as cores
  ANSI (da linguagem `ansi`) ficam de fora.

## React Native (NativeWind)

Os componentes do base-ds são React DOM e não rodam em React Native. Um app mobile pode usar os
**tokens** e os **mesmos nomes de utilitários** (`bg-primary`, `p-4`, `text-lg`) com o
[NativeWind](https://www.nativewind.dev) v4, que usa Tailwind v3, para montar componentes próprios
com os mesmos nomes e variantes do base-ds.

1. **Preset** no `tailwind.config.js` do app:

   ```js
   module.exports = {
     content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
     presets: [require('nativewind/preset'), require('@indianous/base-ds/tailwind-preset')],
   }
   ```

   As cores do preset leem as variáveis `--color-*`, e o resto (espaçamento, tipografia, raios,
   bordas) tem o valor direto.

2. **Cores do tema** na raiz do app, com os valores de `themeVariables` e o `vars()` do
   NativeWind:

   ```tsx
   import { useColorScheme, View } from 'react-native'
   import { vars } from 'nativewind'
   import { themeVariables } from '@indianous/base-ds/tokens'

   export function ThemeRoot({ children }: { children: React.ReactNode }) {
     const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light'
     return <View style={[{ flex: 1 }, vars(themeVariables[colorScheme])]}>{children}</View>
   }
   ```

3. **`inlineRem: 16`** no `withNativeWind` do `metro.config.js`. No nativo, o NativeWind troca
   `rem` por `px` com base 14 por padrão. Os tamanhos de fonte do base-ds usam base 16, como na web.

O que não funciona igual no React Native:

- `fontFamily`: o preset traz as pilhas de fonte da web, que o React Native não entende. Sobrescreva
  `theme.extend.fontFamily` com o nome das fontes carregadas no app.
- Sombras (`shadow-*`): o NativeWind só aproveita parte delas, com diferenças entre iOS e Android.

Com um tema personalizado (veja "Personalizando o tema"), use o JSON gerado no lugar do
`themeVariables` e do preset padrão:

```js
// tailwind.config.js
const { createTailwindPreset } = require('@indianous/base-ds/theme')
const theme = require('./base-ds.theme.json')

module.exports = { presets: [require('nativewind/preset'), createTailwindPreset(theme)] }
// na raiz do app: vars(theme.themeVariables[colorScheme])
```

Esse fluxo segue a documentação do NativeWind v4 e não foi testado num app real.

O `@indianous/base-ds/tokens` também serve fora do React Native: tem as cores primitivas e
semânticas dos dois temas (`colors.semantic` e `colors.semanticDark`), o espaçamento, a tipografia,
as bordas e as sombras, sem React e sem DOM (para gráficos nativos, e-mails ou scripts de build).
O preset também funciona num app web com Tailwind v3.

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
