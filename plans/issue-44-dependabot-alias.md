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
