/**
 * SOP Breadcrumbs Component - Breadcrumb navigation with SOP terminology
 * Provides contextual navigation path with SOP-specific labels
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  sopLabel?: string; // SOP-specific terminology
  path?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export interface SOPBreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
  onItemClick?: (path: string) => void;
}

// SOP terminology mappings for common paths
const sopTerminologyMap: Record<string, string> = {
  'flows': 'Standard Operating Procedures',
  'workflow': 'SOP Process',
  'workflows': 'SOP Processes',
  'runs': 'Process Executions',
  'execution': 'Process Execution',
  'issues': 'Process Approvals',
  'connections': 'Process Integrations',
  'team': 'Process Stakeholders',
  'settings': 'Process Configuration',
  'dashboard': 'SOP Dashboard',
  'builder': 'SOP Builder',
  'templates': 'SOP Templates'
};

const generateBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(segment => segment);
  const breadcrumbs: BreadcrumbItem[] = [];

  segments.forEach((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    
    // Decode URL segments and handle dynamic segments
    const decodedSegment = decodeURIComponent(segment);
    
    // Check if this is likely a dynamic ID (UUID or numeric)
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedSegment) || 
                 /^\d+$/.test(decodedSegment);

    if (isId) {
      // For IDs, use a generic label or try to get from context
      breadcrumbs.push({
        label: decodedSegment.substring(0, 8) + '...',
        sopLabel: 'Process Details',
        path: isLast ? undefined : path,
        isActive: isLast
      });
    } else {
      // Convert segment to readable label
      const label = decodedSegment
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      const sopLabel = sopTerminologyMap[decodedSegment.toLowerCase()] || label;
      
      breadcrumbs.push({
        label,
        sopLabel,
        path: isLast ? undefined : path,
        isActive: isLast
      });
    }
  });

  return breadcrumbs;
};

export const SOPBreadcrumbs: React.FC<SOPBreadcrumbsProps> = ({
  items,
  showHome = true,
  separator,
  className,
  maxItems,
  onItemClick
}) => {
  const location = useLocation();
  
  // Generate breadcrumbs from current path if none provided
  const breadcrumbs = items || generateBreadcrumbsFromPath(location.pathname);
  
  // Limit breadcrumbs if maxItems is specified
  const displayBreadcrumbs = maxItems && breadcrumbs.length > maxItems
    ? [
        ...breadcrumbs.slice(0, 1),
        { label: '...', sopLabel: '...', path: undefined },
        ...breadcrumbs.slice(-(maxItems - 2))
      ]
    : breadcrumbs;

  const defaultSeparator = separator || <ChevronRight className="h-4 w-4 text-muted-foreground" />;

  const handleItemClick = (path: string) => {
    onItemClick?.(path);
  };

  const renderBreadcrumbItem = (item: BreadcrumbItem, index: number) => {
    const isLast = index === displayBreadcrumbs.length - 1;
    const displayLabel = item.sopLabel || item.label;

    if (item.path === undefined || isLast) {
      return (
        <span 
          key={index}
          className={cn(
            "text-sm font-medium",
            isLast ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {item.icon && (
            <span className="mr-1 inline-flex">
              {item.icon}
            </span>
          )}
          {displayLabel}
        </span>
      );
    }

    return (
      <Link
        key={index}
        to={item.path}
        onClick={() => handleItemClick(item.path!)}
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        {item.icon && (
          <span className="mr-1 inline-flex">
            {item.icon}
          </span>
        )}
        {displayLabel}
      </Link>
    );
  };

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      {showHome && (
        <>
          <Link 
            to="/" 
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => handleItemClick('/')}
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.length > 0 && (
            <span className="text-muted-foreground">
              {defaultSeparator}
            </span>
          )}
        </>
      )}
      
      {displayBreadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {renderBreadcrumbItem(item, index)}
          {index < displayBreadcrumbs.length - 1 && (
            <span className="text-muted-foreground">
              {defaultSeparator}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default SOPBreadcrumbs;