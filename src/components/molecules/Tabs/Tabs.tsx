import { useId, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { cn } from '../../../utils/cn'

export interface TabItem {
  id: string
  label: string
  content: ReactNode
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  defaultTab?: string
  onChange?: (id: string) => void
  className?: string
}

export function Tabs({ tabs, defaultTab, onChange, className }: TabsProps) {
  const baseId = useId()
  const firstEnabled = tabs.find((tab) => !tab.disabled)?.id ?? tabs[0]?.id
  const [activeTab, setActiveTab] = useState(defaultTab ?? firstEnabled)

  const activate = (id: string) => {
    setActiveTab(id)
    onChange?.(id)
  }

  const handleTabListKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const enabledTabs = tabs.filter((tab) => !tab.disabled)
    const currentIndex = enabledTabs.findIndex((tab) => tab.id === activeTab)

    let nextTab: TabItem | undefined
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length]
        break
      case 'ArrowLeft':
        e.preventDefault()
        nextTab = enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length]
        break
      case 'Home':
        e.preventDefault()
        nextTab = enabledTabs[0]
        break
      case 'End':
        e.preventDefault()
        nextTab = enabledTabs[enabledTabs.length - 1]
        break
      default:
        return
    }

    if (!nextTab) return
    activate(nextTab.id)
    document.getElementById(`${baseId}-tab-${nextTab.id}`)?.focus()
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        tabIndex={-1}
        onKeyDown={handleTabListKeyDown}
        className="flex gap-4 border-b border-border"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              onClick={() => activate(tab.id)}
              className={cn(
                '-mb-px border-b-2 px-1 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {tabs.map((tab) => {
        if (tab.id !== activeTab) return null
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`${baseId}-panel-${tab.id}`}
            aria-labelledby={`${baseId}-tab-${tab.id}`}
            tabIndex={0}
            className="pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {tab.content}
          </div>
        )
      })}
    </div>
  )
}
