import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function prependUseClient(file: string) {
  const contents = readFileSync(file, 'utf8')
  if (!contents.startsWith("'use client'")) {
    writeFileSync(file, `'use client';\n${contents}`)
  }
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  splitting: false,
  // base-ds is a browser UI kit. Without this, esbuild ignores dependencies'
  // "browser" package.json field (e.g. qrcode's, which swaps out its Node-only
  // fs/pngjs-based PNG renderer for a canvas-based one) and bundles the
  // Node-targeted code, which breaks SSR in consuming apps like Next.js.
  platform: 'browser',
  tsconfig: './tsconfig.build.json',
  async onSuccess() {
    mkdirSync(join('dist', 'styles'), { recursive: true })
    copyFileSync(join('src', 'styles', 'theme.css'), join('dist', 'styles', 'theme.css'))
    copyFileSync(join('src', 'styles', 'theme-v4.css'), join('dist', 'styles', 'theme-v4.css'))
    console.log('CSS copied to dist/styles/theme.css and dist/styles/theme-v4.css')

    // esbuild refuses to preserve a "use client" directive when bundling to a
    // single file (it only keeps per-chunk directives with code splitting on),
    // both via a source directive and via esbuild's own `banner` option. Every
    // component here uses hooks/context/refs, so the whole package is
    // client-only — prepend the directive to the finished output files as a
    // plain string, after esbuild is done, so its directive validation never
    // sees it. Without this, any Server Component that imports even a
    // presentational export (e.g. Heading) pulls in the same bundle as
    // ToastProvider's createContext call, and Next.js's RSC compiler rejects it.
    prependUseClient(join('dist', 'index.js'))
    prependUseClient(join('dist', 'index.cjs'))
    console.log('"use client" prepended to dist/index.js and dist/index.cjs')
  },
})
