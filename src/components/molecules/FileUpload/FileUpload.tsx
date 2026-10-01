import React, { useRef, useState } from 'react'
import { cn } from '../../../utils/cn'
import { Button } from '../../atoms/Button/Button'
import { IconBase } from '../../atoms/Icon/IconBase'
import { AlertCircleIcon, FileIcon, UploadIcon, XIcon } from 'lucide-react'
import { Text } from '../../atoms/Typography/Text'

interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onChange?: (files: File[]) => void
  disabled?: boolean
  dragAndDrop?: boolean
  className?: string
  /** `aria-label` of the hidden file input. */
  label?: string
  /** Text of the drag and drop zone. */
  dropzoneMessage?: string
  /** Text of the button that opens the file picker, when `dragAndDrop` is off. */
  selectFilesLabel?: string
  /** `aria-label` of the button that removes a file, from the file name. */
  removeFileLabel?: (fileName: string) => string
  /** Error shown for a file over `maxSize`, from the formatted maximum size (e.g. `"2.0 MB"`). */
  maxSizeMessage?: (maxSize: string) => string
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
  label = 'File upload',
  dropzoneMessage = 'Drag files here or click to select',
  selectFilesLabel = 'Select files',
  removeFileLabel = (fileName) => `Remove ${fileName}`,
  maxSizeMessage = (maxSize) => `File exceeds maximum size of ${maxSize}`,
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
        aria-label={label}
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
            isDragging ? 'border-primary bg-primary/10' : 'border-border',
            disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <IconBase icon={UploadIcon} size="lg" className="text-muted-foreground" />
            <Text size="sm" color="muted">
              {dropzoneMessage}
            </Text>
          </div>
        </div>
      ) : (
        <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled}>
          {selectFilesLabel}
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
                  <IconBase icon={FileIcon} size="sm" />
                  <Text size="sm" className="truncate">
                    {file.name}
                  </Text>
                  <Text size="xs" color="muted">
                    ({formatSize(file.size)})
                  </Text>
                  {exceedsMax && (
                    <Text size="xs" color="destructive">
                      <IconBase icon={AlertCircleIcon} size="sm" className="inline mr-1" />
                      {maxSizeMessage(formatSize(maxSize!))}
                    </Text>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={removeFileLabel(file.name)}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconBase icon={XIcon} size="sm" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
