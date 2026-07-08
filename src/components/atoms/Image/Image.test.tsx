import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Image } from './Image'

describe('Image', () => {
  it('renders an img element with correct src', () => {
    render(<Image src="/photo.jpg" alt="A photo" />)
    expect(screen.getByRole('img')).toHaveAttribute('src', '/photo.jpg')
  })

  it('img has correct alt attribute', () => {
    render(<Image src="/photo.jpg" alt="A photo" />)
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'A photo')
  })

  it('applies aspect-square class when aspectRatio="square"', () => {
    const { container } = render(<Image src="/photo.jpg" alt="A photo" aspectRatio="square" />)
    expect(container.firstChild).toHaveClass('aspect-square')
  })

  it('applies aspect-video class when aspectRatio="video"', () => {
    const { container } = render(<Image src="/photo.jpg" alt="A photo" aspectRatio="video" />)
    expect(container.firstChild).toHaveClass('aspect-video')
  })

  it('applies inline style aspectRatio 3/4 when aspectRatio="portrait"', () => {
    const { container } = render(<Image src="/photo.jpg" alt="A photo" aspectRatio="portrait" />)
    expect((container.firstChild as HTMLElement).style.aspectRatio).toBe('3/4')
  })

  it('applies object-cover class by default', () => {
    render(<Image src="/photo.jpg" alt="A photo" />)
    expect(screen.getByRole('img')).toHaveClass('object-cover')
  })

  it('applies object-contain class when objectFit="contain"', () => {
    render(<Image src="/photo.jpg" alt="A photo" objectFit="contain" />)
    expect(screen.getByRole('img')).toHaveClass('object-contain')
  })

  it('renders fallback node when image fails to load', () => {
    render(
      <Image
        src="/broken.jpg"
        alt="Broken image"
        fallback={<span>Error</span>}
      />,
    )
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('does not render fallback when image loads successfully', () => {
    render(
      <Image
        src="/photo.jpg"
        alt="A photo"
        fallback={<span>Error</span>}
      />,
    )
    expect(screen.queryByText('Error')).not.toBeInTheDocument()
  })

  it('merges custom className on container', () => {
    const { container } = render(
      <Image src="/photo.jpg" alt="A photo" className="my-custom-class" />,
    )
    expect(container.firstChild).toHaveClass('my-custom-class')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Image src="/photo.jpg" alt="A photo" />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
