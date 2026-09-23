import pkg from '../package.json'

type DependencyMap = Record<string, string>

const dependencies: DependencyMap = pkg.dependencies
const peerDependencies: DependencyMap = pkg.peerDependencies
const devDependencies: DependencyMap = pkg.devDependencies

describe('package.json', () => {
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
