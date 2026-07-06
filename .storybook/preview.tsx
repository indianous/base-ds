import type { Preview } from '@storybook/react-vite'
import '../src/styles/globals.css'
// theme.css será importado na T-08 após definição dos tokens

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
}

export default preview
