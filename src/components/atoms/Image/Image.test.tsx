import { describe, it, expect, vi } from 'vitest'
import type { ImgHTMLAttributes } from 'react'
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
    render(<Image src="/broken.jpg" alt="Broken image" fallback={<span>Error</span>} />)
    const img = screen.getByRole('img')
    fireEvent.error(img)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('does not render fallback when image loads successfully', () => {
    render(<Image src="/photo.jpg" alt="A photo" fallback={<span>Error</span>} />)
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

describe('Image loading', () => {
  it('loads lazily and decodes asynchronously by default', () => {
    render(<Image src="/photo.jpg" alt="A photo" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img).not.toHaveAttribute('fetchpriority')
  })

  it('passes loading through', () => {
    render(<Image src="/photo.jpg" alt="A photo" loading="eager" />)
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager')
  })

  it('loads eagerly with high fetch priority when priority is set, over loading', () => {
    render(<Image src="/photo.jpg" alt="A photo" loading="lazy" priority />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })

  it('passes sizes, width and height through', () => {
    render(<Image src="/photo.jpg" alt="A photo" sizes="50vw" width={640} height={480} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('sizes', '50vw')
    expect(img).toHaveAttribute('width', '640')
    expect(img).toHaveAttribute('height', '480')
  })

  it('leaves width and height out when not given', () => {
    render(<Image src="/photo.jpg" alt="A photo" />)
    const img = screen.getByRole('img')
    expect(img).not.toHaveAttribute('width')
    expect(img).not.toHaveAttribute('height')
  })
})

describe('Image imageComponent', () => {
  const received = vi.fn()

  // Stands in for a framework image (e.g. a wrapper around Next.js `Image`).
  function TestImage({
    src,
    alt,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
    received({ src, alt, ...props })
    return <img {...props} src={src} alt={alt} data-custom-image="" />
  }

  it('renders imageComponent with the image props', () => {
    render(
      <Image
        src="/photo.jpg"
        alt="Blusa"
        sizes="25vw"
        objectFit="contain"
        imageComponent={TestImage}
      />,
    )
    const img = screen.getByRole('img', { name: 'Blusa' })
    expect(img).toHaveAttribute('data-custom-image')
    expect(img).toHaveAttribute('src', '/photo.jpg')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
    expect(img).toHaveAttribute('sizes', '25vw')
    expect(img).toHaveClass('w-full', 'h-full', 'object-contain')
  })

  it('translates priority into standard attributes instead of passing priority on', () => {
    received.mockClear()
    render(<Image src="/photo.jpg" alt="Blusa" priority imageComponent={TestImage} />)
    const props = received.mock.lastCall?.[0] as Record<string, unknown>
    expect(props).toMatchObject({ loading: 'eager', fetchPriority: 'high' })
    expect(props).not.toHaveProperty('priority')
    expect(props).not.toHaveProperty('width')
    expect(props).not.toHaveProperty('height')
  })

  it('shows the fallback when imageComponent fails to load', () => {
    render(
      <Image
        src="/broken.jpg"
        alt="Blusa"
        fallback={<span>Sem imagem</span>}
        imageComponent={TestImage}
      />,
    )
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByText('Sem imagem')).toBeInTheDocument()
  })

  it('has no accessibility violations with imageComponent', async () => {
    const { container } = render(<Image src="/photo.jpg" alt="Blusa" imageComponent={TestImage} />)
    expect(await axe(container)).toHaveNoViolations()
  })
})
