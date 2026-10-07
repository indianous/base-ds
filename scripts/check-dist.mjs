// Checks what only exists after `npm run build` (issue #53): the ESM build is split per component,
// `dist/index.js` is a plain barrel without 'use client', and every other file is a client module,
// so a Next.js page only ships the components it imports. Runs in `prepublishOnly`.
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import { build } from 'esbuild'

const dist = 'dist'
const USE_CLIENT = /^['"]use client['"];?\n/
const failures = []

function jsFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return jsFiles(path)
    return /\.(js|cjs)$/.test(entry.name) ? [path] : []
  })
}

// 1. The barrel only re-exports, and is not itself a client boundary.
const index = readFileSync(join(dist, 'index.js'), 'utf8')
if (USE_CLIENT.test(index)) failures.push(`${dist}/index.js must not start with 'use client'`)
const leftover = index
  .replace(/^\/\/# sourceMappingURL=.*$/m, '')
  .replace(/import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, '')
  .replace(/import\s*["'][^"']+["'];?/g, '')
  .replace(/export\s*\{[^}]*\}\s*(from\s*["'][^"']+["'])?;?/g, '')
  .replace(/export\s*\*\s*from\s*["'][^"']+["'];?/g, '')
  .trim()
if (leftover !== '') {
  failures.push(`${dist}/index.js must only re-export, found code: ${leftover.slice(0, 80)}…`)
}

// 2. The data entries (issue #57) are plain modules: React Native has no 'use client'. Besides
// their own files, every .cjs but index.cjs belongs to them (the components' CJS is one file).
const dataEntryFiles = ['tokens', 'tailwind-preset', 'theme'].flatMap((name) => [
  join(dist, `${name}.js`),
  join(dist, `${name}.cjs`),
])
const dataModules = [
  ...new Set([
    ...dataEntryFiles,
    ...jsFiles(dist).filter((file) => file.endsWith('.cjs') && file !== join(dist, 'index.cjs')),
  ]),
]
for (const file of dataModules) {
  let contents = ''
  try {
    contents = readFileSync(file, 'utf8')
  } catch {
    failures.push(`${file} is missing`)
    continue
  }
  if (USE_CLIENT.test(contents)) failures.push(`${file} must not start with 'use client'`)
}
const require = createRequire(import.meta.url)
const preset = require(join(process.cwd(), dist, 'tailwind-preset.cjs'))
if (!preset?.theme?.extend?.colors) {
  failures.push(`require('${dist}/tailwind-preset.cjs') must return the preset, not { default }`)
}

// 3. The `base-ds-theme` command: a Node script, not a client module. It runs here for real, with
// a TypeScript config in a temporary folder, as an app would (Node strips the types itself).
const cli = join(dist, 'theme-cli.js')
const cliSource = existsSync(cli) ? readFileSync(cli, 'utf8') : ''
if (!cliSource.startsWith('#!/usr/bin/env node\n')) {
  failures.push(`${cli} must exist and start with #!/usr/bin/env node`)
} else {
  const app = mkdtempSync(join(tmpdir(), 'base-ds-theme-check-'))
  try {
    writeFileSync(
      join(app, 'base-ds.config.ts'),
      "const theme: { radius: Record<string, string> } = { radius: { md: '8px' } }\nexport default theme\n",
    )
    execFileSync(process.execPath, [join(process.cwd(), cli)], { cwd: app, stdio: 'pipe' })
    if (!readFileSync(join(app, 'base-ds.theme.css'), 'utf8').includes('--radius-md: 8px;')) {
      failures.push(`${cli} did not generate base-ds.theme.css from a TypeScript config`)
    }
  } catch (error) {
    failures.push(`${cli} failed on a TypeScript config: ${String(error.stderr ?? error)}`)
  } finally {
    rmSync(app, { recursive: true, force: true })
  }
}

// 4. Every other JS file (components, shared chunks, the CJS bundle) is a client module.
const clientFiles = jsFiles(dist).filter(
  (file) => file !== join(dist, 'index.js') && file !== cli && !dataModules.includes(file),
)
if (clientFiles.length < 10) {
  failures.push(`expected one file per component in ${dist}/, found ${clientFiles.length}`)
}
for (const file of clientFiles) {
  if (!USE_CLIENT.test(readFileSync(file, 'utf8'))) {
    failures.push(`${file} must start with 'use client'`)
  }
}

// 5. Importing one component from the published entry leaves the rest out.
async function inputsFor(exportName) {
  const result = await build({
    stdin: { contents: `export { ${exportName} } from './${dist}/index.js'`, resolveDir: '.' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    minify: true,
    metafile: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    logLevel: 'silent',
  })
  return Object.values(result.metafile.outputs)[0].inputs
}
const bytesFrom = (inputs, pattern) =>
  Object.entries(inputs)
    .filter(([path]) => pattern.test(path))
    .reduce((total, [, { bytesInOutput }]) => total + bytesInOutput, 0)

const heading = await inputsFor('Heading')
for (const [name, pattern] of [
  ['lucide-react', /node_modules\/lucide-react\//],
  ['@dnd-kit', /node_modules\/@dnd-kit\//],
]) {
  if (bytesFrom(heading, pattern) > 0) failures.push(`importing Heading brings ${name}`)
}
const navbarIcons = bytesFrom(await inputsFor('Navbar'), /node_modules\/lucide-react\//)
if (navbarIcons >= 30_000) failures.push(`importing Navbar brings ${navbarIcons} bytes of icons`)

if (failures.length > 0) {
  console.error(`check:dist failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}
console.log(`check:dist ok: barrel + ${clientFiles.length} client files`)
