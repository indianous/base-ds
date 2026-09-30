import { defineConfig } from 'tsup'
import type { Options } from 'tsup'
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'fs'
import { join } from 'path'

function prependUseClient(file: string) {
  const contents = readFileSync(file, 'utf8')
  if (!contents.startsWith("'use client'")) {
    writeFileSync(file, `'use client';\n${contents}`)
  }
}

function jsFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return jsFiles(path)
    return entry.name.endsWith('.js') ? [path] : []
  })
}

const shared: Options = {
  external: ['react', 'react-dom'],
  sourcemap: true,
  // base-ds is a browser UI kit. Without this, esbuild ignores dependencies'
  // "browser" package.json field (e.g. qrcode's, which swaps out its Node-only
  // fs/pngjs-based PNG renderer for a canvas-based one) and bundles the
  // Node-targeted code, which breaks SSR in consuming apps like Next.js.
  platform: 'browser',
  tsconfig: './tsconfig.build.json',
}

// `dist` is emptied by the `build` npm script: both configs run at once, so `clean` in either
// could delete the other's output.
export default defineConfig([
  {
    ...shared,
    // One entry per component besides the barrel: with splitting, each component lands in its own
    // file and `dist/index.js` only re-exports them, so importing a component doesn't pull in the
    // others or their dependencies (issue #53).
    entry: [
      'src/index.ts',
      'src/components/**/*.tsx',
      '!src/components/**/*.test.tsx',
      '!src/components/**/*.stories.tsx',
    ],
    format: ['esm'],
    splitting: true,
    dts: { entry: 'src/index.ts' },
    async onSuccess() {
      mkdirSync(join('dist', 'styles'), { recursive: true })
      copyFileSync(join('src', 'styles', 'theme.css'), join('dist', 'styles', 'theme.css'))
      copyFileSync(join('src', 'styles', 'theme-v4.css'), join('dist', 'styles', 'theme-v4.css'))
      console.log('CSS copied to dist/styles/theme.css and dist/styles/theme-v4.css')

      // Every component uses hooks/context/refs, so every file with component code is
      // client-only — except the barrel. `dist/index.js` stays a plain module that only
      // re-exports, so a Server Component can import from it and Next.js only ships the
      // client files of the components a page actually uses. The directive is prepended as a
      // plain string after esbuild is done, rather than written in each source file.
      const clientFiles = jsFiles('dist').filter((file) => file !== join('dist', 'index.js'))
      clientFiles.forEach(prependUseClient)
      console.log(`"use client" prepended to ${clientFiles.length} files (all but dist/index.js)`)
    },
  },
  {
    ...shared,
    // CommonJS stays a single file: esbuild can't split it, and `require` consumers (Jest, Node)
    // don't ship it to a browser.
    entry: ['src/index.ts'],
    format: ['cjs'],
    treeshake: true,
    dts: { entry: 'src/index.ts' },
    async onSuccess() {
      // esbuild drops a "use client" directive when bundling to a single file, both from the
      // source and from its `banner` option, so it's prepended after the build.
      prependUseClient(join('dist', 'index.cjs'))
      console.log('"use client" prepended to dist/index.cjs')
    },
  },
])
