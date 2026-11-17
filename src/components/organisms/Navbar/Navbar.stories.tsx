import type { Meta, StoryObj } from '@storybook/react'
import type { AnchorHTMLAttributes } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { Navbar } from './Navbar'
import type { NavItem } from './Navbar'
import { useNavbarAction } from './NavbarActionContext'
import { Avatar } from '../../atoms/Avatar/Avatar'
import { Button } from '../../atoms/Button/Button'
import { DropdownMenu } from '../../molecules/DropdownMenu/DropdownMenu'
import { Icon } from '../../atoms/Icon/Icon'
import { SearchField } from '../../molecules/SearchField/SearchField'

const meta: Meta<typeof Navbar> = {
  component: Navbar,
  title: 'Organisms/Navbar',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Navbar>

const items: NavItem[] = [
  { label: 'Home', href: '/', active: true },
  { label: 'Docs', href: '/docs' },
  { label: 'Pricing', href: '/pricing' },
]

const itemsWithDropdown: NavItem[] = [
  { label: 'Home', href: '/', active: true },
  {
    type: 'dropdown',
    label: 'Resources',
    items: [
      { label: 'Docs', href: '/docs' },
      { label: 'Blog', href: '/blog' },
      { type: 'separator' },
      { label: 'Support', onClick: () => {} },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
]

const logo = <span className="text-lg font-bold text-foreground">base-ds</span>

export const Default: Story = {
  args: {
    logo,
    items,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
}

export const Sticky: Story = {
  args: {
    logo,
    items,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
    sticky: true,
  },
}

export const WithoutActions: Story = {
  args: {
    logo,
    items,
  },
}

export const LogoOnly: Story = {
  args: {
    logo,
  },
}

export const WithDropdownItem: Story = {
  args: {
    logo,
    items: itemsWithDropdown,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
}

export const WithMultipleActions: Story = {
  args: {
    logo,
    items,
    actions: [
      <Button key="github" variant="ghost" size="sm" leftIcon={<Icon name="GitBranch" size="sm" />}>
        GitHub
      </Button>,
      <Button key="sign-in" variant="outline" size="sm">
        Sign in
      </Button>,
      <Button key="cta" size="sm">
        Get Started
      </Button>,
    ],
  },
}

export const WithSearch: Story = {
  args: {
    logo,
    items,
    search: <SearchField placeholder="Search..." onSearch={() => {}} />,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
}

export const MobileDrawer: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    logo,
    items: itemsWithDropdown,
    search: <SearchField placeholder="Search..." onSearch={() => {}} />,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
  },
  render: (args) => (
    <div className="max-w-sm border border-border rounded-lg overflow-hidden">
      <Navbar {...args} />
    </div>
  ),
}

export const MobileActionsDrawer: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    logo,
    items,
    actions: [
      <Button
        key="notifications"
        variant="ghost"
        size="sm"
        leftIcon={<Icon name="Bell" size="sm" />}
      >
        Notifications
      </Button>,
      <Button key="sign-in" variant="outline" size="sm">
        Sign in
      </Button>,
      <Button key="cta" size="sm">
        Get Started
      </Button>,
    ],
  },
  render: (args) => (
    <div className="max-w-sm border border-border rounded-lg overflow-hidden">
      <Navbar {...args} />
    </div>
  ),
}

// An app's user menu: it opens towards the inside of whatever holds it (the right edge of the
// header, the left of the drawer column) and closes the actions drawer after an action (#67).
function UserMenu() {
  const { inDrawer, closeDrawer } = useNavbarAction()
  return (
    <DropdownMenu
      align={inDrawer ? 'start' : 'end'}
      trigger={
        <Button variant="ghost" size="sm" aria-label="User menu">
          <Avatar alt="Ada Lovelace" fallback="A" size="sm" />
        </Button>
      }
      items={[
        { label: 'Profile', onClick: closeDrawer },
        { type: 'separator' },
        { label: 'Sign out', onClick: closeDrawer, danger: true },
      ]}
    />
  )
}

export const ActionsAwareOfDrawer: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: {
    logo,
    items,
    actions: [
      <Button key="notifications" variant="ghost" size="sm">
        Notifications
      </Button>,
      <UserMenu key="user" />,
    ],
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button', { name: 'More actions' }))
    const drawer = await within(document.body).findByRole('dialog')

    await userEvent.click(within(drawer).getByRole('button', { name: 'User menu' }))
    const menu = within(drawer).getByRole('menu')
    // Aligned to the start of the trigger, the menu stays inside the drawer.
    const drawerBox = drawer.getBoundingClientRect()
    const menuBox = menu.getBoundingClientRect()
    await expect(menuBox.left).toBeGreaterThanOrEqual(drawerBox.left)
    await expect(menuBox.right).toBeLessThanOrEqual(drawerBox.right)

    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Sign out' }))
    await waitFor(() => expect(within(document.body).queryByRole('dialog')).toBeNull())
  },
}

export const CenteredLogo: Story = {
  args: {
    logo,
    logoAlign: 'center',
  },
}

export const CenteredLogoWithItems: Story = {
  args: {
    logo,
    items,
    actions: [
      <Button key="sign-in" size="sm">
        Sign in
      </Button>,
    ],
    logoAlign: 'center',
  },
}

export const CustomLabels: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    logo,
    items: [
      { label: 'Início', href: '/', active: true },
      { label: 'Projetos', href: '/projects' },
      { label: 'Contato', href: '/contact' },
    ],
    actions: [
      <Button key="theme" variant="ghost" size="sm">
        Tema
      </Button>,
      <Button key="cv" size="sm">
        Currículo
      </Button>,
    ],
    label: 'Navegação principal',
    menuButtonLabel: 'Abrir menu de navegação',
    actionsButtonLabel: 'Mais ações',
    menuTitle: 'Menu',
    actionsTitle: 'Ações',
    drawerCloseLabel: 'Fechar',
    drawerDismissLabel: 'Fechar painel',
  },
  render: (args) => (
    <div className="max-w-sm border border-border rounded-lg overflow-hidden">
      <Navbar {...args} />
    </div>
  ),
}

// Stands in for a router link such as Next.js `Link`, which base-ds doesn't depend on: it renders
// its own <a> and skips the browser navigation, as client-side routing would.
function DemoLink({
  href,
  children,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      {...props}
      href={href}
      data-router-link=""
      onClick={(e) => {
        onClick?.(e)
        e.preventDefault()
      }}
    >
      {children}
    </a>
  )
}

export const CustomLinkComponent: Story = {
  args: {
    logo,
    items: itemsWithDropdown,
    linkComponent: DemoLink,
  },
}
