# Plano: arquivo de configuração de tema para os apps (`base-ds.config.ts`)

## Contexto

Hoje um app personaliza os tokens sobrescrevendo variáveis CSS depois do import do base-ds (o
`ecommerce-frontend` faz isso com a fonte da marca). Funciona, mas:

- nada valida: um nome errado é ignorado em silêncio, e o contraste não é verificado;
- é fácil esquecer o tema escuro;
- o mobile (`@indianous/base-ds/tokens`, o preset do NativeWind) não recebe a personalização;
- os nomes das variáveis viraram API sem ninguém ter decidido isso.

A proposta é um arquivo de configuração tipado no app e um comando que valida e gera os arquivos
de tema para a web e para o mobile, no build, sem JS no cliente.

## Como o app usa

```ts
// base-ds.config.ts, na raiz do app
import { defineTheme } from '@indianous/base-ds/theme'

export default defineTheme({
  colors: {
    light: { primary: 'violet-600', 'primary-hover': 'violet-700' },
    dark: { primary: 'violet-400', 'primary-hover': 'violet-300' },
  },
  fontFamily: { sans: "'Inter', ui-sans-serif, system-ui, sans-serif" },
  spacing: { 4: '18px' },
  radius: { md: '8px' },
})
```

```sh
npx base-ds-theme            # valida e gera os arquivos
npx base-ds-theme --check    # só valida e confere se os arquivos gerados estão em dia (para CI)
```

```css
/* CSS global do app, depois do base-ds */
@import '@indianous/base-ds/styles/v4';
@import './base-ds.theme.css';
```

O comando entra num script do app (`"prebuild": "base-ds-theme"`), para os arquivos gerados nunca
ficarem velhos.

## O que pode ser personalizado

Só os tokens que já existem, com os mesmos nomes do `theme.css`. Não é possível criar tokens novos.

| grupo                                       | chaves (exemplos)                               | valor aceito                           |
| ------------------------------------------- | ----------------------------------------------- | -------------------------------------- |
| `colors.light`                              | as 72 semânticas (`primary`, `muted` …)         | nome da paleta (`'violet-600'`) ou hex |
| `colors.dark`                               | as semânticas que mudam com o tema              | idem                                   |
| `fontFamily`                                | `sans`, `mono`                                  | texto (pilha de fontes)                |
| `fontSize`                                  | `xs` … `5xl`                                    | texto CSS (`'1.125rem'`)               |
| `fontWeight`, `lineHeight`, `letterSpacing` | as chaves do `typography.json`                  | texto CSS                              |
| `spacing`                                   | `0` … `64`                                      | texto CSS                              |
| `radius`, `borderWidth`, `shadow`           | as chaves do `borders.json` e do `shadows.json` | texto CSS                              |

- **Tipos**: as chaves vêm dos JSONs (`keyof typeof colors.semantic` etc.), então uma chave errada
  é erro no editor, com autocompletar. As cores aceitam `` `${família}-${tom}` `` da paleta ou
  `` `#${string}` ``.
- Um nome da paleta vira `var(--color-violet-600)` no CSS gerado (a ligação com a paleta fica
  visível) e o hex resolvido no mobile.

## Validação (o comando falha com a lista de problemas)

1. **Chaves e valores**: chave desconhecida, cor que não existe na paleta, hex malformado. O
   comando revalida em tempo de execução, porque o arquivo pode ser `.mjs` sem tipos.
2. **Contraste**: o tema final (base-ds + personalização) passa pelos **mesmos pares** do teste
   de contraste do base-ds (texto sobre fundo, status como texto, botão no hover, realce de
   código), nos dois temas, com 4,5:1. A mensagem diz o par, o tema e a razão:
   `primary-foreground sobre primary (claro): 3,1:1, mínimo 4,5:1`.
3. **Tema escuro esquecido**: uma cor que muda com o tema, personalizada só em `light`, gera um
   aviso (o escuro continua com o valor do base-ds). Com `--strict`, o aviso vira erro.

Para isso, a lógica que hoje está dentro do `src/tokens/contrast.test.ts` (resolver tokens,
luminância, razão de contraste e a lista de pares) vai para um módulo, `src/theme/contrast.ts`.
O teste do base-ds e o comando passam a usar o mesmo código, então uma regra nova vale para os dois.

## O que é gerado

| arquivo (padrão)     | para quê                                                                             |
| -------------------- | ------------------------------------------------------------------------------------ |
| `base-ds.theme.css`  | web: `:root { … }` e `.dark { … }` só com as variáveis personalizadas                |
| `base-ds.theme.json` | mobile: `themeVariables` (claro e escuro, hex resolvido) e os valores não-cor finais |

Os caminhos podem mudar no próprio config (`output: { css, json }`). Os dois arquivos levam um
cabeçalho "gerado por base-ds-theme, não edite".

No mobile:

```js
// tailwind.config.js do app React Native
const { createTailwindPreset } = require('@indianous/base-ds/theme')
const theme = require('./base-ds.theme.json')

module.exports = {
  presets: [require('nativewind/preset'), createTailwindPreset(theme)],
}
```

```tsx
import theme from './base-ds.theme.json'
// na raiz: <View style={vars(theme.themeVariables[colorScheme])}>
```

O `createTailwindPreset(theme)` é o preset de hoje com os valores não-cor da personalização. O
`@indianous/base-ds/tailwind-preset` continua igual, para quem não personaliza.

## Pacote

- **`@indianous/base-ds/theme`** (subpath novo, ESM + CJS + tipos, sem `'use client'`, como os
  outros subpaths de dados): `defineTheme`, os tipos (`ThemeConfig` …), `createTailwindPreset` e
  `buildTheme(config)`. O `buildTheme` é a função pura por trás do comando: recebe o config e
  devolve `{ css, json, errors, warnings }`, para quem preferir chamar de um script próprio.
- **Comando `base-ds-theme`** (`bin` no `package.json`, `dist/theme-cli.js`, só Node): procura
  `base-ds.config.ts`, `.mjs` ou `.js` na pasta atual, importa, chama o `buildTheme`, escreve os
  arquivos e sai com código 1 se houver erro. Opções: `--config <caminho>`, `--check` e
  `--strict`.
- **Config em `.ts` sem compilador**: o Node importa `.ts` direto, removendo os tipos, a partir da
  versão 22.18 (a máquina de desenvolvimento e o CI usam a 22). Com Node mais antigo, o app usa
  `base-ds.config.mjs`, com `defineTheme` dando autocompletar via JSDoc. Isso evita uma dependência
  nova só para carregar TypeScript. O README avisa.
- O `tsup` ganha a entrada do `theme` junto dos subpaths de dados e a do CLI com
  `platform: 'node'`. O `check:dist` confere que os dois não têm `'use client'` e que o CLI começa
  com `#!/usr/bin/env node`.

## Nomes dos tokens viram API

Com o config, os nomes que ele aceita passam a ser um contrato com os apps:

- um teste (`src/theme/api.test.ts`) guarda a lista de chaves personalizáveis num snapshot. Mudar
  um nome faz o teste falhar, e o snapshot só é atualizado de propósito;
- o `CLAUDE.md` passa a dizer que renomear ou remover um token personalizável é uma mudança que
  exige ajuste nos apps (**minor** e "Ajustes necessários nos apps" no CHANGELOG). Acrescentar um
  token continua sendo _patch_.

## Testes (TDD, escritos antes)

- `src/theme/contrast.test.ts`: o módulo extraído calcula as mesmas razões de antes. O
  `src/tokens/contrast.test.ts` continua passando, agora usando o módulo.
- `src/theme/buildTheme.test.ts`:
  - config vazio: CSS sem declarações e JSON igual aos tokens do base-ds;
  - cor da paleta e hex: o CSS tem `var(--color-violet-600)` / o hex, e o JSON tem o hex resolvido;
  - chave desconhecida e cor inexistente: erros com o nome;
  - `primary-foreground` branco sobre um `primary` claro demais: erro de contraste com o par, o
    tema e a razão;
  - cor que muda com o tema personalizada só no claro: aviso, e erro com `strict`;
  - valores não-cor no CSS e no JSON;
  - o CSS gerado, aplicado depois do `theme.css`, resolve `--color-primary` para o valor novo nos
    dois temas.
- Tipos (`src/theme/defineTheme.test-d.ts` checado pelo `typecheck`): uma chave inexistente e uma
  cor fora da paleta dão erro (`@ts-expect-error`).
- `src/theme/createTailwindPreset.test.ts`: aplica os valores não-cor e mantém as cores em
  `var(--color-…)`.
- `src/theme/cli.test.ts`: roda o comando numa pasta temporária, com config `.ts` e `.mjs`. Ele
  escreve os arquivos, sai com 1 quando há erro de contraste e, com `--check`, falha se os arquivos
  estiverem velhos.
- `src/theme/api.test.ts`: o snapshot das chaves personalizáveis.

## README

Seção "Personalizando o tema", com o config, o comando, o import do CSS, o uso no mobile, a
validação (o que falha e por quê), a regra do tema escuro, o requisito de Node para o `.ts` e a
lista do que pode ser personalizado. A seção sobre sobrescrever variáveis à mão passa a apontar
para o config.

## Versão e changelog

Recurso novo, sem mudar nada do que existe: **patch**, v0.5.5. "Adicionado": o subpath
`@indianous/base-ds/theme`, o comando `base-ds-theme` e a seção do README. "Ajustes necessários
nos apps": nenhum. Quem já sobrescreve variáveis à mão (`ecommerce-frontend`, com a fonte) continua
funcionando e pode migrar para o config quando quiser.

## Fora do escopo

- Criar tokens novos pelo config (só os que existem).
- Personalizar os componentes em si (variantes, tamanhos).
- Um tema por trecho da página (`.secao-promo { … }`): continua possível à mão.
- Gerar o tema em tempo de execução (`ThemeProvider`).

## Checklist final

`npm run lint`, `format:check`, `typecheck`, `npm test`, `npm run test:stories`, `npm run build` +
`npm run check:dist`.

## Resultado (implementação)

Entregue como planejado, com estas diferenças:

- **Sem invalidar o cache do import**: a primeira versão do comando acrescentava a data de
  modificação do config à URL do `import()`, para reler o arquivo num processo que roda várias
  vezes. Dentro do Vitest, um `.ts` com parâmetro na URL não é transformado, e essa leitura não é
  necessária: cada execução do comando é um processo novo. O parâmetro saiu. O teste do `--check`
  com arquivo desatualizado usa um segundo arquivo de config (`--config`), em vez de reescrever o
  primeiro.
- **O preset virou função compartilhada** (`src/theme/preset.ts`): o
  `@indianous/base-ds/tailwind-preset` e o `createTailwindPreset(theme)` saem do mesmo código.
- **O `check:dist` roda o comando compilado** com o Node real, contra um config `.ts` numa pasta
  temporária.
- **Verificação de ponta a ponta** (fora do repositório): o tarball instalado num app no
  scratchpad, com um `base-ds.config.ts` importando o `defineTheme` do pacote. O `npx base-ds-theme`
  gerou os dois arquivos, o `--check` passou, o `createTailwindPreset` leu o JSON, e uma primária
  `violet-300` falhou com `primary-foreground sobre primary (claro): 1,85:1, mínimo 4,50:1`.
