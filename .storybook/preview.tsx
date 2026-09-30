import type { Preview } from '@storybook/react-vite'
import '../src/styles/globals.css'
import '../src/styles/theme.css'

type Theme = 'light' | 'dark'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
  },
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  // .storybook-dark/preview.tsx overrides this for the `storybook-dark` Vitest project.
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      const theme: Theme = context.globals.theme === 'dark' ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', theme === 'dark')
      // The app sets the page background; here it's the canvas, so contrast is measured against
      // the theme's background instead of the browser's default white.
      document.body.classList.add('bg-background', 'text-foreground')
      return <Story />
    },
  ],
}

export default preview
