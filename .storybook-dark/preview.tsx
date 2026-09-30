import type { Preview } from '@storybook/react-vite'
import preview from '../.storybook/preview'

const darkPreview: Preview = {
  ...preview,
  initialGlobals: { ...preview.initialGlobals, theme: 'dark' },
}

export default darkPreview
