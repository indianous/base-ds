# Plano: verificar se o Dependabot atualiza o base-ds instalado via alias `npm:` (issue #44)

## Contexto

Desde a v0.3.0 (#40), os apps instalam o base-ds do GitHub Packages com um alias do npm:

```json
"base-ds": "npm:@indianous/base-ds@^0.4.0"
```

O suporte do Dependabot a dependências com alias `npm:` é limitado e nunca foi verificado. Se ele
não abrir PR, os apps só descobrem uma versão nova rodando `npm outdated` à mão.

Diferente das outras issues, quase todo o trabalho é **fora deste repositório**, nos apps. Aqui só
muda o README (e, no pior caso, o trecho do `CLAUDE.md` dos apps que o README traz).

## Situação atual dos apps (levantada em 2026-09-26)

| repositório            | dependência do base-ds                           | `dependabot.yml` | segredos do Dependabot |
| ---------------------- | ------------------------------------------------ | ---------------- | ---------------------- |
| `ecommerce-frontend`   | `npm:@indianous/base-ds@^0.4.0`, lock em `0.4.2` | não tem          | nenhum                 |
| `lead-system-frontend` | `file:../../../node/base-ds`                     | não tem          | —                      |

- **`ecommerce-frontend` é o candidato ao teste.** Ele já usa o alias, e o `.npmrc` aponta o escopo
  `@indianous` para o GitHub Packages, com o token em `${GITHUB_PACKAGES_TOKEN}` (variável de
  ambiente, sem token no repositório).
- **Não é preciso publicar outra versão para o teste.** O lock do app está em `0.4.2`, e já
  existem `0.4.3` a `0.4.7`. Na primeira execução, o Dependabot já tem o que propor.
- **`lead-system-frontend` ainda usa `file:`**, o que o `CLAUDE.md` deste repo proíbe desde a #38:
  o symlink resulta em duas instâncias do React. Ele não serve para o teste, e isso é um problema à
  parte, fora desta issue. Sugiro abrir uma issue no próprio `lead-system-frontend`.

## Etapas

### 1. Token (manual, feito por você)

O Dependabot não usa o `GITHUB_TOKEN` para ler pacotes de outro repositório. É preciso um
**personal access token (classic)** com o escopo `read:packages`, salvo como segredo **do
Dependabot**, não de Actions, no `ecommerce-frontend`:

```sh
gh secret set GH_PACKAGES_TOKEN --app dependabot --repo indianous/ecommerce-frontend
```

(o comando pede o valor do token; não vou manipular nem ver o token.)

### 2. `dependabot.yml` no `ecommerce-frontend`

Em uma branch do app, com PR, criar `.github/dependabot.yml`:

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
    allow:
      - dependency-name: base-ds
      - dependency-name: '@indianous/base-ds'
```

O `allow` limita o teste ao base-ds, para o resultado não se misturar com PRs de outras
dependências. Listo os dois nomes porque não se sabe qual deles o Dependabot vai reconhecer: o do
alias ou o real. Depois do teste, o `allow` sai (ou fica, se preferir PRs só do base-ds).

### 3. Rodar e observar

Depois do merge do `dependabot.yml`, disparar a execução em **Insights → Dependency graph →
Dependabot → Check for updates** (só pela interface) ou esperar a execução semanal. Conferir:

- se abre um PR levando o base-ds de `0.4.2` para `0.4.7`;
- se o PR mantém o alias (`"base-ds": "npm:@indianous/base-ds@…"`) no `package.json` e atualiza o
  `package-lock.json` sem quebrar a entrada `node_modules/base-ds`;
- se o CI do app passa no PR;
- se não abrir PR, o log da execução, em **Dependabot → Recent update jobs**. O log diz se a
  dependência foi ignorada, se a autenticação falhou (problema do token, não do alias) ou se o alias
  não foi entendido.

Os PRs e os logs podem ser consultados por `gh` e pela API, e eu faço essa parte.

### 4a. Se funcionar

No README do base-ds, seção **Atualizando**, adicionar um passo sobre o Dependabot: o
`dependabot.yml` acima (sem o `allow`, ou com ele se preferir), o segredo `GH_PACKAGES_TOKEN` do
Dependabot com `read:packages`, e um aviso de que o PR do Dependabot não substitui a leitura do
CHANGELOG ("Ajustes necessários nos apps").

### 4b. Se não funcionar

Migrar os apps do alias para o nome com escopo:

- `package.json`: `"@indianous/base-ds": "^0.4.7"` no lugar de `"base-ds": "npm:…"`
- imports: `from 'base-ds'` → `from '@indianous/base-ds'` e `'base-ds/styles'` →
  `'@indianous/base-ds/styles'`
- conferir o `content` do Tailwind e qualquer caminho `node_modules/base-ds` na configuração do
  app.

A migração em cada app é um trabalho próprio, com plano próprio no repositório de cada app. Aqui,
atualizar no README as seções **Instalação**, **Estilos**, **Atualizando** e o **trecho para o
`CLAUDE.md` dos apps**, e repetir a etapa 3 para confirmar que o Dependabot abre PR com o nome com
escopo.

## Versão e changelog

O base-ds não muda de comportamento em nenhum dos casos. A mudança no README vai num commit sem
bump de versão e segue para o tarball na próxima publicação. Uma entrada no CHANGELOG só se o caso
4b acontecer, na seção "Ajustes necessários nos apps", porque a instalação recomendada muda.

## O que depende de você

1. Criar o token `read:packages` e salvar como segredo do Dependabot (etapa 1).
2. Autorizar o PR no `ecommerce-frontend` (etapa 2): eu clono, crio a branch, abro o PR, e você faz
   o merge, ou autoriza que eu faça.
3. Disparar o "Check for updates" pela interface, ou esperar a execução semanal.

## Resultado do teste (2026-09-27) e próximos passos

As etapas 1 a 3 foram feitas no `ecommerce-frontend` (indianous/ecommerce-frontend#24). O resultado
foi o **caso 4b**: com o alias, o Dependabot procura o pacote pelo nome `base-ds`
(`GET https://npm.pkg.github.com/base-ds → 404`, depois no registry.npmjs.org → 404) e falha com
`dependency_file_not_resolvable`, apesar de a autenticação funcionar. O app já foi migrado para o
nome com escopo, e a execução seguinte do Dependabot resolveu `@indianous/base-ds` (`200`,
"Checking if @indianous/base-ds 0.4.7 needs updating"). Não abriu PR porque o app já estava na
versão mais nova.

Neste repositório, falta atualizar a documentação, conforme o caso 4b.

### README

- **Instalação, passo 3**: trocar a "Dependência com alias" por "Dependência":
  `npm install @indianous/base-ds@^0.4.7`, com o `package.json` do app ficando
  `"@indianous/base-ds": "^0.4.7"`. Explicar em uma frase por que não usar alias: o Dependabot não
  o resolve (#44). O aviso sobre `file:` fica, com o exemplo trocado para
  `"@indianous/base-ds": "file:../base-ds"`.
- **Estilos**: `@import '@indianous/base-ds/styles';` (v3) e
  `@import '@indianous/base-ds/styles/v4';` (v4).
- **Atualizando**:
  - `npm outdated @indianous/base-ds`, `npm update @indianous/base-ds` e
    `npm install @indianous/base-ds@^0.5.0` (série nova);
  - novo passo sobre o Dependabot: o `dependabot.yml` usado no `ecommerce-frontend`, com
    `allow: [{ dependency-name: '@indianous/base-ds' }]` como opcional, o segredo
    `GH_PACKAGES_TOKEN` **do Dependabot** (PAT classic com `read:packages`, o mesmo tipo do
    `GITHUB_PACKAGES_TOKEN` local) e o aviso de que o PR do Dependabot não dispensa a leitura do
    CHANGELOG ("Ajustes necessários nos apps"), nem na série `0.x` (o Dependabot pode propor uma
    série nova, que pede ajustes).
  - uma nota curta de migração para quem ainda usa o alias: trocar a dependência e os imports
    (`from 'base-ds'` → `from '@indianous/base-ds'`, `base-ds/styles` →
    `@indianous/base-ds/styles`) e qualquer caminho `node_modules/base-ds` na configuração do
    Tailwind (`content` no v3, `@source` no v4).
- **Testando mudanças antes de publicar**: `npm install @indianous/base-ds@file:../base-ds/.pack/…`
  e a volta com `npm install @indianous/base-ds@^<versão>`.
- **Regras de uso** e **Trecho para o `CLAUDE.md` dos apps**: `node_modules/@indianous/base-ds/…`,
  dependência `"@indianous/base-ds": "^<versão>"` sem alias, `npm outdated @indianous/base-ds`.

### CHANGELOG

Como o base-ds não muda de comportamento, não há bump de versão nem tag agora. A entrada vai numa
seção `## [Não publicado]`, com "Ajustes necessários nos apps" descrevendo a migração do alias para
o nome com escopo. Ela vira a seção da próxima versão quando essa for publicada.

### Verificação

Só muda Markdown: rodar `npm run format:check` (o Prettier cobre `README.md`, `CHANGELOG.md` e
`plans/`). Não há teste a escrever, então o TDD não se aplica.

### Fechamento da issue

A issue fica aberta até a confirmação final: o PR do Dependabot no `ecommerce-frontend` na próxima
versão publicada do base-ds. Depois do commit deste README, eu comento na #44 o que mudou e o que
falta.

## Verificação com a v0.4.8 (2026-09-30)

A v0.4.8 saiu em 2026-09-28 às 15:52 UTC, e o Dependabot ainda não abriu PR no
`ecommerce-frontend`. O motivo não é o alias nem o token. Desde 2026-07-14, o Dependabot tem uma
**carência padrão de 3 dias** nas atualizações de versão: ele só propõe uma versão depois de 3 dias
publicada, mesmo sem nada no `dependabot.yml`
([changelog do GitHub](https://github.blog/changelog/2026-07-14-dependabot-version-updates-introduce-default-package-cooldown/)).
O log da execução de 2026-09-27 às 12:03 mostra isso:

```
Filtered out 5 versions due to cooldown      (0.4.3 a 0.4.7, publicadas em 26 e 27/09)
Latest version is 0.4.2
No update needed for @indianous/base-ds 0.4.7
```

Além disso, o Dependabot não rodou depois da publicação da v0.4.8, que só pode ser proposta a partir
de 2026-10-01 às 15:52 UTC.

A carência é configurada no `dependabot.yml` de cada app, não no pacote, e é opcional. Sem mexer
nela, a PR do base-ds chega uns 3 dias depois da publicação. Para um pacote publicado pela própria
equipe, a carência não protege de nada, então o app pode tirar só o base-ds dela.

### README

Na seção **Atualizando → Dependabot**, acrescentar ao exemplo um bloco `cooldown`, marcado como
opcional:

```yaml
cooldown:
  default-days: 3
  exclude:
    - '@indianous/base-ds'
```

Explicar em uma frase que, sem ele, a PR chega uns 3 dias depois da publicação, e que o `exclude`
mantém a carência para as outras dependências.

### CHANGELOG

A mudança é só no README: sem bump de versão nem tag. A entrada vai numa seção `## [Não publicado]`,
em "Alterado".

### `ecommerce-frontend`

Não muda. Ele fica com a carência padrão, o que também serve para verificar o fluxo com o padrão.

### Fechamento da issue

Depois de 2026-10-01 às 15:52 UTC, rodar o "Check for updates" (Insights → Dependency graph →
Dependabot) ou esperar a execução semanal. Eu confiro o log e a PR com o `gh`: ela deve levar o
`@indianous/base-ds` de `0.4.7` para `0.4.8`. Com a PR aberta, comento o resultado na #44 e a fecho.

### Verificação

`npm run format:check`.

## Situação em 2026-11-17 e o que falta

O Dependabot nunca abriu a PR. O app foi atualizado à mão a cada versão (0.4.10, 0.5.4, 0.5.7,
0.5.8, 0.5.9) e ficou na 0.5.8 de 08/10 a 27/10, bem depois da carência da 0.5.9. Mesmo assim,
nenhuma PR apareceu. A causa não é o alias nem a carência. **Toda execução do Dependabot desde
2026-10-04 falha na autenticação**:

```
GET https://npm.pkg.github.com:443/@indianous%2Fbase-ds
401 {"error":"unauthenticated: User cannot be authenticated with the token provided."}
Handled error whilst updating @indianous/base-ds: private_source_authentication_failure
```

| execução (12:02 UTC, semanal) | resultado                               |
| ----------------------------- | --------------------------------------- |
| 2026-09-27                    | sucesso (o token funcionava)            |
| 2026-10-04 até 2026-11-15     | falha, `401` em todas as sete execuções |

O segredo `GH_PACKAGES_TOKEN` do Dependabot foi salvo em 2026-09-27 às 02:45 e começou a falhar
exatamente uma semana depois. Tudo indica um PAT criado com **validade de 7 dias**, que expirou
(ou foi revogado). O `.npmrc` e o `dependabot.yml` do app estão corretos.

### Etapas

1. **Token novo (manual, feito por você).** Criar um PAT classic só com `read:packages`, com uma
   validade longa ou sem validade (é só leitura de pacotes), e salvar por cima do segredo do
   Dependabot:

   ```sh
   gh secret set GH_PACKAGES_TOKEN --app dependabot --repo indianous/ecommerce-frontend
   ```

   Não vou ver nem manipular o token.

2. **Disparar a verificação**: Insights → Dependency graph → Dependabot → "Check for updates", ou
   esperar a execução de domingo. Eu confiro com `gh run view --log` que o `GET` voltou a dar
   `200`. O app já está na 0.5.9, a última versão, então nenhuma PR é esperada ainda.
3. **Confirmação final com a próxima publicação.** A primeira das issues #66, #68 e #67 a ser
   publicada (v0.5.10) serve de teste. O app **não** deve ser atualizado à mão até a PR aparecer,
   uns 3 dias depois da publicação (carência padrão). Se aparecer, comento na #44 e a fecho.

### README

Na seção **Atualizando → Dependabot**, acrescentar um aviso curto: o token vence conforme a
validade escolhida no PAT, e um token vencido não gera e-mail nem PR, só execuções com
`private_source_authentication_failure` na aba Actions do app ("Dependabot Updates"). Recomendar
uma validade longa e onde conferir o log. É só Markdown: sem bump de versão, e a mudança segue no
próximo tarball. Se sair junto de uma das outras issues, entra no mesmo CHANGELOG, em "Alterado".

### Verificação

`npm run format:check`.
