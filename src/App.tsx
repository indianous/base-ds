import { useState } from 'react'
import { Heading } from './components/atoms/Typography/Heading'
import { Text } from './components/atoms/Typography/Text'
import { Button } from './components/atoms/Button/Button'
import { Input } from './components/atoms/Input/Input'
import { Badge } from './components/atoms/Badge/Badge'
import { Spinner } from './components/atoms/Spinner/Spinner'
import { Skeleton } from './components/atoms/Skeleton/Skeleton'
import { Avatar } from './components/atoms/Avatar/Avatar'
import { Icon } from './components/atoms/Icon/Icon'
import { Checkbox } from './components/atoms/Checkbox/Checkbox'
import { Radio } from './components/atoms/Radio/Radio'
import { Switch } from './components/atoms/Switch/Switch'
import { Select } from './components/atoms/Select/Select'
import { QrCode } from './components/atoms/QrCode/QrCode'
import { Image } from './components/atoms/Image/Image'
import { NumberInput } from './components/molecules/NumberInput/NumberInput'
import { PasswordInput } from './components/molecules/PasswordInput/PasswordInput'
import { PinInput } from './components/molecules/PinInput/PinInput'
import { TagsInput } from './components/molecules/TagsInput/TagsInput'
import { Rating } from './components/molecules/Rating/Rating'
import { FileUpload } from './components/molecules/FileUpload/FileUpload'
import { SearchField } from './components/molecules/SearchField/SearchField'
import { FormField } from './components/molecules/FormField/FormField'
import { Breadcrumb } from './components/molecules/Breadcrumb/Breadcrumb'
import { Pagination } from './components/molecules/Pagination/Pagination'
import { Card } from './components/organisms/Card/Card'
import { Navbar } from './components/organisms/Navbar/Navbar'
import { Sidebar } from './components/organisms/Sidebar/Sidebar'
import { Table } from './components/organisms/Table/Table'
import type { TableColumn } from './components/organisms/Table/Table'
import { Carousel } from './components/organisms/Carousel/Carousel'
import { Dialog } from './components/organisms/Dialog/Dialog'
import { Drawer } from './components/organisms/Drawer/Drawer'
import { cn } from './utils/cn'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <Heading as="h2" size="xl" weight="semibold">
          {title}
        </Heading>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </section>
  )
}

function ComponentCard({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-background p-5', className)}>
      <Text
        as="span"
        size="xs"
        color="muted"
        weight="medium"
        className="uppercase tracking-wider mb-4 block"
      >
        {title}
      </Text>
      {children}
    </div>
  )
}

const frameworkOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'angular', label: 'Angular' },
]

export function App() {
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('b')
  const [switchOn, setSwitchOn] = useState(true)
  const [selectValue, setSelectValue] = useState('react')
  const [isLoading, setIsLoading] = useState(false)

  // Molecules state
  const [qty, setQty] = useState(3)
  const [pinValue, setPinValue] = useState('')
  const [tags, setTags] = useState(['React', 'TypeScript'])
  const [rating, setRating] = useState(3)
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [formEmail, setFormEmail] = useState('')

  // Organisms state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSide, setDrawerSide] = useState<'left' | 'right' | 'top' | 'bottom'>('right')

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Icon name="Layers" size="lg" aria-label="base-ds logo" />
            <Heading as="h1" size="xl" weight="bold">
              base-ds
            </Heading>
          </div>
          <Badge variant="primary" size="sm">
            v0.1.0
          </Badge>
          <div className="flex-1" />
          <Text color="muted" size="sm">
            Design System — 15 atoms · 10 molecules · 7 organisms
          </Text>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-14 text-center">
          <Badge variant="info" size="sm" className="mb-4">
            Fases 3, 4 &amp; 5 completas · 401 testes passando
          </Badge>
          <Heading as="h1" size="4xl" weight="bold" className="mb-4">
            Component Overview
          </Heading>
          <Text color="muted" size="lg" className="max-w-xl mx-auto">
            Todos os átomos do sistema de design, implementados com TDD, tokens CSS e
            acessibilidade.
          </Text>
        </div>

        {/* ── Typography ────────────────────────────────────────── */}
        <Section title="Typography">
          <div className="grid grid-cols-2 gap-4">
            <ComponentCard title="Heading">
              <div className="space-y-3">
                <Heading as="h1" size="4xl" weight="bold">
                  Heading 4XL
                </Heading>
                <Heading as="h2" size="3xl" weight="semibold">
                  Heading 3XL
                </Heading>
                <Heading as="h3" size="2xl" weight="medium">
                  Heading 2XL
                </Heading>
                <Heading as="h4" size="xl" weight="regular">
                  Heading XL
                </Heading>
              </div>
            </ComponentCard>
            <ComponentCard title="Text">
              <div className="space-y-3">
                <Text size="lg" weight="semibold">
                  Large semibold text
                </Text>
                <Text size="md" color="default">
                  Regular body text (md)
                </Text>
                <Text size="sm" color="muted">
                  Small muted helper text
                </Text>
                <Text size="xs" color="destructive">
                  Extra small destructive
                </Text>
                <Text as="label" size="sm" weight="medium">
                  Form label (as label)
                </Text>
              </div>
            </ComponentCard>
          </div>
        </Section>

        {/* ── Button ────────────────────────────────────────────── */}
        <Section title="Button">
          <div className="grid grid-cols-2 gap-4">
            <ComponentCard title="Variants">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </ComponentCard>
            <ComponentCard title="Sizes & States">
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button disabled>Disabled</Button>
                <Button isLoading={isLoading} onClick={handleLoadingDemo}>
                  {isLoading ? 'Loading...' : 'Click to load'}
                </Button>
              </div>
            </ComponentCard>
            <ComponentCard title="With Icons">
              <div className="flex flex-wrap gap-3">
                <Button leftIcon={<Icon name="Plus" size="sm" />}>Add item</Button>
                <Button variant="outline" rightIcon={<Icon name="ArrowRight" size="sm" />}>
                  Next step
                </Button>
                <Button variant="ghost" leftIcon={<Icon name="Download" size="sm" />}>
                  Download
                </Button>
              </div>
            </ComponentCard>
          </div>
        </Section>

        {/* ── Form Controls ─────────────────────────────────────── */}
        <Section title="Form Controls">
          <div className="grid grid-cols-2 gap-4">
            <ComponentCard title="Input">
              <div className="space-y-3">
                <Input id="input-default" placeholder="Default input (md)" />
                <Input id="input-sm" size="sm" placeholder="Small input" />
                <Input
                  id="input-error"
                  state="error"
                  placeholder="Error state"
                  defaultValue="invalid"
                />
                <Input
                  id="input-success"
                  state="success"
                  placeholder="Success state"
                  defaultValue="valid@email.com"
                />
                <Input id="input-disabled" disabled placeholder="Disabled input" />
              </div>
            </ComponentCard>
            <ComponentCard title="Select">
              <div className="space-y-3">
                <Select
                  id="select-default"
                  options={frameworkOptions}
                  placeholder="Select a framework..."
                  value={selectValue}
                  onChange={(e) => setSelectValue(e.target.value)}
                />
                <Select
                  id="select-error"
                  options={frameworkOptions}
                  state="error"
                  placeholder="Required"
                />
                <Select
                  id="select-success"
                  options={frameworkOptions}
                  state="success"
                  value="vue"
                  onChange={() => {}}
                />
                <Select
                  id="select-disabled"
                  options={frameworkOptions}
                  disabled
                  placeholder="Disabled"
                />
              </div>
            </ComponentCard>
            <ComponentCard title="Checkbox">
              <div className="space-y-3">
                <Checkbox
                  id="cb-1"
                  label="Accept terms and conditions"
                  checked={checkboxChecked}
                  onChange={(e) => setCheckboxChecked(e.target.checked)}
                />
                <Checkbox id="cb-2" label="Indeterminate state" indeterminate onChange={() => {}} />
                <Checkbox id="cb-3" label="Disabled unchecked" disabled />
                <Checkbox id="cb-4" label="Disabled checked" disabled checked onChange={() => {}} />
              </div>
            </ComponentCard>
            <ComponentCard title="Radio">
              <div className="space-y-3">
                <Radio
                  id="radio-a"
                  name="demo"
                  value="a"
                  label="Option A"
                  checked={radioValue === 'a'}
                  onChange={() => setRadioValue('a')}
                />
                <Radio
                  id="radio-b"
                  name="demo"
                  value="b"
                  label="Option B (selected)"
                  checked={radioValue === 'b'}
                  onChange={() => setRadioValue('b')}
                />
                <Radio id="radio-c" name="demo" value="c" label="Option C (disabled)" disabled />
              </div>
            </ComponentCard>
            <ComponentCard title="Switch">
              <div className="space-y-4">
                <Switch
                  id="sw-1"
                  label="Enable notifications"
                  checked={switchOn}
                  onChange={setSwitchOn}
                />
                <Switch id="sw-2" label="Dark mode" checked={false} onChange={() => {}} />
                <Switch id="sw-3" label="Disabled (off)" disabled />
                <Switch id="sw-4" label="Disabled (on)" disabled checked onChange={() => {}} />
              </div>
            </ComponentCard>
          </div>
        </Section>

        {/* ── Badge ─────────────────────────────────────────────── */}
        <Section title="Badge">
          <ComponentCard title="Variants & Sizes">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary" size="sm">
                  Small primary
                </Badge>
                <Badge variant="success" size="sm">
                  Small success
                </Badge>
                <Badge variant="danger" size="sm">
                  Small danger
                </Badge>
              </div>
            </div>
          </ComponentCard>
        </Section>

        {/* ── Icon ──────────────────────────────────────────────── */}
        <Section title="Icon">
          <ComponentCard title="Lucide React wrapper — sizes & a11y">
            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <Icon name="Star" size="sm" aria-label="Star small" />
                <Icon name="Star" size="md" aria-label="Star medium" />
                <Icon name="Star" size="lg" aria-label="Star large" />
                <Icon name="Star" size="xl" aria-label="Star extra large" />
              </div>
              <div className="flex flex-wrap gap-4">
                {(
                  [
                    'Search',
                    'Bell',
                    'Settings',
                    'User',
                    'Home',
                    'Mail',
                    'Heart',
                    'Lock',
                    'Eye',
                    'Download',
                    'Upload',
                    'Trash2',
                  ] as const
                ).map((name) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <Icon name={name} size="md" aria-label={name} />
                    <Text size="xs" color="muted">
                      {name}
                    </Text>
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>
        </Section>

        {/* ── Spinner & Skeleton ────────────────────────────────── */}
        <Section title="Spinner & Skeleton">
          <div className="grid grid-cols-2 gap-4">
            <ComponentCard title="Spinner">
              <div className="flex items-end gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="sm" />
                  <Text size="xs" color="muted">
                    sm
                  </Text>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="md" />
                  <Text size="xs" color="muted">
                    md
                  </Text>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Spinner size="lg" />
                  <Text size="xs" color="muted">
                    lg
                  </Text>
                </div>
              </div>
            </ComponentCard>
            <ComponentCard title="Skeleton">
              <div className="space-y-3">
                <Skeleton variant="circle" width={48} height={48} />
                <Skeleton variant="line" width="70%" height={16} />
                <Skeleton variant="line" width="50%" height={16} />
                <Skeleton variant="rect" width="100%" height={80} />
              </div>
            </ComponentCard>
          </div>
        </Section>

        {/* ── Avatar & Image ────────────────────────────────────── */}
        <Section title="Avatar & Image">
          <div className="grid grid-cols-2 gap-4">
            <ComponentCard title="Avatar">
              <div className="space-y-4">
                <div className="flex items-end gap-3">
                  <Avatar alt="User" fallback="AB" size="sm" />
                  <Avatar alt="User" fallback="CD" size="md" />
                  <Avatar alt="User" fallback="EF" size="lg" />
                  <Avatar alt="User" fallback="GH" size="xl" />
                </div>
                <div className="flex items-center gap-3">
                  <Avatar src="https://i.pravatar.cc/150?img=3" alt="João Silva" size="md" />
                  <Avatar alt="Square" fallback="JS" size="md" shape="square" />
                  <Avatar src="broken" alt="Fallback" fallback="FB" size="md" />
                  <Text size="sm" color="muted">
                    com imagem · quadrado · fallback de erro
                  </Text>
                </div>
              </div>
            </ComponentCard>
            <ComponentCard title="Image">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Image
                    src="https://picsum.photos/seed/ds1/300/300"
                    alt="Square sample"
                    aspectRatio="square"
                    className="rounded-md overflow-hidden"
                  />
                  <Text size="xs" color="muted" className="mt-1 text-center">
                    square
                  </Text>
                </div>
                <div>
                  <Image
                    src="https://picsum.photos/seed/ds2/400/225"
                    alt="Video sample"
                    aspectRatio="video"
                    className="rounded-md overflow-hidden"
                  />
                  <Text size="xs" color="muted" className="mt-1 text-center">
                    video
                  </Text>
                </div>
                <div>
                  <Image
                    src="https://picsum.photos/seed/ds3/300/400"
                    alt="Portrait sample"
                    aspectRatio="portrait"
                    className="rounded-md overflow-hidden"
                  />
                  <Text size="xs" color="muted" className="mt-1 text-center">
                    portrait
                  </Text>
                </div>
              </div>
            </ComponentCard>
          </div>
        </Section>

        {/* ── QrCode ────────────────────────────────────────────── */}
        <Section title="QrCode">
          <ComponentCard title="QR Code generator">
            <div className="flex flex-wrap gap-8">
              <div className="flex flex-col items-center gap-2">
                <QrCode value="https://github.com" size={128} />
                <Text size="xs" color="muted">
                  128px · L
                </Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <QrCode value="https://github.com" size={160} errorCorrection="M" />
                <Text size="xs" color="muted">
                  160px · M
                </Text>
              </div>
              <div className="flex flex-col items-center gap-2">
                <QrCode value="https://github.com" size={160} errorCorrection="H" />
                <Text size="xs" color="muted">
                  160px · H (maior redundância)
                </Text>
              </div>
            </div>
          </ComponentCard>
        </Section>

        {/* ── Molecules ─────────────────────────────────────────── */}
        <Section title="Molecules">
          {/* Row 1: NumberInput + PasswordInput */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ComponentCard title="NumberInput">
              <div className="space-y-3">
                <NumberInput id="qty-demo" value={qty} min={0} max={10} onChange={setQty} />
                <Text size="sm" color="muted">
                  Value: {qty} · min 0 · max 10
                </Text>
                <NumberInput id="qty-step" defaultValue={0} step={5} />
                <Text size="xs" color="muted">
                  Step 5
                </Text>
                <NumberInput id="qty-dis" value={2} disabled onChange={() => {}} />
                <Text size="xs" color="muted">
                  Disabled
                </Text>
              </div>
            </ComponentCard>

            <ComponentCard title="PasswordInput">
              <div className="space-y-3">
                <PasswordInput id="pwd-demo" placeholder="Enter your password" />
                <PasswordInput
                  id="pwd-error"
                  state="error"
                  placeholder="Incorrect password"
                  defaultValue="wrongpassword"
                />
                <PasswordInput id="pwd-dis" disabled placeholder="Disabled" />
              </div>
            </ComponentCard>
          </div>

          {/* Row 2: PinInput + Rating */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ComponentCard title="PinInput">
              <div className="space-y-4">
                <div>
                  <Text size="xs" color="muted" className="mb-2">
                    4 digits
                  </Text>
                  <PinInput
                    length={4}
                    value={pinValue}
                    onChange={setPinValue}
                    onComplete={(v) => setPinValue(v)}
                  />
                  {pinValue.length > 0 && (
                    <Text size="xs" color="muted" className="mt-2">
                      PIN: {pinValue}
                    </Text>
                  )}
                </div>
                <div>
                  <Text size="xs" color="muted" className="mb-2">
                    6 digits · masked
                  </Text>
                  <PinInput length={6} mask />
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Rating">
              <div className="space-y-4">
                <div>
                  <Text size="xs" color="muted" className="mb-2">
                    Interactive (click a star)
                  </Text>
                  <Rating value={rating} onChange={setRating} />
                  <Text size="xs" color="muted" className="mt-1">
                    {rating} / 5 stars
                  </Text>
                </div>
                <div>
                  <Text size="xs" color="muted" className="mb-2">
                    Read only · 4/5
                  </Text>
                  <Rating value={4} readOnly />
                </div>
                <div>
                  <Text size="xs" color="muted" className="mb-2">
                    10 stars · size sm
                  </Text>
                  <Rating value={7} max={10} size="sm" readOnly />
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Row 3: TagsInput + SearchField */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ComponentCard title="TagsInput">
              <div className="space-y-2">
                <TagsInput
                  id="tags-demo"
                  value={tags}
                  onChange={setTags}
                  placeholder="Add a tag and press Enter..."
                  maxTags={6}
                />
                <Text size="xs" color="muted">
                  {tags.length} tag(s) · max 6
                </Text>
                <TagsInput id="tags-dis" value={['React', 'Vue']} disabled onChange={() => {}} />
                <Text size="xs" color="muted">
                  Disabled
                </Text>
              </div>
            </ComponentCard>

            <ComponentCard title="SearchField">
              <div className="space-y-3">
                <SearchField
                  placeholder="Search components..."
                  onSearch={(v) => setSearchResult(v)}
                />
                {searchResult !== null && (
                  <Text size="sm" color="muted">
                    Searched for:{' '}
                    <strong className="text-foreground">&quot;{searchResult}&quot;</strong>
                  </Text>
                )}
                <SearchField
                  placeholder="Loading state..."
                  isLoading={true}
                  onSearch={() => {}}
                  defaultValue="react"
                />
              </div>
            </ComponentCard>
          </div>

          {/* Row 4: FormField */}
          <div className="mb-4">
            <ComponentCard title="FormField">
              <div className="grid grid-cols-3 gap-6">
                <FormField
                  label="Email address"
                  id="ff-email"
                  required
                  hint="We'll never share your email"
                >
                  <Input
                    id="ff-email"
                    type="email"
                    placeholder="you@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                  />
                </FormField>
                <FormField
                  label="Password"
                  id="ff-pwd"
                  {...(formEmail && !formEmail.includes('@') ? { error: 'Must contain @' } : {})}
                >
                  <PasswordInput id="ff-pwd" placeholder="Min. 8 characters" />
                </FormField>
                <FormField label="Framework" id="ff-fw" hint="Choose your primary stack">
                  <Select id="ff-fw" options={frameworkOptions} placeholder="Select framework..." />
                </FormField>
              </div>
            </ComponentCard>
          </div>

          {/* Row 5: Breadcrumb + FileUpload */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ComponentCard title="Breadcrumb">
              <div className="space-y-4">
                <Breadcrumb
                  items={[
                    { label: 'Home', href: '/' },
                    { label: 'Components', href: '/components' },
                    { label: 'Molecules' },
                  ]}
                />
                <Breadcrumb
                  items={[
                    { label: 'Dashboard', onClick: () => {} },
                    { label: 'Settings', onClick: () => {} },
                    { label: 'Profile' },
                  ]}
                  separator={
                    <Icon name="ChevronRight" size="sm" className="text-muted-foreground mx-1" />
                  }
                />
                <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Current page' }]} />
              </div>
            </ComponentCard>

            <ComponentCard title="FileUpload">
              <div className="space-y-3">
                <FileUpload
                  accept="image/*"
                  multiple
                  maxSize={5 * 1024 * 1024}
                  onChange={(files) => console.log(files)}
                />
                <Text size="xs" color="muted">
                  Images only · max 5 MB each
                </Text>
              </div>
            </ComponentCard>
          </div>

          {/* Row 6: Pagination */}
          <ComponentCard title="Pagination">
            <div className="space-y-4">
              <div>
                <Text size="xs" color="muted" className="mb-2">
                  Page {currentPage} of 20
                </Text>
                <Pagination
                  currentPage={currentPage}
                  totalPages={20}
                  onPageChange={setCurrentPage}
                />
              </div>
              <div>
                <Text size="xs" color="muted" className="mb-2">
                  Few pages · no edges
                </Text>
                <Pagination
                  currentPage={2}
                  totalPages={4}
                  onPageChange={() => {}}
                  showEdges={false}
                />
              </div>
            </div>
          </ComponentCard>
        </Section>

        {/* ── Organisms ─────────────────────────────────────────── */}
        <Section title="Organisms">
          {/* Card variants */}
          <div className="mb-4">
            <ComponentCard title="Card">
              <div className="grid grid-cols-3 gap-4">
                <Card variant="flat">
                  <Text size="sm" weight="medium" className="mb-1">
                    Flat (default)
                  </Text>
                  <Text size="xs" color="muted">
                    No shadow, no border
                  </Text>
                </Card>
                <Card
                  variant="elevated"
                  header={
                    <Text as="span" size="sm" weight="semibold">
                      Elevated
                    </Text>
                  }
                >
                  <Text size="xs" color="muted">
                    shadow-md applied
                  </Text>
                </Card>
                <Card
                  variant="outlined"
                  header={
                    <Text as="span" size="sm" weight="semibold">
                      Outlined
                    </Text>
                  }
                  footer={
                    <Button size="sm" variant="primary" className="w-full">
                      Primary action
                    </Button>
                  }
                >
                  <Text size="xs" color="muted">
                    border + header + footer slots
                  </Text>
                </Card>
              </div>
            </ComponentCard>
          </div>

          {/* Navbar */}
          <div className="mb-4">
            <ComponentCard title="Navbar">
              <div className="rounded-lg overflow-hidden border border-border">
                <Navbar
                  logo={
                    <div className="flex items-center gap-2">
                      <Icon name="Layers" size="sm" />
                      <Text weight="semibold" size="sm">
                        base-ds
                      </Text>
                    </div>
                  }
                  items={[
                    { label: 'Home', href: '#', active: true },
                    { label: 'Components', href: '#' },
                    { label: 'Docs', href: '#' },
                    { label: 'Changelog', href: '#' },
                  ]}
                  actions={[
                    <Button
                      key="github"
                      variant="ghost"
                      size="sm"
                      leftIcon={<Icon name="GitBranch" size="sm" />}
                    >
                      GitHub
                    </Button>,
                    <Button key="cta" variant="primary" size="sm">
                      Get Started
                    </Button>,
                  ]}
                />
              </div>
            </ComponentCard>
          </div>

          {/* Sidebar + Table */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ComponentCard title="Sidebar">
              <div className="h-52 flex overflow-hidden rounded-lg border border-border">
                <Sidebar
                  items={[
                    {
                      label: 'Dashboard',
                      icon: <Icon name="Home" size="sm" />,
                      active: true,
                      href: '#',
                    },
                    { label: 'Components', icon: <Icon name="Layers" size="sm" />, href: '#' },
                    { label: 'Settings', icon: <Icon name="Settings" size="sm" />, href: '#' },
                    { label: 'Profile', icon: <Icon name="User" size="sm" />, href: '#' },
                  ]}
                  footer={
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Icon name="LogOut" size="sm" />}
                      className="w-full justify-start"
                    >
                      Sign out
                    </Button>
                  }
                />
                <div className="flex-1 bg-muted flex items-center justify-center">
                  <Text color="muted" size="sm">
                    Main content area
                  </Text>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard title="Table">
              {(() => {
                type ComponentRow = { component: string; type: string; tests: string }
                const cols: TableColumn<ComponentRow>[] = [
                  { key: 'component', header: 'Component', sortable: true },
                  {
                    key: 'type',
                    header: 'Layer',
                    render: (row) => (
                      <Badge
                        variant={
                          row.type === 'Atom'
                            ? 'primary'
                            : row.type === 'Molecule'
                              ? 'info'
                              : 'success'
                        }
                        size="sm"
                      >
                        {row.type}
                      </Badge>
                    ),
                  },
                  {
                    key: 'tests',
                    header: 'Tests',
                    render: (row) => (
                      <Badge variant="default" size="sm">
                        {row.tests}
                      </Badge>
                    ),
                  },
                ]
                const rows: ComponentRow[] = [
                  { component: 'Button', type: 'Atom', tests: '18' },
                  { component: 'FormField', type: 'Molecule', tests: '9' },
                  { component: 'Dialog', type: 'Organism', tests: '14' },
                  { component: 'Carousel', type: 'Organism', tests: '14' },
                ]
                return <Table columns={cols} data={rows} caption="Component catalog sample" />
              })()}
            </ComponentCard>
          </div>

          {/* Carousel */}
          <div className="mb-4">
            <ComponentCard title="Carousel">
              <Carousel
                loop
                items={[
                  <div
                    key="1"
                    className="bg-primary text-primary-foreground rounded-lg p-10 text-center"
                  >
                    <Heading as="h3" size="xl" weight="bold" className="mb-2">
                      Atoms
                    </Heading>
                    <Text size="sm">
                      15 indivisible building blocks — Button, Input, Badge, Icon and more
                    </Text>
                  </div>,
                  <div
                    key="2"
                    className="bg-secondary text-secondary-foreground rounded-lg p-10 text-center"
                  >
                    <Heading as="h3" size="xl" weight="bold" className="mb-2">
                      Molecules
                    </Heading>
                    <Text size="sm">
                      10 composite components — FormField, Rating, PinInput and more
                    </Text>
                  </div>,
                  <div
                    key="3"
                    className="bg-success text-success-foreground rounded-lg p-10 text-center"
                  >
                    <Heading as="h3" size="xl" weight="bold" className="mb-2">
                      Organisms
                    </Heading>
                    <Text size="sm">
                      7 complex layouts — Card, Navbar, Sidebar, Table, Dialog, Drawer, Carousel
                    </Text>
                  </div>,
                ]}
              />
            </ComponentCard>
          </div>

          {/* Dialog + Drawer */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ComponentCard title="Dialog">
              <div className="space-y-3">
                <Text size="sm" color="muted">
                  Modal with portal, Escape key & backdrop click to close.
                </Text>
                <Button
                  variant="primary"
                  onClick={() => setDialogOpen(true)}
                  leftIcon={<Icon name="ExternalLink" size="sm" />}
                >
                  Open Dialog
                </Button>
                <Dialog
                  open={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  title="Delete component"
                  description="This action is permanent and cannot be undone. All component data will be removed."
                  footer={
                    <>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="danger" onClick={() => setDialogOpen(false)}>
                        Delete
                      </Button>
                    </>
                  }
                >
                  <Text size="sm">
                    Make sure you have exported any important data before proceeding.
                  </Text>
                </Dialog>
              </div>
            </ComponentCard>

            <ComponentCard title="Drawer">
              <div className="space-y-3">
                <Text size="sm" color="muted">
                  Slide-in panel from any side of the screen.
                </Text>
                <div className="flex flex-wrap gap-2">
                  {(['right', 'left', 'bottom'] as const).map((side) => (
                    <Button
                      key={side}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDrawerSide(side)
                        setDrawerOpen(true)
                      }}
                    >
                      {side[0]!.toUpperCase() + side.slice(1)}
                    </Button>
                  ))}
                </div>
                <Drawer
                  open={drawerOpen}
                  onClose={() => setDrawerOpen(false)}
                  title={`${drawerSide[0]!.toUpperCase() + drawerSide.slice(1)} Drawer`}
                  side={drawerSide}
                  footer={
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDrawerOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => setDrawerOpen(false)}>
                        Save
                      </Button>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <Text size="sm">
                      Drawer content area. Supports Escape key and backdrop click.
                    </Text>
                    <Switch
                      id="drawer-notifications"
                      label="Enable notifications"
                      checked={switchOn}
                      onChange={setSwitchOn}
                    />
                    <Switch
                      id="drawer-darkmode"
                      label="Dark mode"
                      checked={false}
                      onChange={() => {}}
                    />
                  </div>
                </Drawer>
              </div>
            </ComponentCard>
          </div>
        </Section>

        {/* ── Token Grid ────────────────────────────────────────── */}
        <Section title="Design Tokens">
          <ComponentCard title="Color palette">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'primary', bg: 'bg-primary', text: 'text-primary-foreground' },
                { label: 'secondary', bg: 'bg-secondary', text: 'text-secondary-foreground' },
                { label: 'success', bg: 'bg-success', text: 'text-success-foreground' },
                { label: 'warning', bg: 'bg-warning', text: 'text-warning-foreground' },
                { label: 'destructive', bg: 'bg-destructive', text: 'text-destructive-foreground' },
                { label: 'info', bg: 'bg-info', text: 'text-info-foreground' },
                { label: 'muted', bg: 'bg-muted', text: 'text-muted-foreground' },
                {
                  label: 'background',
                  bg: 'bg-background border border-border',
                  text: 'text-foreground',
                },
              ].map(({ label, bg, text }) => (
                <div key={label} className={cn('rounded-md px-4 py-3', bg)}>
                  <Text as="span" size="sm" weight="medium" className={text}>
                    {label}
                  </Text>
                </div>
              ))}
            </div>
          </ComponentCard>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Text color="muted" size="sm">
            base-ds · Design System
          </Text>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="sm">
              401 testes
            </Badge>
            <Badge variant="info" size="sm">
              15 atoms · 10 molecules · 7 organisms
            </Badge>
          </div>
        </div>
      </footer>
    </div>
  )
}
