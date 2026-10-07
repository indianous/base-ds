/// <reference types="node" />
// `base-ds-theme`: reads the app's theme config, validates it with `buildTheme` and writes the CSS
// and JSON files. The logic lives here, separate from `bin.ts`, so it can be tested in-process.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildTheme } from './index'
import type { ThemeConfig } from './index'

export interface CliIo {
  cwd: string
  stdout: (line: string) => void
  stderr: (line: string) => void
}

// `.ts` is imported natively by Node 22.18+ (type stripping); older Node uses the `.mjs`/`.js` one.
const CONFIG_FILES = [
  'base-ds.config.ts',
  'base-ds.config.mts',
  'base-ds.config.mjs',
  'base-ds.config.js',
]

const USAGE = `Uso: base-ds-theme [--config <arquivo>] [--check] [--strict]

  --config <arquivo>  arquivo de configuração (padrão: ${CONFIG_FILES.join(', ')})
  --check             só valida e confere se os arquivos gerados estão em dia (para CI)
  --strict            trata avisos como erros`

export async function runCli(argv: string[], io: CliIo): Promise<number> {
  if (argv.includes('--help') || argv.includes('-h')) {
    io.stdout(USAGE)
    return 0
  }
  const check = argv.includes('--check')
  const strict = argv.includes('--strict')
  const configIndex = argv.indexOf('--config')
  const configArg = configIndex >= 0 ? argv[configIndex + 1] : undefined
  if (configIndex >= 0 && !configArg) {
    io.stderr('erro: --config precisa do caminho do arquivo')
    return 1
  }

  const configPath = configArg
    ? resolve(io.cwd, configArg)
    : CONFIG_FILES.map((file) => resolve(io.cwd, file)).find((file) => existsSync(file))
  if (!configPath || !existsSync(configPath)) {
    io.stderr(
      configArg
        ? `erro: ${configArg} não existe`
        : `erro: nenhum arquivo de configuração encontrado (${CONFIG_FILES.join(', ')})`,
    )
    return 1
  }

  let config: ThemeConfig
  try {
    // Imported once per process (ESM caches modules); each run of the command is a new process.
    const module = (await import(/* @vite-ignore */ pathToFileURL(configPath).href)) as {
      default?: unknown
    }
    if (typeof module.default !== 'object' || module.default === null) {
      io.stderr(`erro: ${relative(io.cwd, configPath)} precisa de um export default com o tema`)
      return 1
    }
    config = module.default as ThemeConfig
  } catch (error) {
    io.stderr(`erro: não foi possível carregar ${relative(io.cwd, configPath)}: ${String(error)}`)
    return 1
  }

  const { css, json, errors, warnings } = buildTheme(config, { strict })
  for (const warning of warnings) io.stderr(`aviso: ${warning}`)
  for (const error of errors) io.stderr(`erro: ${error}`)
  if (errors.length > 0) return 1

  const configDir = dirname(configPath)
  const outputs = [
    [resolve(configDir, config.output?.css ?? 'base-ds.theme.css'), css],
    [
      resolve(configDir, config.output?.json ?? 'base-ds.theme.json'),
      `${JSON.stringify(
        { $comment: 'Gerado por base-ds-theme a partir do base-ds.config. Não edite.', ...json },
        null,
        2,
      )}\n`,
    ],
  ] as const

  if (check) {
    const stale = outputs.filter(
      ([file, contents]) => !existsSync(file) || readFileSync(file, 'utf8') !== contents,
    )
    for (const [file] of stale) {
      io.stderr(`erro: ${relative(io.cwd, file)} está desatualizado: rode base-ds-theme`)
    }
    if (stale.length > 0) return 1
    io.stdout('tema em dia')
    return 0
  }

  for (const [file, contents] of outputs) writeFileSync(file, contents)
  io.stdout(`gerados: ${outputs.map(([file]) => relative(io.cwd, file)).join(', ')}`)
  return 0
}
