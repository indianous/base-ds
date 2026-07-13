import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { FormField } from './FormField'

describe('FormField', () => {
  it('renders the label text', () => {
    render(
      <FormField label="Email" id="email">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('label has correct htmlFor attribute linking to the child control id', () => {
    render(
      <FormField label="Email" id="email">
        <input type="text" />
      </FormField>,
    )
    const label = screen.getByText('Email').closest('label')
    expect(label).toHaveAttribute('for', 'email')
  })

  it('renders the children (form control)', () => {
    render(
      <FormField label="Email" id="email">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('child control receives the correct id', () => {
    render(
      <FormField label="Email" id="email">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'email')
  })

  it('renders hint text when hint prop is provided', () => {
    render(
      <FormField label="Email" id="email" hint="Enter your work email">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByText('Enter your work email')).toBeInTheDocument()
  })

  it('does not render hint when error is shown (error takes precedence)', () => {
    render(
      <FormField label="Email" id="email" hint="Enter your work email" error="Required">
        <input type="text" />
      </FormField>,
    )
    expect(screen.queryByText('Enter your work email')).not.toBeInTheDocument()
  })

  it('renders error message when error prop is provided', () => {
    render(
      <FormField label="Email" id="email" error="This field is required">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('error message has role="alert"', () => {
    render(
      <FormField label="Email" id="email" error="This field is required">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('This field is required')
  })

  it('shows required asterisk (*) when required=true', () => {
    render(
      <FormField label="Email" id="email" required>
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('does not show asterisk when required=false', () => {
    render(
      <FormField label="Email" id="email">
        <input type="text" />
      </FormField>,
    )
    expect(screen.queryByText('*')).not.toBeInTheDocument()
  })

  it('child receives aria-describedby pointing to hint id when hint is provided', () => {
    render(
      <FormField label="Email" id="email" hint="Enter your email">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'email-hint')
  })

  it('child receives aria-describedby pointing to error id when error is provided', () => {
    render(
      <FormField label="Email" id="email" error="Required">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', 'email-error')
  })

  it('child receives aria-invalid="true" when error is provided', () => {
    render(
      <FormField label="Email" id="email" error="Required">
        <input type="text" />
      </FormField>,
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FormField label="Email" id="email">
        <input type="text" />
      </FormField>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
