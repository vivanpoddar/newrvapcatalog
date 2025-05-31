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
  value?: string[]
  onValueChange?: (values: string[]) => void
  children: React.ReactNode
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ defaultValue = [], value, onValueChange, children, className, ...props }, ref) => {
    const [selectedValues, setSelectedValues] = React.useState<Set<string>>(
      new Set(value ?? defaultValue)
    )

    // Update internal state when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(new Set(value))
      }
    }, [value])

    const handleValueChange = React.useCallback((clickedValue: string) => {
      const currentValues = value !== undefined ? new Set(value) : selectedValues
      
      const newSet = new Set(currentValues)
      if (newSet.has(clickedValue)) {
        newSet.delete(clickedValue)
      } else {
        newSet.add(clickedValue)
      }
      
      const newArray = Array.from(newSet)
      onValueChange?.(newArray)
      
      // Only update internal state if not controlled
      if (value === undefined) {
        setSelectedValues(newSet)
      }
    }, [onValueChange, value, selectedValues])

    const contextValue = React.useMemo(() => ({
      selectedValues: value !== undefined ? new Set(value) : selectedValues,
      onValueChange: handleValueChange
    }), [selectedValues, handleValueChange, value])

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
