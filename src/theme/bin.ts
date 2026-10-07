/// <reference types="node" />
// Entry of the `base-ds-theme` command (`dist/theme-cli.js`, with a `#!/usr/bin/env node` banner).
import { runCli } from './cli'

process.exitCode = await runCli(process.argv.slice(2), {
  cwd: process.cwd(),
  stdout: (line) => process.stdout.write(`${line}\n`),
  stderr: (line) => process.stderr.write(`${line}\n`),
})
