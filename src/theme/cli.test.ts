// @vitest-environment node
/// <reference types="node" />
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runCli } from './cli'

let dir: string
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'base-ds-theme-'))
})
afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
})

async function run(args: string[] = []) {
  const stdout: string[] = []
  const stderr: string[] = []
  const code = await runCli(args, {
    cwd: dir,
    stdout: (line) => stdout.push(line),
    stderr: (line) => stderr.push(line),
  })
  return { code, stdout: stdout.join('\n'), stderr: stderr.join('\n') }
}

const write = (file: string, contents: string) => writeFileSync(join(dir, file), contents)
const read = (file: string) => readFileSync(join(dir, file), 'utf8')

const violetTheme = `export default {
  colors: { light: { primary: 'violet-700' }, dark: { primary: 'violet-400' } },
}
`

describe('base-ds-theme', () => {
  it('generates the CSS and the JSON from base-ds.config.mjs', async () => {
    write('base-ds.config.mjs', violetTheme)
    const { code, stdout } = await run()
    expect(code).toBe(0)
    expect(read('base-ds.theme.css')).toContain('--color-primary: var(--color-violet-700);')
    expect(JSON.parse(read('base-ds.theme.json')).themeVariables.dark['--color-primary']).toBe(
      '#a78bfa',
    )
    expect(stdout).toContain('base-ds.theme.css')
  })

  it('reads a TypeScript config', async () => {
    write(
      'base-ds.config.ts',
      `const theme: { spacing: Record<string, string> } = { spacing: { '4': '18px' } }\nexport default theme\n`,
    )
    const { code } = await run()
    expect(code).toBe(0)
    expect(read('base-ds.theme.css')).toContain('--spacing-4: 18px;')
  })

  it('fails on a contrast error, says why and writes nothing', async () => {
    write(
      'base-ds.config.mjs',
      `export default { colors: { light: { primary: 'blue-300' }, dark: { primary: 'blue-400' } } }\n`,
    )
    const { code, stderr } = await run()
    expect(code).toBe(1)
    expect(stderr).toMatch(/primary-foreground sobre primary \(claro\)/)
    expect(existsSync(join(dir, 'base-ds.theme.css'))).toBe(false)
  })

  it('prints warnings and still succeeds, unless --strict', async () => {
    write('base-ds.config.mjs', `export default { colors: { light: { primary: 'violet-700' } } }\n`)
    const relaxed = await run()
    expect(relaxed.code).toBe(0)
    expect(relaxed.stderr).toContain('colors.dark.primary')
    const strict = await run(['--strict'])
    expect(strict.code).toBe(1)
  })

  it('with --check, passes when the files are up to date and fails when they are stale', async () => {
    write('base-ds.config.mjs', violetTheme)
    expect((await run(['--check'])).code).toBe(1)
    await run()
    expect((await run(['--check'])).code).toBe(0)
    // A second config file: ESM caches the first one for the rest of this test process.
    write('base-ds.config.v2.mjs', violetTheme.replace('violet-700', 'violet-800'))
    const stale = await run(['--check', '--config', 'base-ds.config.v2.mjs'])
    expect(stale.code).toBe(1)
    expect(stale.stderr).toContain('base-ds-theme')
    expect(read('base-ds.theme.css')).toContain('violet-700')
  })

  it('takes --config and writes the outputs relative to the config file', async () => {
    mkdirSync(join(dir, 'config'))
    write(
      'config/theme.mjs',
      `export default { output: { css: '../styles/theme.css', json: 'theme.json' }, radius: { md: '8px' } }\n`,
    )
    mkdirSync(join(dir, 'styles'))
    const { code } = await run(['--config', 'config/theme.mjs'])
    expect(code).toBe(0)
    expect(read('styles/theme.css')).toContain('--radius-md: 8px;')
    expect(existsSync(join(dir, 'config/theme.json'))).toBe(true)
  })

  it('fails when there is no config file', async () => {
    const { code, stderr } = await run()
    expect(code).toBe(1)
    expect(stderr).toContain('base-ds.config')
  })
})
