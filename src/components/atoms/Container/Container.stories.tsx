import type { Meta, StoryObj } from '@storybook/react'
import { Container } from './Container'

const meta: Meta<typeof Container> = {
  component: Container,
  title: 'Atoms/Container',
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof Container>

const Placeholder = ({ label }: { label: string }) => (
  <div className="rounded-md border border-dashed border-border bg-muted p-4 text-sm text-foreground">
    {label}
  </div>
)

export const Default: Story = {
  args: {
    children: <Placeholder label="max-w-5xl · px-4 · py-8" />,
  },
}

const widths = ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '7xl'] as const

export const Widths: Story = {
  render: () => (
    <div>
      {widths.map((width) => (
        <Container key={width} width={width} spacing="default" className="py-2">
          <Placeholder label={`width="${width}"`} />
        </Container>
      ))}
    </div>
  ),
}

const spacings = ['default', 'relaxed', 'loose'] as const

export const Spacing: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {spacings.map((spacing) => (
        <div key={spacing} className="border border-border">
          <Container width="3xl" spacing={spacing}>
            <Placeholder label={`spacing="${spacing}"`} />
          </Container>
        </div>
      ))}
    </div>
  ),
}

export const AsMain: Story = {
  args: {
    as: 'main',
    width: '2xl',
    children: (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Página sem shell</h1>
        <Placeholder label='as="main" — use só quando a página não tem um <main> no shell' />
      </div>
    ),
  },
}

export const LoadingState: Story = {
  args: {
    role: 'status',
    'aria-label': 'Carregando pedidos',
    width: '5xl',
    children: <Placeholder label="Carregando pedidos..." />,
  },
}

export const WithLayoutClasses: Story = {
  args: {
    width: 'xl',
    spacing: 'relaxed',
    className: 'flex flex-col gap-6 text-center',
    children: (
      <>
        <Placeholder label="Entrar" />
        <Placeholder label="E-mail" />
        <Placeholder label="Senha" />
      </>
    ),
  },
}
