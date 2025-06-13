import { cn } from "@/lib/utils"

interface FilterTabsProps {
  currentFilter: any
  onFilterChange: (filter: any) => void
  counts: Record<any, number>
}

export function FilterTabs({ currentFilter, onFilterChange, counts }: FilterTabsProps) {
  const tabs: { label: string; value: any }[] = [
    { label: "All", value: "all" },
    // { label: "Active", value: "active" },
    { label: "Draft", value: "draft" },
    // { label: "Archived", value: "archived" },
  ]

  return (
    <div className="border-b">
      <nav className="flex -mb-px space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onFilterChange(tab.value)}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
              currentFilter === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300",
            )}
          >
            {tab.label}
            <span className="ml-2 text-gray-400">({counts[tab.value]})</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

