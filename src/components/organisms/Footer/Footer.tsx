import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import type { LinkComponent } from '../../../utils/linkComponent'

interface FooterColumn {
  title: string
  links: { label: string; href: string }[]
}

interface FooterSocialLink {
  icon: ReactNode
  href: string
  label: string
}

interface FooterProps {
  logo?: ReactNode
  columns?: FooterColumn[]
  socialLinks?: FooterSocialLink[]
  copyright?: string
  className?: string
  /** Component rendered in place of `<a>` for every link (e.g. Next.js `Link`). */
  linkComponent?: LinkComponent
}

export function Footer({
  logo,
  columns,
  socialLinks,
  copyright,
  className,
  linkComponent: LinkElement = 'a',
}: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className={cn('border-t border-border bg-background px-4 py-8', className)}>
      <div className="flex flex-col gap-8">
        {(logo !== undefined || (columns !== undefined && columns.length > 0)) && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {logo !== undefined && <div className="flex-shrink-0">{logo}</div>}

            {columns?.map((column) => (
              <nav key={column.title} aria-label={column.title} className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-foreground">{column.title}</span>
                <ul className="flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <LinkElement
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {link.label}
                      </LinkElement>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        )}

        <div className="flex flex-col-reverse items-center gap-4 border-t border-border pt-4 md:flex-row md:justify-between">
          <span className="text-sm text-muted-foreground">{copyright ?? `© ${year} base-ds`}</span>

          {socialLinks !== undefined && socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <LinkElement
                  key={social.href}
                  href={social.href}
                  aria-label={social.label}
                  className="text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {social.icon}
                </LinkElement>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}

export type { FooterProps, FooterColumn, FooterSocialLink }
