// @vitest-environment node
import colors from '../tokens/colors.json'
import spacing from '../tokens/spacing.json'
import typography from '../tokens/typography.json'
import borders from '../tokens/borders.json'
import shadows from '../tokens/shadows.json'

// The token names an app's theme config can set are a contract with the apps: renaming or
// removing one breaks their config (a minor bump, see CLAUDE.md). This snapshot makes such a
// change deliberate — update it with `vitest -u` only when that's the intent.
describe('customizable tokens', () => {
  it('keeps the list of token names a theme config accepts', () => {
    expect({
      'colors.light': Object.keys(colors.semantic),
      'colors.dark': Object.keys(colors['semantic-dark']),
      fontFamily: Object.keys(typography['font-family']),
      fontSize: Object.keys(typography['font-size']),
      fontWeight: Object.keys(typography['font-weight']),
      lineHeight: Object.keys(typography['line-height']),
      letterSpacing: Object.keys(typography['letter-spacing']),
      spacing: Object.keys(spacing),
      radius: Object.keys(borders.radius),
      borderWidth: Object.keys(borders.width),
      shadow: Object.keys(shadows),
    }).toMatchSnapshot()
  })
})
