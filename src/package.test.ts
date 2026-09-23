import pkg from '../package.json'

type DependencyMap = Record<string, string>

const dependencies: DependencyMap = pkg.dependencies
const peerDependencies: DependencyMap = pkg.peerDependencies
const devDependencies: DependencyMap = pkg.devDependencies
// Loosely typed view, so fields that may be absent can be asserted on.
const manifest: Record<string, unknown> = pkg

describe('package.json', () => {
  it('is published under the @indianous scope', () => {
    expect(manifest.name).toBe('@indianous/base-ds')
  })

  it('is not marked as private', () => {
    expect(manifest.private).toBeUndefined()
  })

  it('publishes only to the GitHub Packages registry', () => {
    expect(manifest.publishConfig).toEqual({ registry: 'https://npm.pkg.github.com' })
  })

  it('links the package to its GitHub repository', () => {
    expect(manifest.repository).toEqual({
      type: 'git',
      url: 'git+https://github.com/indianous/base-ds.git',
    })
  })

  it('builds before publishing', () => {
    expect(pkg.scripts).toHaveProperty('prepublishOnly', 'npm run build')
  })

  it('does not list react or react-dom as runtime dependencies', () => {
    expect(dependencies).not.toHaveProperty('react')
    expect(dependencies).not.toHaveProperty('react-dom')
  })

  it('declares react and react-dom as peer dependencies', () => {
    expect(peerDependencies).toHaveProperty('react')
    expect(peerDependencies).toHaveProperty('react-dom')
  })

  it('declares react and react-dom as dev dependencies for local development', () => {
    expect(devDependencies).toHaveProperty('react')
    expect(devDependencies).toHaveProperty('react-dom')
  })
})
