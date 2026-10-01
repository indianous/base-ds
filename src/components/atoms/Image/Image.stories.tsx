import type { Meta, StoryObj } from '@storybook/react'
import type { ImgHTMLAttributes } from 'react'
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

// Stands in for a framework image such as Next.js `Image`, which base-ds doesn't depend on: it
// renders its own <img> with the standard attributes it receives.
function DemoImage({
  src,
  alt,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  return <img {...props} src={src} alt={alt} data-framework-image="" />
}

export const Priority: Story = {
  args: {
    src: 'https://picsum.photos/seed/hero/800/450',
    alt: 'Main image of the page',
    aspectRatio: 'video',
    priority: true,
    sizes: '100vw',
  },
}

export const CustomImageComponent: Story = {
  args: {
    src: 'https://picsum.photos/400/300',
    alt: 'Image rendered by a custom component',
    aspectRatio: 'video',
    sizes: '(min-width: 768px) 50vw, 100vw',
    imageComponent: DemoImage,
  },
}
