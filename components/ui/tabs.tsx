"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MultiSelectTabsContextType {
  selectedValues: Set<string>
  onValueChange: (value: string) => void
}

const MultiSelectTabsContext = React.createContext<MultiSelectTabsContextType | undefined>(undefined)

interface TabsProps {
  defaultValue?: string[]
  onValueChange?: (values: string[]) => void
  children: React.ReactNode
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue = [], onValueChange, children, className, ...props }, ref) => {
    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
      new Set(defaultValue)
    )

    const handleValueChange = React.useCallback((value: string) => {
      setSelectedValues(prev => {
        const newSet = new Set(prev)
        if (newSet.has(value)) {
          newSet.delete(value)
        } else {
          newSet.add(value)
        }
        onValueChange?.(Array.from(newSet))
        return newSet
      })
    }, [onValueChange])

    const contextValue = React.useMemo(() => ({
      selectedValues,
      onValueChange: handleValueChange
    }), [selectedValues, handleValueChange])

    return (
      <MultiSelectTabsContext.Provider value={contextValue}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </MultiSelectTabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 p-0.5 items-center justify-center rounded-md bg-muted text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(MultiSelectTabsContext)
    if (!context) {
      throw new Error("TabsTrigger must be used within Tabs")
    }

    const { selectedValues, onValueChange } = context
    const isSelected = selectedValues.has(value)

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => onValueChange(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm m-0.5 p-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isSelected 
            ? "bg-background text-foreground shadow-sm" 
            : "hover:bg-background/50",
          className
        )}
        data-state={isSelected ? "active" : "inactive"}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(MultiSelectTabsContext)
    if (!context) {
      throw new Error("TabsContent must be used within Tabs")
    }

    const { selectedValues } = context
    const isSelected = selectedValues.has(value)

    if (!isSelected) return null

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
