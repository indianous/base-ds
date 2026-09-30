import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { IconBase } from '../../atoms/Icon/IconBase'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  MoreHorizontalIcon,
} from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showEdges?: boolean
  siblings?: number
  className?: string
}

function getPageRange(current: number, total: number, siblings: number): (number | '...')[] {
  const range: (number | '...')[] = []
  const left = Math.max(2, current - siblings)
  const right = Math.min(total - 1, current + siblings)

  range.push(1)
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('...')
  if (total > 1) range.push(total)

  return range
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showEdges = true,
  siblings = 1,
  className,
}: PaginationProps) {
  const pages = getPageRange(currentPage, totalPages, siblings)

  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-1', className)}>
      {showEdges && (
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
          leftIcon={<IconBase icon={ChevronsLeftIcon} size="sm" />}
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        leftIcon={<IconBase icon={ChevronLeftIcon} size="sm" />}
      />

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2">
            <IconBase icon={MoreHorizontalIcon} size="sm" className="text-muted-foreground" />
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        rightIcon={<IconBase icon={ChevronRightIcon} size="sm" />}
      />
      {showEdges && (
        <Button
          variant="ghost"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
          rightIcon={<IconBase icon={ChevronsRightIcon} size="sm" />}
        />
      )}
    </nav>
  )
}
