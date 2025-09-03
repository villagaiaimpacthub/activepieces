import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  CheckCircle, 
  Circle, 
  FileText, 
  Settings, 
  Users, 
  MoreVertical,
  Search
} from 'lucide-react';

export interface SOPHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  status?: 'draft' | 'active' | 'archived';
  onStatusChange?: (status: 'draft' | 'active' | 'archived') => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: React.ReactNode;
}

const statusConfig = {
  draft: { 
    label: 'Draft', 
    variant: 'secondary' as const,
    icon: Circle 
  },
  active: { 
    label: 'Active', 
    variant: 'default' as const,
    icon: CheckCircle 
  },
  archived: { 
    label: 'Archived', 
    variant: 'outline' as const,
    icon: FileText 
  }
};

const SOPHeader = React.forwardRef<HTMLDivElement, SOPHeaderProps>(
  ({ 
    className, 
    title, 
    subtitle, 
    status = 'draft',
    onStatusChange,
    showSearch = true,
    searchValue = '',
    onSearchChange,
    actions,
    ...props 
  }, ref) => {
    const StatusIcon = statusConfig[status].icon;

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col w-full bg-background border-b border-border',
          className
        )}
        {...props}
      >
        {/* Main header content */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            <Badge 
              variant={statusConfig[status].variant}
              className="flex items-center space-x-1"
            >
              <StatusIcon className="h-3 w-3" />
              <span>{statusConfig[status].label}</span>
            </Badge>
          </div>

          <div className="flex items-center space-x-3">
            {actions}
            
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Collaborators
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <>
            <Separator />
            <div className="px-6 py-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search SOP processes..."
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

SOPHeader.displayName = 'SOPHeader';

export { SOPHeader };