import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { FormField } from '../FormField/FormField'
import { TagsInput } from './TagsInput'

describe('TagsInput', () => {
  it('renders an input field', () => {
    render(<TagsInput id="tags" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('adds a tag when Enter is pressed', async () => {
    const user = userEvent.setup()
    render(<TagsInput id="tags" />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'React{Enter}')
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('adds a tag when comma is pressed', async () => {
    const user = userEvent.setup()
    render(<TagsInput id="tags" />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'React,')
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('does not add duplicate tags', async () => {
    const user = userEvent.setup()
    render(<TagsInput id="tags" />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'React{Enter}')
    await user.type(input, 'React{Enter}')
    expect(screen.getAllByText('React')).toHaveLength(1)
  })

  it('does not add empty or whitespace-only tags', async () => {
    const user = userEvent.setup()
    render(<TagsInput id="tags" />)
    const input = screen.getByRole('textbox')
    await user.type(input, '   {Enter}')
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('removes a tag when its remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<TagsInput id="tags" value={['React']} onChange={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Remove React' }))
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('removes the last tag when Backspace is pressed in an empty input', async () => {
    const user = userEvent.setup()
    render(<TagsInput id="tags" value={['React', 'TypeScript']} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.type(input, '{backspace}')
    expect(screen.queryByText('TypeScript')).not.toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('does not add more tags than maxTags allows', async () => {
    const user = userEvent.setup()
    render(<TagsInput id="tags" value={['React', 'Vue']} maxTags={2} onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'Angular{Enter}')
    expect(screen.queryByText('Angular')).not.toBeInTheDocument()
  })

  it('shows existing tags from value prop', () => {
    render(<TagsInput id="tags" value={['React', 'TypeScript']} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('calls onChange with updated tags when a tag is added', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TagsInput id="tags" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    await user.type(input, 'React{Enter}')
    expect(onChange).toHaveBeenCalledWith(['React'])
  })

  it('calls onChange with updated tags when a tag is removed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TagsInput id="tags" value={['React', 'TypeScript']} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: 'Remove React' }))
    expect(onChange).toHaveBeenCalledWith(['TypeScript'])
  })

  it('disables the input and remove buttons when disabled prop is true', () => {
    render(<TagsInput id="tags" value={['React']} disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remove React' })).toBeDisabled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <>
        <label htmlFor="tags">Tags</label>
        <TagsInput id="tags" value={['React']} />
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('forwards aria-label to the input', () => {
    render(<TagsInput id="tags" aria-label="Tags" />)
    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeInTheDocument()
  })

  it('forwards aria-labelledby to the input', () => {
    render(
      <>
        <span id="tags-label">Tags</span>
        <TagsInput id="tags" aria-labelledby="tags-label" />
      </>,
    )
    expect(screen.getByRole('textbox', { name: 'Tags' })).toBeInTheDocument()
  })

  it('forwards aria-describedby and aria-invalid from FormField', () => {
    render(
      <FormField id="tags" label="Tags" error="This field is required">
        <TagsInput id="tags" />
      </FormField>,
    )
    const input = screen.getByRole('textbox', { name: 'Tags' })
    expect(input).toHaveAccessibleDescription('This field is required')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no accessibility violations inside a FormField with a hint', async () => {
    const { container } = render(
      <FormField id="tags" label="Tags" hint="Helpful hint">
        <TagsInput id="tags" />
      </FormField>,
    )
    expect(screen.getByRole('textbox', { name: 'Tags' })).toHaveAccessibleDescription(
      'Helpful hint',
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
