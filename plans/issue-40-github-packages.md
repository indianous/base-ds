# Plano: publicar o base-ds no GitHub Packages (issue #40)

## Contexto

Depois da #38, os apps (lead-system, ecommerce) instalam o base-ds a partir de um tarball local
(`file:../base-ds/.pack/base-ds-<versão>.tgz`). Funciona, mas:

- nada avisa o app sobre versão nova (`npm outdated` e Dependabot não enxergam `file:`);
- atualizar exige gerar o tarball e editar o caminho à mão em cada app;
- só funciona com o base-ds clonado ao lado do app, na mesma máquina.

A issue pede publicar o pacote no registry npm do GitHub Packages, para os apps o instalarem como
uma dependência versionada comum.

## Decisões

### Nome: `@indianous/base-ds`

O registry npm do GitHub só aceita pacotes com escopo igual ao dono do repositório. O nome muda
de `base-ds` para `@indianous/base-ds`.

**Os apps não precisam trocar os imports.** Em vez de reescrever todo `from 'base-ds'` e
`'base-ds/styles'`, o app instala com um alias do npm:

```json
"base-ds": "npm:@indianous/base-ds@^0.3.0"
```

O pacote fica em `node_modules/base-ds`, então todos os imports, o `content`/`@source` do
Tailwind e o trecho de `CLAUDE.md` do README continuam valendo. `npm outdated` funciona com
alias. O suporte do Dependabot a alias do npm é mais limitado; isso é verificado no primeiro app
(ver "Riscos") e, se não funcionar, a alternativa é trocar para `"@indianous/base-ds"` e
reescrever os imports, o que é mecânico.

### Versão: `0.3.0`

Mudar o nome do pacote e a forma de instalar exige ajuste nos apps, então sobe o _minor_ pela
convenção da #38.

### Publicação por GitHub Actions, disparada por tag

É o primeiro workflow do repositório (hoje não há CI). `.github/workflows/publish.yml`:

```yaml
name: Publicar pacote
on:
  push:
    tags: ['v*']
permissions:
  contents: read
  packages: write
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: https://npm.pkg.github.com
          scope: '@indianous'
      - run: npm ci
      - name: Conferir se a tag bate com a versão do package.json
        run: test "v$(node -p "require('./package.json').version")" = "$GITHUB_REF_NAME"
      - run: npm run lint
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- Usa o `GITHUB_TOKEN` do próprio workflow: nenhum segredo para criar.
- A checagem de tag × versão impede publicar `v0.3.1` com o `package.json` ainda em `0.3.0`.
- Lint e testes unitários bloqueiam a publicação. **`npm run test:stories` fica de fora por
  enquanto**, porque as 28 falhas de acessibilidade da #41 bloqueariam toda publicação. Entra no
  workflow quando a #41 for resolvida (deixar comentário na #41 ao implementar).
- Só as tags novas disparam o workflow. `v0.1.0`…`v0.2.1` já estão no remoto e não são
  republicadas: a primeira versão no registry é a `0.3.0`.

### `package.json`

- `name`: `@indianous/base-ds`.
- Remover `"private": true` (o npm recusa publicar pacote privado).
- `publishConfig`: `{ "registry": "https://npm.pkg.github.com" }` — garante que um
  `npm publish` nunca vá para o npmjs.com público, nem por engano.
- `repository`: `{ "type": "git", "url": "git+https://github.com/indianous/base-ds.git" }` —
  liga o pacote ao repositório no GitHub (permissões e página do pacote).
- `scripts.prepublishOnly`: `npm run build` — o `dist/` publicado sempre sai de um build novo,
  incluindo o `'use client'` do pós-build.

### Visibilidade do pacote

O repositório é público, mas o registry npm do GitHub **exige token para instalar, mesmo pacote
público**. A proposta é deixar o pacote **privado**, coerente com o "private design system" do
CLAUDE.md. Após a primeira publicação, conferir em _Package settings_ que a visibilidade ficou
privada e que o repositório `indianous/base-ds` tem acesso de escrita (isso é o que a publicação
pelo workflow precisa nas versões seguintes).

### Fluxo `pack:local` continua

Serve para testar no app uma mudança do base-ds antes de publicar. O tarball passa a se chamar
`indianous-base-ds-<versão>.tgz`; no app, o alias fica
`"base-ds": "file:../base-ds/.pack/indianous-base-ds-<versão>.tgz"`.

## Configuração nos apps (documentada no README, aplicada em cada app)

1. Token clássico do GitHub com o escopo `read:packages` (o registry npm do GitHub não aceita
   token _fine-grained_). Guardado em variável de ambiente, nunca no repositório.
2. `.npmrc` do app (commitado, sem o token):

   ```ini
   @indianous:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
   ```

3. `package.json`: `"base-ds": "npm:@indianous/base-ds@^0.3.0"` e `npm install`.
4. Opcional: Dependabot (`.github/dependabot.yml`) com um `registries` do tipo `npm-registry`
   apontando para `https://npm.pkg.github.com` e o token como segredo do Dependabot.

## Mudanças no base-ds

1. `package.json` e `package-lock.json` (nome, `private`, `publishConfig`, `repository`,
   `prepublishOnly`, versão `0.3.0`).
2. `.github/workflows/publish.yml`.
3. `README.md`:
   - **Instalação** passa a ser pelo registry (passos acima), com o alias.
   - **Consumo local** vira "Testando mudanças antes de publicar" (`pack:local` com o nome novo
     do tarball).
   - **Atualizando**: `npm outdated base-ds`, ler o CHANGELOG, `npm install base-ds@latest`.
   - **Publicando uma versão** (para quem mantém o base-ds): subir a versão, CHANGELOG, commit,
     tag `v<versão>` e push da tag; o workflow publica.
   - Trecho de `CLAUDE.md` dos apps atualizado (alias, `npm outdated` em vez de comparar com
     `../base-ds/package.json`).
4. `CHANGELOG.md`: entrada `0.3.0` com "Ajustes necessários nos apps" (token, `.npmrc`, trocar
   o tarball pelo alias).
5. `CLAUDE.md`: seção de publicação (tag → workflow), `pack:local` com o nome novo, e a frase
   "No CI is configured" passa a dizer que o único workflow é o de publicação (sem rodar em PR).

## Testes (TDD)

Estender `src/package.test.ts` antes de mudar o `package.json`:

- `is published under the @indianous scope` (`name === '@indianous/base-ds'`)
- `is not marked as private`
- `publishes only to the GitHub Packages registry` (`publishConfig.registry`)
- `links the package to its GitHub repository` (`repository.url`)
- `builds before publishing` (`scripts.prepublishOnly` roda o build)

O workflow não tem teste unitário; é verificado por `npm publish --dry-run` e pela primeira
publicação real.

## Verificação

1. `npm run lint`, `npm test`, `npm run build`.
2. `npm publish --dry-run`: confere nome, versão, registry de destino e arquivos do pacote.
3. `npm run pack:local` e, no consumidor do scratchpad, instalar o tarball pelo alias
   (`"base-ds": "file:.../indianous-base-ds-0.3.0.tgz"`) e renderizar um componente com
   `require('base-ds')` e `import 'base-ds'` — prova que os imports dos apps não mudam.
4. **Publicação real (depois da sua confirmação):** push do commit e da tag `v0.3.0`,
   acompanhar o workflow com `gh run watch`, conferir o pacote em
   `github.com/indianous/base-ds/packages`.
5. Instalar do registry no consumidor do scratchpad com o alias e um token. O token atual do
   `gh` não tem `read:packages`; será preciso rodar `gh auth refresh -s read:packages` (você
   roda no terminal com `! gh auth refresh -s read:packages`).

## Riscos

- **Dependabot com alias:** se não abrir PR para `npm:@indianous/base-ds`, o app troca o alias
  pelo nome com escopo e reescreve os imports. Não bloqueia `npm outdated`.
- **Primeira publicação e visibilidade:** o comportamento de visibilidade/permissão do pacote
  recém-criado é conferido manualmente logo depois do primeiro publish (item 4).
- **Publicação é irreversível na prática:** o GitHub permite apagar versão de pacote privado, mas
  apps podem já ter instalado. Por isso o `--dry-run` e a checagem de tag × versão.

## Fora do escopo

- Aplicar `.npmrc`, token, alias e Dependabot nos apps (cada um no seu repositório, seguindo o
  README).
- Workflow de CI para PRs (lint/test em cada push) — pode virar outra issue.
- Rodar `test:stories` no workflow (depende da #41).

## Commit

`Publica o pacote como @indianous/base-ds no GitHub Packages (issue #40)`, com a versão `0.3.0`
no mesmo commit; a tag `v0.3.0`, que dispara a publicação, só é enviada após sua confirmação.
