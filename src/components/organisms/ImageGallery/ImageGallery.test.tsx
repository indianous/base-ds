import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { ImageGallery } from './ImageGallery'
import type { GalleryImage } from './ImageGallery'

const images: GalleryImage[] = [
  { src: '/shoe-1.jpg', alt: 'Shoe front view' },
  { src: '/shoe-2.jpg', alt: 'Shoe side view' },
  { src: '/shoe-3.jpg', alt: 'Shoe back view' },
]

describe('ImageGallery', () => {
  it('renders the first image as the main image by default', () => {
    render(<ImageGallery images={images} />)
    expect(screen.getAllByAltText('Shoe front view').length).toBeGreaterThan(0)
  })

  it('renders one thumbnail button per image', () => {
    render(<ImageGallery images={images} />)
    expect(screen.getAllByRole('button', { name: /View image/ })).toHaveLength(3)
  })

  it('marks the selected thumbnail with aria-current', () => {
    render(<ImageGallery images={images} />)
    expect(screen.getByRole('button', { name: /View image 1/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getByRole('button', { name: /View image 2/ })).not.toHaveAttribute('aria-current')
  })

  it('switches the main image when a thumbnail is clicked', async () => {
    render(<ImageGallery images={images} />)
    await userEvent.click(screen.getByRole('button', { name: /View image 2/ }))
    expect(screen.getByRole('button', { name: /View image 2/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
    expect(screen.getAllByAltText('Shoe side view').length).toBeGreaterThan(0)
  })

  it('navigates to the next image with the next arrow', async () => {
    render(<ImageGallery images={images} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByRole('button', { name: /View image 2/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('navigates to the previous image with the previous arrow', async () => {
    render(<ImageGallery images={images} />)
    await userEvent.click(screen.getByRole('button', { name: 'Next image' }))
    await userEvent.click(screen.getByRole('button', { name: 'Previous image' }))
    expect(screen.getByRole('button', { name: /View image 1/ })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('disables the previous arrow on the first image and the next arrow on the last', async () => {
    render(<ImageGallery images={images} />)
    expect(screen.getByRole('button', { name: 'Previous image' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Next image' }))
    await userEvent.click(screen.getByRole('button', { name: 'Next image' }))
    expect(screen.getByRole('button', { name: 'Next image' })).toBeDisabled()
  })

  it('does not render arrows for a single image', () => {
    render(<ImageGallery images={[images[0]]} />)
    expect(screen.queryByRole('button', { name: 'Next image' })).not.toBeInTheDocument()
  })

  it('opens a zoomed dialog when the main image is clicked', async () => {
    render(<ImageGallery images={images} />)
    await userEvent.click(screen.getByRole('button', { name: /Zoom image/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('closes the zoomed dialog on Escape', async () => {
    render(<ImageGallery images={images} />)
    await userEvent.click(screen.getByRole('button', { name: /Zoom image/ }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the zoomed dialog via the close button', async () => {
    render(<ImageGallery images={images} />)
    await userEvent.click(screen.getByRole('button', { name: /Zoom image/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Close zoom' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('navigates images from within the zoomed dialog', async () => {
    render(<ImageGallery images={images} />)
    await userEvent.click(screen.getByRole('button', { name: /Zoom image/ }))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(screen.getAllByRole('button', { name: 'Next image' })[0])
    expect(dialog).toHaveTextContent('Shoe side view')
  })

  it('respects thumbnailPosition="bottom"', () => {
    render(<ImageGallery images={images} thumbnailPosition="bottom" />)
    const group = screen.getByRole('group', { name: 'Product image gallery' })
    expect(group).toHaveClass('flex-col-reverse')
  })

  it('applies the requested aspectRatio to the main image', () => {
    render(<ImageGallery images={images} aspectRatio="video" />)
    const mainButton = screen.getByRole('button', { name: /Zoom image/ })
    expect(mainButton.querySelector('.aspect-video')).toBeInTheDocument()
  })

  it('applies object-cover to the main image by default', () => {
    render(<ImageGallery images={images} />)
    const mainButton = screen.getByRole('button', { name: /Zoom image/ })
    expect(mainButton.querySelector('img')).toHaveClass('object-cover')
  })

  it('applies the requested objectFit to the main image', () => {
    render(<ImageGallery images={images} objectFit="contain" />)
    const mainButton = screen.getByRole('button', { name: /Zoom image/ })
    expect(mainButton.querySelector('img')).toHaveClass('object-contain')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ImageGallery images={images} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
