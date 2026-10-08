// @vitest-environment node
/// <reference types="node" />
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

// Bundles an app that imports only some exports and reports what ends up in the output, so a
// component can't drag unrelated ones (and their dependencies) along (issue #53).
const root = fileURLToPath(new URL('..', import.meta.url))

async function bundle(exports: string[]): Promise<Record<string, number>> {
  const result = await build({
    stdin: {
      contents: `export { ${exports.join(', ')} } from './src/index.ts'`,
      resolveDir: root,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    jsx: 'automatic',
    minify: true,
    metafile: true,
    external: ['react', 'react-dom', 'react/jsx-runtime'],
    logLevel: 'silent',
  })
  const [output] = Object.values(result.metafile.outputs)
  return Object.fromEntries(
    Object.entries(output?.inputs ?? {}).map(([path, { bytesInOutput }]) => [path, bytesInOutput]),
  )
}

function bytesFrom(inputs: Record<string, number>, pattern: RegExp): number {
  return Object.entries(inputs)
    .filter(([path]) => pattern.test(path))
    .reduce((total, [, bytes]) => total + bytes, 0)
}

const lucide = /node_modules\/lucide-react\//
const dndKit = /node_modules\/@dnd-kit\//
const qrcode = /node_modules\/qrcode\//
const heavyComponents = /src\/components\/organisms\/(Charts|KanbanBoard|ConversationThread)\//

describe('bundle size', () => {
  it('importing only Heading leaves out icons, drag and drop, QR codes and heavy components', async () => {
    const inputs = await bundle(['Heading'])
    expect(bytesFrom(inputs, lucide)).toBe(0)
    expect(bytesFrom(inputs, dndKit)).toBe(0)
    expect(bytesFrom(inputs, qrcode)).toBe(0)
    expect(bytesFrom(inputs, heavyComponents)).toBe(0)
  })

  it('importing Navbar brings only the icons it uses', async () => {
    const inputs = await bundle(['Navbar'])
    const iconBytes = bytesFrom(inputs, lucide)
    expect(iconBytes).toBeGreaterThan(0)
    expect(iconBytes).toBeLessThan(30_000)
    expect(bytesFrom(inputs, dndKit)).toBe(0)
  })

  it('importing Input leaves out the mask engine of MaskedInput', async () => {
    const inputs = await bundle(['Input'])
    expect(bytesFrom(inputs, /src\/masks\//)).toBe(0)
    expect(bytesFrom(await bundle(['MaskedInput']), /src\/masks\//)).toBeGreaterThan(0)
  })

  it('importing MaskedInput leaves out the card brands and Luhn check', async () => {
    expect(bytesFrom(await bundle(['MaskedInput']), /src\/masks\/card/)).toBe(0)
    expect(bytesFrom(await bundle(['CardNumberInput']), /src\/masks\/card/)).toBeGreaterThan(0)
  })

  it('importing KanbanBoard still brings drag and drop', async () => {
    const inputs = await bundle(['KanbanBoard'])
    expect(bytesFrom(inputs, dndKit)).toBeGreaterThan(0)
  })
})

describe.each(['src/tokens/index.ts', 'src/theme/index.ts', 'src/masks/index.ts'])(
  'data entry %s',
  (entry) => {
    it('brings no React and no component code', async () => {
      const result = await build({
        entryPoints: [`${root}${entry}`],
        bundle: true,
        write: false,
        format: 'esm',
        platform: 'neutral',
        metafile: true,
        logLevel: 'silent',
      })
      const [output] = Object.values(result.metafile.outputs)
      const inputs = Object.keys(output?.inputs ?? {})
      expect(inputs.length).toBeGreaterThan(0)
      expect(inputs.every((path) => /^src\/(tokens|theme|masks)\//.test(path))).toBe(true)
    })
  },
)
