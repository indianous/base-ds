// ────────────────────────────────────────────────────────────────────────────
// base-ds — Public API
// ────────────────────────────────────────────────────────────────────────────
// NOTE: this package is client-only (see tsup.config.ts `banner` — esbuild
// drops a "use client" directive written here when bundling to a single
// file, so it's injected at the dist output level instead).

// Utilities
export { cn } from './utils/cn'

// ── Atoms ────────────────────────────────────────────────────────────────────

export { Avatar } from './components/atoms/Avatar/Avatar'

export { Badge } from './components/atoms/Badge/Badge'
export type { BadgeProps } from './components/atoms/Badge/Badge'

export { Button } from './components/atoms/Button/Button'
export type { ButtonProps } from './components/atoms/Button/Button'

export { Checkbox } from './components/atoms/Checkbox/Checkbox'
export type { CheckboxProps } from './components/atoms/Checkbox/Checkbox'

export { Icon } from './components/atoms/Icon/Icon'

export { Image } from './components/atoms/Image/Image'
export type { ImageProps } from './components/atoms/Image/Image'

export { Input } from './components/atoms/Input/Input'
export type { InputProps } from './components/atoms/Input/Input'

export { QrCode } from './components/atoms/QrCode/QrCode'

export { Radio } from './components/atoms/Radio/Radio'
export type { RadioProps } from './components/atoms/Radio/Radio'

export { Select } from './components/atoms/Select/Select'
export type { SelectProps, SelectOption } from './components/atoms/Select/Select'

export { Skeleton } from './components/atoms/Skeleton/Skeleton'

export { Spinner } from './components/atoms/Spinner/Spinner'

export { Switch } from './components/atoms/Switch/Switch'

export { Textarea } from './components/atoms/Textarea/Textarea'
export type { TextareaProps } from './components/atoms/Textarea/Textarea'

export { Heading } from './components/atoms/Typography/Heading'
export type { HeadingProps } from './components/atoms/Typography/Heading'

export { Text } from './components/atoms/Typography/Text'

// ── Molecules ────────────────────────────────────────────────────────────────

export { Breadcrumb } from './components/molecules/Breadcrumb/Breadcrumb'

export { DropdownMenu } from './components/molecules/DropdownMenu/DropdownMenu'
export type {
  DropdownMenuProps,
  DropdownMenuItem,
} from './components/molecules/DropdownMenu/DropdownMenu'

export { FileUpload } from './components/molecules/FileUpload/FileUpload'

export { FormField } from './components/molecules/FormField/FormField'
export type { FormFieldProps } from './components/molecules/FormField/FormField'

export { NumberInput } from './components/molecules/NumberInput/NumberInput'

export { Pagination } from './components/molecules/Pagination/Pagination'

export { PasswordInput } from './components/molecules/PasswordInput/PasswordInput'

export { PinInput } from './components/molecules/PinInput/PinInput'
export type { PinInputProps } from './components/molecules/PinInput/PinInput'

export { Rating } from './components/molecules/Rating/Rating'

export { SearchField } from './components/molecules/SearchField/SearchField'

export { Tabs } from './components/molecules/Tabs/Tabs'
export type { TabsProps, TabItem } from './components/molecules/Tabs/Tabs'

export { TagsInput } from './components/molecules/TagsInput/TagsInput'
export type { TagsInputProps } from './components/molecules/TagsInput/TagsInput'

// ── Organisms ────────────────────────────────────────────────────────────────

export { Card } from './components/organisms/Card/Card'

export { Carousel } from './components/organisms/Carousel/Carousel'

export { Dialog } from './components/organisms/Dialog/Dialog'

export { Drawer } from './components/organisms/Drawer/Drawer'
export type { DrawerProps } from './components/organisms/Drawer/Drawer'

export { Navbar } from './components/organisms/Navbar/Navbar'
export type { NavbarProps, NavItem } from './components/organisms/Navbar/Navbar'

export { Sidebar } from './components/organisms/Sidebar/Sidebar'

export { Table } from './components/organisms/Table/Table'
export type { TableColumn } from './components/organisms/Table/Table'

export { Footer } from './components/organisms/Footer/Footer'
export type {
  FooterProps,
  FooterColumn,
  FooterSocialLink,
} from './components/organisms/Footer/Footer'

export { Toast } from './components/organisms/Toast/Toast'
export type { ToastProps, ToastVariant, ToastAction } from './components/organisms/Toast/Toast'

export { ToastProvider } from './components/organisms/Toast/ToastProvider'
export type {
  ToastContextValue,
  ToastOptions,
  ToastItem,
} from './components/organisms/Toast/ToastProvider'

export { ToastViewport } from './components/organisms/Toast/ToastViewport'

export { useToast } from './components/organisms/Toast/useToast'
