import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'
import { Icon } from '../../atoms/Icon/Icon'

export interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T, rowIndex: number) => ReactNode
  sortable?: boolean
}

interface TableProps<T extends object> {
  columns: TableColumn<T>[]
  data: T[]
  caption?: string
  onSort?: (key: string, direction: 'asc' | 'desc') => void
  className?: string
}

export function Table<T extends object>({
  columns,
  data,
  caption,
  onSort,
  className,
}: TableProps<T>) {
  const [sortState, setSortState] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)

  function handleSort(key: string) {
    const nextDir =
      sortState?.key === key && sortState.dir === 'asc' ? 'desc' : 'asc'
    setSortState({ key, dir: nextDir })
    onSort?.(key, nextDir)
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm border-collapse">
        {caption && (
          <caption className="mb-2 text-sm text-muted-foreground">{caption}</caption>
        )}
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-semibold text-foreground"
              >
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
              <td
                colSpan={columns.length}
                className="text-center py-8 text-muted-foreground"
              >
                No data
              </td>
            </tr>
          ) : (
            data.map((row, ri) => (
              <tr key={ri} className="hover:bg-muted">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-foreground">
                    {col.render
                      ? col.render(row, ri)
                      : String((row as Record<string, unknown>)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
