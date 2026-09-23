# Plano: formatar o projeto com Prettier e travar `format:check` (issue #43)

## Contexto

O CLAUDE.md diz que o estilo é garantido pelo Prettier, mas nada roda o Prettier
automaticamente, e os scripts só olham `src/`:

```json
"format": "prettier --write src",
"format:check": "prettier --check src"
```

`npx prettier --check .` (o projeto inteiro, respeitando `.gitignore` e `.prettierignore`)
acusa **44 arquivos**:

- **37 em `src/`** — os listados na issue (componentes, testes, stories, `theme-v4.css` e 4 JSON
  de tokens);
- **7 fora de `src/`** — `vite.config.ts`, `eslint.config.js`, `.storybook/main.ts`,
  `tsconfig.json`, `vitest.shims.d.ts`, `plans/issue-38-react-peer-dependency.md` e
  `.claude/skills/new-component/SKILL.md`.

Ensaio feito (e desfeito): `prettier --write` em `src/`, nos arquivos de configuração e em
`.storybook/` muda **40 arquivos, +293/−241 linhas**, e o `npm run lint` continua passando
(o `eslint-config-prettier` já desliga as regras que conflitariam).

## Decisão: JSON de tokens seguem o Prettier

Hoje `src/tokens/{spacing,typography,borders,shadows}.json` estão alinhados à mão em colunas:

```json
"0.5":  "2px",
"1":    "4px",
```

O Prettier desfaz o alinhamento (`"0.5": "2px"`). **Proposta: aceitar o formato do Prettier.**

- O alinhamento manual precisa ser refeito a cada token novo ou renomeado, e nada garante isso.
- Uma regra única para o projeto inteiro é mais simples do que exceções no `.prettierignore`.
- Os tokens são lidos pelo `theme.css` e pelo teste de contraste, não por humanos o tempo todo;
  a leitura em colunas é conveniência pequena.

Alternativa (se você preferir manter o alinhamento): adicionar `src/tokens/*.json` ao
`.prettierignore`. O resto do plano não muda.

## Mudanças

### Escopo dos scripts: o projeto inteiro

```json
"format": "prettier --write .",
"format:check": "prettier --check ."
```

O Prettier 3 já respeita `.gitignore` (então `dist`, `node_modules`, `.pack`,
`storybook-static`, logs ficam de fora). No `.prettierignore`, acrescentar:

- `.claude` — pasta local do Claude Code, não versionada;
- `package-lock.json` — gerado pelo npm (hoje já passa, mas não deve ser reformatado nunca).

`plans/` fica **dentro** do escopo: são Markdown versionados, e só um deles está fora do padrão.

### Commit só de formatação

1. Ajustar `package.json` e `.prettierignore` (commit próprio, junto do workflow e do CLAUDE.md).
2. `npm run format` num **commit separado, só de formatação** — nenhuma mudança de lógica,
   para o diff ser revisável como "só espaços e quebras de linha".
3. `.git-blame-ignore-revs` com o hash desse commit, num terceiro commit. O GitHub usa esse
   arquivo automaticamente no _blame_, e localmente basta
   `git config blame.ignoreRevsFile .git-blame-ignore-revs` (documentado no CLAUDE.md). Assim o
   commit de formatação não "assume a autoria" de 40 arquivos no histórico.

### Trava

- `.github/workflows/publish.yml`: `npm run format:check` logo depois do `npm run lint`.
- `CLAUDE.md`:
  - `format`/`format:check` cobrem o projeto inteiro;
  - `format:check` entra na lista do "pronto" (lint, format:check, typecheck, `npm test`,
    `npm run test:stories`, build);
  - nota sobre o `.git-blame-ignore-revs`.

## TDD

Não há comportamento para testar; o "teste que falha primeiro" é o próprio `format:check`:

1. Ampliar os scripts e rodar `npm run format:check` → falha com os 44 arquivos (menos os de
   `.claude`, agora ignorados).
2. `npm run format` → `npm run format:check` passa.

## Versão

Formatação não muda o comportamento do pacote: **sem nova versão, tag ou entrada no
CHANGELOG**. Verificação: `dist/index.js`, `dist/index.cjs` e os `.d.ts` gerados devem sair
idênticos aos atuais. Os `.map` **vão** mudar (eles embutem o código-fonte original, e o fonte
foi reformatado) — isso é esperado e não afeta quem usa o pacote.

## Verificação

1. `npm run format:check` — 0 arquivos.
2. `npm run lint`, `npm run typecheck`, `npm test` (863), `npm run test:stories` (240),
   `npm run build`.
3. `diff` de `dist/index.js`, `dist/index.cjs`, `dist/index.d.ts`, `dist/index.d.cts` e
   `dist/styles/` contra o build atual: idênticos.
4. `git diff --stat` do commit de formatação conferido: só arquivos listados acima.

## Fora do escopo

- Plugin de ordenação de classes do Tailwind (`prettier-plugin-tailwindcss`) — mudaria a ordem
  das classes em todos os componentes; pode virar outra issue.
- Hook de pre-commit (husky/lint-staged).

## Commits

1. `Amplia o Prettier para o projeto inteiro e adiciona format:check à publicação (issue #43)`
2. `Formata o projeto com Prettier (issue #43)` — só formatação
3. `Ignora o commit de formatação no git blame (issue #43)`
