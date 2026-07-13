import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Carousel } from './Carousel'

const slides = [
  <div key="1">Slide 1</div>,
  <div key="2">Slide 2</div>,
  <div key="3">Slide 3</div>,
]

describe('Carousel', () => {
  it('renders the first slide by default', () => {
    render(<Carousel items={slides} />)
    expect(screen.getByText('Slide 1').closest('[role="group"]')).not.toHaveClass('hidden')
  })

  it('clicking next shows the second slide', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByText('Slide 2').closest('[role="group"]')).not.toHaveClass('hidden')
  })

  it('clicking next again shows the third slide', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByText('Slide 3').closest('[role="group"]')).not.toHaveClass('hidden')
  })

  it('prev button is disabled on the first slide (when loop=false)', () => {
    render(<Carousel items={slides} />)
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeDisabled()
  })

  it('next button is disabled on the last slide (when loop=false)', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeDisabled()
  })

  it('renders dot indicators equal to the number of slides (when showDots=true)', () => {
    render(<Carousel items={slides} />)
    const dots = screen.getAllByRole('button', { name: /Go to slide/ })
    expect(dots).toHaveLength(3)
  })

  it('active dot has aria-current="true" or distinct styling', () => {
    render(<Carousel items={slides} />)
    const firstDot = screen.getByRole('button', { name: 'Go to slide 1' })
    expect(firstDot).toHaveAttribute('aria-current', 'true')
  })

  it('clicking a dot navigates to that slide', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} />)
    await user.click(screen.getByRole('button', { name: 'Go to slide 2' }))
    expect(screen.getByText('Slide 2').closest('[role="group"]')).not.toHaveClass('hidden')
  })

  it('prev and next buttons are not present when showArrows=false', () => {
    render(<Carousel items={slides} showArrows={false} />)
    expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument()
  })

  it('dots are not rendered when showDots=false', () => {
    render(<Carousel items={slides} showDots={false} />)
    expect(screen.queryByRole('button', { name: /Go to slide/ })).not.toBeInTheDocument()
  })

  it('with loop=true, next on the last slide goes back to the first', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} loop={true} />)
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    await user.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByText('Slide 1').closest('[role="group"]')).not.toHaveClass('hidden')
  })

  it('with loop=true, prev on the first slide goes to the last slide', async () => {
    const user = userEvent.setup()
    render(<Carousel items={slides} loop={true} />)
    await user.click(screen.getByRole('button', { name: 'Previous slide' }))
    expect(screen.getByText('Slide 3').closest('[role="group"]')).not.toHaveClass('hidden')
  })

  it('has role="region" and aria-label="Carousel"', () => {
    render(<Carousel items={slides} />)
    expect(screen.getByRole('region', { name: 'Carousel' })).toBeInTheDocument()
  })

  it('has no accessibility violations (jest-axe)', async () => {
    const { container } = render(<Carousel items={slides} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
