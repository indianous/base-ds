import type { Meta, StoryObj } from '@storybook/react'
import { Footer } from './Footer'

const meta: Meta<typeof Footer> = {
  component: Footer,
  title: 'Organisms/Footer',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Footer>

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Support', href: '/support' },
    ],
  },
]

const socialLinks = [
  { icon: <span aria-hidden="true">GH</span>, href: 'https://github.com', label: 'GitHub' },
  { icon: <span aria-hidden="true">TW</span>, href: 'https://twitter.com', label: 'Twitter' },
]

export const Complete: Story = {
  args: {
    logo: <span className="text-lg font-bold text-foreground">base-ds</span>,
    columns,
    socialLinks,
    copyright: '© 2026 base-ds. All rights reserved.',
  },
}

export const Minimal: Story = {
  args: {},
}

export const WithoutSocialLinks: Story = {
  args: {
    logo: <span className="text-lg font-bold text-foreground">base-ds</span>,
    columns,
  },
}
