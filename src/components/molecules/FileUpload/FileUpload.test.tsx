import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { FileUpload } from './FileUpload'

function makeFile(name: string, size: number, type = 'image/png') {
  const file = new File(['x'.repeat(size)], name, { type })
  return file
}

function selectFiles(files: File[]) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  Object.defineProperty(input, 'files', { value: files, configurable: true })
  fireEvent.change(input)
}

describe('FileUpload', () => {
  it('renders a file input element (hidden)', () => {
    const { container } = render(<FileUpload />)
    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })

  it('renders a drag zone by default (contains upload text)', () => {
    render(<FileUpload />)
    expect(screen.getByText(/drag files here or click to select/i)).toBeInTheDocument()
  })

  it('shows selected file name after file is selected', () => {
    render(<FileUpload />)
    const file = makeFile('photo.png', 512)
    selectFiles([file])
    expect(screen.getByText('photo.png')).toBeInTheDocument()
  })

  it('shows multiple files when multiple=true and multiple files selected', () => {
    render(<FileUpload multiple />)
    const files = [makeFile('a.png', 100), makeFile('b.pdf', 200)]
    selectFiles(files)
    expect(screen.getByText('a.png')).toBeInTheDocument()
    expect(screen.getByText('b.pdf')).toBeInTheDocument()
  })

  it('removes a file when its remove button is clicked', async () => {
    const user = userEvent.setup()
    render(<FileUpload multiple />)
    const files = [makeFile('remove-me.png', 100), makeFile('keep-me.png', 200)]
    selectFiles(files)
    expect(screen.getByText('remove-me.png')).toBeInTheDocument()
    const removeBtn = screen.getByRole('button', { name: /remove remove-me\.png/i })
    await user.click(removeBtn)
    expect(screen.queryByText('remove-me.png')).not.toBeInTheDocument()
    expect(screen.getByText('keep-me.png')).toBeInTheDocument()
  })

  it('shows error text when file exceeds maxSize', () => {
    render(<FileUpload maxSize={100} />)
    const file = makeFile('big.png', 200)
    selectFiles([file])
    expect(screen.getByText(/exceeds/i)).toBeInTheDocument()
  })

  it('calls onChange with selected files', () => {
    const onChange = vi.fn()
    render(<FileUpload onChange={onChange} />)
    const file = makeFile('test.png', 50)
    selectFiles([file])
    expect(onChange).toHaveBeenCalledWith([file])
  })

  it('does not render drag zone when dragAndDrop=false', () => {
    render(<FileUpload dragAndDrop={false} />)
    expect(screen.queryByText(/drag files here or click to select/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /select files/i })).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    const { container } = render(<FileUpload disabled />)
    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<FileUpload />)
    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('FileUpload custom labels', () => {
  it('uses label for the file input', () => {
    render(<FileUpload label="Enviar arquivos" />)
    expect(screen.getByLabelText('Enviar arquivos')).toHaveAttribute('type', 'file')
  })

  it('uses dropzoneMessage for the drag and drop zone', () => {
    render(<FileUpload dropzoneMessage="Arraste arquivos ou clique para escolher" />)
    expect(
      screen.getByRole('button', { name: 'Arraste arquivos ou clique para escolher' }),
    ).toBeInTheDocument()
  })

  it('uses selectFilesLabel for the button without drag and drop', () => {
    render(<FileUpload dragAndDrop={false} selectFilesLabel="Escolher arquivos" />)
    expect(screen.getByRole('button', { name: 'Escolher arquivos' })).toBeInTheDocument()
  })

  it('uses removeFileLabel with the file name for the remove button', () => {
    render(<FileUpload removeFileLabel={(fileName) => `Remover ${fileName}`} />)
    selectFiles([makeFile('foto.png', 50)])
    expect(screen.getByRole('button', { name: 'Remover foto.png' })).toBeInTheDocument()
  })

  it('uses maxSizeMessage with the formatted maximum size', () => {
    render(
      <FileUpload
        maxSize={100}
        maxSizeMessage={(maxSize) => `O arquivo passa do limite de ${maxSize}`}
      />,
    )
    selectFiles([makeFile('grande.png', 200)])
    expect(screen.getByText('O arquivo passa do limite de 100 B')).toBeInTheDocument()
  })
})
