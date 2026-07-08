import type { Meta, StoryObj } from '@storybook/react'
import { Image } from './Image'

const meta: Meta<typeof Image> = {
  component: Image,
  title: 'Atoms/Image',
  tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Image>

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Sample image',
    aspectRatio: 'video',
  },
}

export const Square: Story = {
  args: {
    src: 'https://picsum.photos/400/400',
    alt: 'Square image',
    aspectRatio: 'square',
  },
}

export const WithFallback: Story = {
  args: {
    src: 'broken-url.jpg',
    alt: 'Broken image',
    fallback: (
      <div className="flex items-center justify-center w-full h-full bg-muted text-muted-foreground">
        Image unavailable
      </div>
    ),
    aspectRatio: 'video',
  },
}

export const Contain: Story = {
  args: {
    src: 'https://picsum.photos/200/400',
    alt: 'Portrait',
    objectFit: 'contain',
    aspectRatio: 'portrait',
  },
}
