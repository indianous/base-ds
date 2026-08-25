import { Fragment, useId, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'

export interface TableColumn<T> {
  key: string
  header: ReactNode
  render?: (row: T, rowIndex: number) => ReactNode
  sortable?: boolean
}

interface TableProps<T extends object> {
  columns: TableColumn<T>[]
  data: T[]
  caption?: string
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  renderExpandedRow?: (row: T, rowIndex: number) => ReactNode
  className?: string
}

export function Table<T extends object>({
  columns,
  data,
  caption,
  onSort,
  renderExpandedRow,
  className,
}: TableProps<T>) {
  const [sortState, setSortState] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const baseId = useId()

  function handleSort(key: string) {
    const nextDir = sortState?.key === key && sortState.dir === 'asc' ? 'desc' : 'asc'
    setSortState({ key, dir: nextDir })
    onSort?.(key, nextDir)
  }

  function toggleExpanded(rowIndex: number) {
    setExpandedRows((current) => {
      const next = new Set(current)
      if (next.has(rowIndex)) {
        next.delete(rowIndex)
      } else {
        next.add(rowIndex)
      }
      return next
    })
  }

  const colSpan = renderExpandedRow ? columns.length + 1 : columns.length

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm border-collapse">
        {caption && <caption className="mb-2 text-sm text-muted-foreground">{caption}</caption>}
        <thead className="bg-muted">
          <tr>
            {renderExpandedRow && (
              <th className="px-4 py-3 text-left font-semibold text-foreground">
                <span className="sr-only">Expand row</span>
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold text-foreground">
                {col.sortable ? (
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1"
                  >
                    {col.header}
                    {sortState?.key === col.key ? (
                      sortState.dir === 'asc' ? (
                        <Icon name="ChevronUp" size="sm" />
                      ) : (
                        <Icon name="ChevronDown" size="sm" />
                      )
                    ) : (
                      <Icon name="ChevronsUpDown" size="sm" />
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="text-center py-8 text-muted-foreground">
                No data
              </td>
            </tr>
          ) : (
            data.map((row, ri) => {
              const isExpanded = expandedRows.has(ri)
              const detailId = `${baseId}-detail-${ri}`

              return (
                <Fragment key={ri}>
                  <tr className="hover:bg-muted">
                    {renderExpandedRow && (
                      <td className="px-4 py-3 text-foreground">
                        <Button
                          iconOnly
                          variant="ghost"
                          size="sm"
                          aria-expanded={isExpanded}
                          aria-controls={detailId}
                          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} row`}
                          onClick={() => toggleExpanded(ri)}
                        >
                          <Icon name={isExpanded ? 'ChevronDown' : 'ChevronRight'} size="sm" />
                        </Button>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-foreground">
                        {col.render
                          ? col.render(row, ri)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                  {renderExpandedRow && isExpanded && (
                    <tr id={detailId}>
                      <td colSpan={colSpan} className="px-4 py-3 text-foreground">
                        {renderExpandedRow(row, ri)}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
