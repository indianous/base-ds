import { defineConfig } from 'tsup'
import { copyFileSync, mkdirSync } from 'fs'
import { join } from 'path'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  splitting: false,
  tsconfig: './tsconfig.build.json',
  async onSuccess() {
    mkdirSync(join('dist', 'styles'), { recursive: true })
    copyFileSync(join('src', 'styles', 'theme.css'), join('dist', 'styles', 'theme.css'))
    console.log('CSS copied to dist/styles/theme.css')
  },
})
