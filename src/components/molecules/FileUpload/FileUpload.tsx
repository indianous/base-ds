import React, { useRef, useState } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { Icon } from '../../atoms/Icon/Icon'
import { Text } from '../../atoms/Typography/Text'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onChange?: (files: File[]) => void
  disabled?: boolean
  dragAndDrop?: boolean
  className?: string
}

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function FileUpload({
  accept,
  multiple = false,
  maxSize,
  onChange,
  disabled = false,
  dragAndDrop = true,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const addFiles = (incoming: File[]) => {
    const next = multiple ? [...files, ...incoming] : incoming.slice(0, 1)
    setFiles(next)
    onChange?.(next)
  }

  const removeFile = (index: number) => {
    const next = files.filter((_, i) => i !== index)
    setFiles(next)
    onChange?.(next)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length > 0) addFiles(selected)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length > 0) addFiles(dropped)
  }

  const handleZoneClick = () => {
    if (!disabled) inputRef.current?.click()
  }

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleInputChange}
        className="sr-only"
        aria-label="File upload"
        tabIndex={-1}
      />

      {dragAndDrop ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-disabled={disabled}
          onClick={handleZoneClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleZoneClick()
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-border',
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <Icon name="Upload" size="lg" className="text-muted-foreground" />
            <Text size="sm" color="muted">
              Drag files here or click to select
            </Text>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          Select files
        </Button>
      )}

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, i) => {
            const exceedsMax = maxSize !== undefined && file.size > maxSize
            return (
              <div
                key={i}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="File" size="sm" />
                  <Text size="sm" className="truncate">
                    {file.name}
                  </Text>
                  <Text size="xs" color="muted">
                    ({formatSize(file.size)})
                  </Text>
                  {exceedsMax && (
                    <Text size="xs" color="destructive">
                      <Icon name="AlertCircle" size="sm" className="inline mr-1" />
                      File exceeds maximum size of {formatSize(maxSize!)}
                    </Text>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove ${file.name}`}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="X" size="sm" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
