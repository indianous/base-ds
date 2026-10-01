# Plano: reduzir o consumo de RAM do Vitest

## Contexto

A máquina de desenvolvimento tem 12 núcleos e 13,8 GB de RAM, com ~4,8 GB livres antes de rodar
os testes. O `vite.config.ts` não limita o paralelismo, então o Vitest usa o padrão: até um worker
por núcleo, menos um, e cada projeto de stories abre um arquivo por vez em cada renderer do
Chromium, todos em paralelo.

## Medição

Pico da soma de RSS da árvore de processos, amostrada a cada 0,5 s. A soma conta duas vezes a
memória compartilhada entre processos do Chromium, então os valores absolutos estão inflados, mas a
comparação entre configurações vale.

| comando                               | pico de RAM  | processos | tempo |
| ------------------------------------- | ------------ | --------- | ----- |
| `npm run test:stories` (hoje)         | ~11,2 GB     | 37        | 46 s  |
| idem, `--maxWorkers=2` ou `4`         | ~11,5 GB     | 37        | 31 s  |
| idem, **sem paralelismo de arquivos** | **~3,3 GB**  | 17        | 25 s  |
| `npm test` (hoje, 11 workers)         | ~2,5 GB      | 16        | 14 s  |
| `npm test`, `--maxWorkers=6`          | ~1,7 GB      | 11        | 16 s  |
| `npm test`, **`--maxWorkers=4`**      | **~1,35 GB** | 9         | 20 s  |
| `npm test`, `--maxWorkers=2`          | ~0,9 GB      | 7         | 34 s  |

No pico do `test:stories`, 8,5 GB vêm de 22 renderers do Chromium: cerca de 11 por projeto
(`storybook` e `storybook-dark`), um por arquivo de story aberto em paralelo. O `maxWorkers` não
limita esses renderers.

## Mudanças (`vite.config.ts`)

1. **Projetos `storybook` e `storybook-dark`: `fileParallelism: false`.** Os arquivos de story
   rodam um de cada vez em cada projeto. O pico cai de ~11 GB para ~3,3 GB, e o tempo **cai** de
   46 s para 25 s: abrir 22 renderers ao mesmo tempo custava mais do que rodar em sequência.
2. **`maxWorkers: 4`** na raiz do `test`. Afeta o projeto `unit` (jsdom), e as medições mostram
   que não muda os projetos de navegador. O pico do `npm test` cai de ~2,5 GB para ~1,35 GB, e o
   tempo sobe de 14 s para 20 s. Com 6 workers, o ganho seria menor (~1,7 GB, 16 s). Com 2, o
   tempo passaria de 30 s.

Os dois valores ficam no `vite.config.ts`, e não nos scripts do `package.json`, para valer também
no `npm run test:all`, no `vitest` direto e no CI.

## Verificação

- `npm test` e `npm run test:stories` com a configuração nova: todos os testes passam, e o pico e
  o tempo ficam próximos dos medidos acima com as flags da linha de comando.
- Conferir que a medição com o token estragado da #52 (o `storybook-dark` reprova sozinho)
  continua valendo: o `fileParallelism` não pode misturar os projetos.

## CI e versão

O CI (`publish.yml`) roda os mesmos comandos num runner do GitHub, com menos núcleos que esta
máquina. Lá, o limite de 4 workers fica igual ou acima do padrão, e o `test:stories` sem
paralelismo de arquivos foi mais rápido aqui. Confiro o tempo do CI na próxima publicação.

A mudança é só de configuração de desenvolvimento e não muda o pacote publicado: sem bump de
versão, sem entrada no CHANGELOG e sem tag. O `CLAUDE.md` ganha uma linha na seção "Testing"
explicando os dois limites e o motivo.
