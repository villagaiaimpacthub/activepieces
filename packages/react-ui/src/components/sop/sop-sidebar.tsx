import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Folder,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Circle,
  Clock,
  Archive
} from 'lucide-react';

export interface SOPProcess {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  stepCount?: number;
  lastModified?: Date;
  category?: string;
}

export interface SOPCategory {
  id: string;
  name: string;
  processes: SOPProcess[];
  expanded?: boolean;
}

export interface SOPSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  categories: SOPCategory[];
  selectedProcessId?: string;
  onProcessSelect?: (processId: string) => void;
  onCategoryToggle?: (categoryId: string) => void;
  onCreateProcess?: (categoryId?: string) => void;
  onCreateCategory?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilters?: boolean;
}

const statusIcons = {
  draft: Circle,
  active: CheckCircle,
  archived: Archive
};

const statusColors = {
  draft: 'text-yellow-500',
  active: 'text-green-500',
  archived: 'text-gray-500'
};

const SOPSidebar = React.forwardRef<HTMLDivElement, SOPSidebarProps>(
  ({
    className,
    categories,
    selectedProcessId,
    onProcessSelect,
    onCategoryToggle,
    onCreateProcess,
    onCreateCategory,
    searchValue = '',
    onSearchChange,
    showFilters = true,
    ...props
  }, ref) => {
    const [filteredCategories, setFilteredCategories] = React.useState(categories);

    React.useEffect(() => {
      if (!searchValue.trim()) {
        setFilteredCategories(categories);
        return;
      }

      const filtered = categories
        .map(category => ({
          ...category,
          processes: category.processes.filter(process =>
            process.name.toLowerCase().includes(searchValue.toLowerCase())
          )
        }))
        .filter(category => category.processes.length > 0);

      setFilteredCategories(filtered);
    }, [searchValue, categories]);

    const renderProcess = (process: SOPProcess) => {
      const StatusIcon = statusIcons[process.status];
      const isSelected = selectedProcessId === process.id;

      return (
        <Button
          key={process.id}
          variant={isSelected ? 'secondary' : 'ghost'}
          className={cn(
            'w-full justify-start text-left h-auto py-2 px-3',
            'hover:bg-accent hover:text-accent-foreground',
            isSelected && 'bg-accent text-accent-foreground'
          )}
          onClick={() => onProcessSelect?.(process.id)}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <StatusIcon className={cn('h-4 w-4 shrink-0', statusColors[process.status])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{process.name}</p>
              {process.stepCount && (
                <p className="text-xs text-muted-foreground">
                  {process.stepCount} steps
                </p>
              )}
            </div>
            {process.status === 'active' && (
              <Badge variant="outline" className="text-xs py-0 px-1">
                Active
              </Badge>
            )}
          </div>
        </Button>
      );
    };

    const renderCategory = (category: SOPCategory) => {
      const isExpanded = category.expanded ?? true;
      const ChevronIcon = isExpanded ? ChevronDown : ChevronRight;
      const FolderIcon = isExpanded ? FolderOpen : Folder;

      return (
        <div key={category.id} className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-between text-left h-8 px-2"
            onClick={() => onCategoryToggle?.(category.id)}
          >
            <div className="flex items-center space-x-2">
              <ChevronIcon className="h-4 w-4" />
              <FolderIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">{category.name}</span>
              <Badge variant="secondary" className="text-xs py-0 px-1">
                {category.processes.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onCreateProcess?.(category.id);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </Button>

          {isExpanded && (
            <div className="ml-2 space-y-1">
              {category.processes.map(renderProcess)}
            </div>
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col h-full bg-background border-r border-border',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">SOP Library</h2>
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={onCreateProcess}>
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onCreateCategory}>
                <Folder className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search processes..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-3 w-3 mr-1" />
                All Status
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="h-3 w-3 mr-1" />
                Recent
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(renderCategory)
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                {searchValue ? 'No processes found' : 'No SOP processes yet'}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => onCreateProcess?.()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New SOP
          </Button>
        </div>
      </div>
    );
  }
);

SOPSidebar.displayName = 'SOPSidebar';

export { SOPSidebar };