import type { Meta, StoryObj } from '@storybook/react'
import { ImageGallery } from './ImageGallery'

const meta: Meta<typeof ImageGallery> = {
  component: ImageGallery,
  title: 'Organisms/ImageGallery',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof ImageGallery>

const sneakerImages = [
  { src: 'https://picsum.photos/seed/shoe1/600/600', alt: 'Sneaker front view' },
  { src: 'https://picsum.photos/seed/shoe2/600/600', alt: 'Sneaker side view' },
  { src: 'https://picsum.photos/seed/shoe3/600/600', alt: 'Sneaker back view' },
  { src: 'https://picsum.photos/seed/shoe4/600/600', alt: 'Sneaker sole view' },
  { src: 'https://picsum.photos/seed/shoe5/600/600', alt: 'Sneaker on foot' },
  { src: 'https://picsum.photos/seed/shoe6/600/600', alt: 'Sneaker box' },
  { src: 'https://picsum.photos/seed/shoe7/600/600', alt: 'Sneaker laces detail' },
  { src: 'https://picsum.photos/seed/shoe8/600/600', alt: 'Sneaker packaging' },
]

export const ThumbnailsSide: Story = {
  args: { images: sneakerImages, thumbnailPosition: 'side' },
}

export const ThumbnailsBottom: Story = {
  args: { images: sneakerImages, thumbnailPosition: 'bottom' },
}

export const VideoAspectRatio: Story = {
  args: { images: sneakerImages, aspectRatio: 'video' },
}

export const ContainObjectFit: Story = {
  args: { images: sneakerImages, aspectRatio: 'video', objectFit: 'contain' },
}

export const FewImages: Story = {
  args: {
    images: [
      { src: 'https://picsum.photos/seed/mug1/600/600', alt: 'Mug front view' },
      { src: 'https://picsum.photos/seed/mug2/600/600', alt: 'Mug side view' },
    ],
  },
}
