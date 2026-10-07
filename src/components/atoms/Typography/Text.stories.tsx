import type { Meta, StoryObj } from '@storybook/react'
import { expect, within } from 'storybook/test'
import { Text } from './Text'
import { contrastRatio, MIN_TEXT_CONTRAST } from '../../../theme/contrast'

// `rgb(r, g, b)` (computed style) → `#rrggbb`, for the contrast check.
const toHex = (rgb: string) =>
  `#${(rgb.match(/\d+/g) ?? [])
    .slice(0, 3)
    .map((channel) => Number(channel).toString(16).padStart(2, '0'))
    .join('')}`

const meta: Meta<typeof Text> = {
  component: Text,
  title: 'Atoms/Typography/Text',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Text>

export const Default: Story = {
  args: {
    children: 'The quick brown fox jumps over the lazy dog.',
    size: 'md',
    color: 'default',
  },
}

export const Muted: Story = {
  args: {
    children: 'Muted helper text',
    color: 'muted',
    size: 'sm',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Error message text',
    color: 'destructive',
    size: 'sm',
  },
  // The a11y addon didn't flag this text when it had the same color as the page (issue #62), so
  // the contrast against the real background is checked here.
  play: async ({ canvasElement }) => {
    const text = within(canvasElement).getByText('Error message text')
    const color = toHex(getComputedStyle(text).color)
    const background = toHex(getComputedStyle(document.body).backgroundColor)
    await expect(contrastRatio(color, background)).toBeGreaterThanOrEqual(MIN_TEXT_CONTRAST)
  },
}

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-2">
      <Text size="xs">Extra small text</Text>
      <Text size="sm">Small text</Text>
      <Text size="md">Medium text (default)</Text>
      <Text size="lg">Large text</Text>
    </div>
  ),
}

const longSummary =
  'A design system with tokens, a dark theme, accessible components and a theme config that apps can use to change colors and fonts.'

// Measured in the browser: jsdom has no layout, so the unit tests only check the classes.
export const Lines: Story = {
  render: () => (
    <div className="max-w-xs space-y-4">
      <Text data-testid="one-line">One line</Text>
      <Text data-testid="clamped" lines={2}>
        {longSummary}
      </Text>
      <Text data-testid="reserved" lines={2} reserveLines>
        Short summary.
      </Text>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const height = (testId: string) => canvas.getByTestId(testId).getBoundingClientRect().height
    const clamped = canvas.getByTestId('clamped')

    await expect(getComputedStyle(clamped).webkitLineClamp).toBe('2')
    // The text is longer than 2 lines and got cut.
    await expect(clamped.scrollHeight).toBeGreaterThan(clamped.clientHeight)
    await expect(Math.abs(height('clamped') - 2 * height('one-line'))).toBeLessThanOrEqual(1)
    // A short text with reserveLines takes the same height as the clamped one.
    await expect(Math.abs(height('reserved') - height('clamped'))).toBeLessThanOrEqual(1)
  },
}
