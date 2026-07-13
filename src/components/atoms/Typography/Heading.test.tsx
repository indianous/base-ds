import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Heading } from './Heading'

describe('Heading', () => {
  describe('tag rendering', () => {
    it('renders with default h2 tag', () => {
      render(<Heading>Title</Heading>)
      const heading = screen.getByRole('heading')
      expect(heading.tagName).toBe('H2')
    })

    it('renders as h1 when as="h1"', () => {
      render(<Heading as="h1">Title</Heading>)
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading.tagName).toBe('H1')
    })

    it('renders as h3 when as="h3"', () => {
      render(<Heading as="h3">Title</Heading>)
      const heading = screen.getByRole('heading', { level: 3 })
      expect(heading.tagName).toBe('H3')
    })

    it('renders as h5 when as="h5"', () => {
      render(<Heading as="h5">Title</Heading>)
      const heading = screen.getByRole('heading', { level: 5 })
      expect(heading.tagName).toBe('H5')
    })

    it('renders as h6 when as="h6"', () => {
      render(<Heading as="h6">Title</Heading>)
      const heading = screen.getByRole('heading', { level: 6 })
      expect(heading.tagName).toBe('H6')
    })
  })

  describe('size classes', () => {
    it('applies text-xl class for size="xl"', () => {
      render(<Heading size="xl">Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('text-xl')
    })

    it('applies text-2xl class for default size (2xl)', () => {
      render(<Heading>Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('text-2xl')
    })

    it('applies text-3xl class for size="3xl"', () => {
      render(<Heading size="3xl">Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('text-3xl')
    })

    it('applies text-4xl class for size="4xl"', () => {
      render(<Heading size="4xl">Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('text-4xl')
    })
  })

  describe('weight classes', () => {
    it('applies font-semibold class by default', () => {
      render(<Heading>Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('font-semibold')
    })

    it('applies font-normal for weight="regular"', () => {
      render(<Heading weight="regular">Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('font-normal')
    })

    it('applies font-bold for weight="bold"', () => {
      render(<Heading weight="bold">Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('font-bold')
    })
  })

  describe('className and children', () => {
    it('merges custom className', () => {
      render(<Heading className="custom-class">Title</Heading>)
      expect(screen.getByRole('heading')).toHaveClass('custom-class')
    })

    it('renders children content', () => {
      render(<Heading>Hello World</Heading>)
      expect(screen.getByRole('heading')).toHaveTextContent('Hello World')
    })
  })

  describe('accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Heading>Title</Heading>)
      expect(await axe(container)).toHaveNoViolations()
    })
  })
})
