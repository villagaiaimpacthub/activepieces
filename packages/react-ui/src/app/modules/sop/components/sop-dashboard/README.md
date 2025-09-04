# SOP Dashboard Components

## Overview

This module provides a comprehensive set of React components for displaying SOP (Standard Operating Procedures) specific dashboard widgets that replace the default Activepieces dashboard with SOP-focused interfaces.

## Components

### 1. SopOverviewWidget
- **Purpose**: Displays key SOP metrics and statistics
- **Features**: Total SOPs, active executions, completion rates, success rates
- **Real-time**: Updates every 30 seconds
- **Props**: `title`, `isLoading`, `error`, `className`

### 2. RecentActivityWidget  
- **Purpose**: Shows recent SOP execution activity and updates
- **Features**: Activity timeline, user actions, status badges, timestamps
- **Real-time**: Updates every 15 seconds
- **Props**: `limit`, `onActivityClick`, `onViewAllClick`

### 3. ComplianceStatusWidget
- **Purpose**: Displays compliance metrics and audit status
- **Features**: Compliance scoring, trend indicators, issue tracking
- **Real-time**: Updates every minute
- **Props**: Standard dashboard widget props

### 4. QuickActionsWidget
- **Purpose**: Provides quick access to common SOP operations
- **Features**: Create SOP, browse library, execute templates, view reports
- **Props**: Action callbacks, custom actions support
- **Extensible**: Supports custom action definitions

### 5. PerformanceMetricsWidget
- **Purpose**: Shows performance trends and execution metrics
- **Features**: Time period selection, success rates, execution times
- **Interactive**: Period selector (24h, 7d, 30d, 90d)
- **Props**: `onViewDetailedReport` callback

## Usage

### Basic Usage
```tsx
import { SopDashboard } from '@/app/modules/sop/components/sop-dashboard';

function MyDashboard() {
  return (
    <SopDashboard 
      onCreateSOP={() => navigate('/sop/create')}
      onBrowseLibrary={() => navigate('/sop/library')}
      onViewReports={() => navigate('/sop/reports')}
    />
  );
}
```

### Individual Widget Usage
```tsx
import { 
  SopOverviewWidget,
  RecentActivityWidget,
  ComplianceStatusWidget 
} from '@/app/modules/sop/components/sop-dashboard';

function CustomDashboard() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SopOverviewWidget title="Overview" />
      <RecentActivityWidget 
        title="Activity" 
        limit={5}
        onActivityClick={(id) => handleActivityClick(id)}
      />
      <ComplianceStatusWidget title="Compliance" />
    </div>
  );
}
```

## API Integration

### SOP API Endpoints
- `GET /v1/sop/stats` - SOP statistics and metrics
- `GET /v1/sop/activity` - Recent activity feed  
- `GET /v1/sop/compliance` - Compliance metrics
- `GET /v1/sop/performance` - Performance data
- `GET /v1/sop/projects` - SOP projects list
- `GET /v1/sop/executions` - SOP executions list
- `GET /v1/sop/templates` - SOP templates list

### Hooks Available
- `useSopStats()` - SOP statistics
- `useSopActivity(limit)` - Recent activity
- `useSopCompliance()` - Compliance metrics
- `useSopPerformance(period)` - Performance data
- `useSopProjects(params)` - Project data
- `useSopExecutions(params)` - Execution data  
- `useSopTemplates(params)` - Template data
- `useTerminology()` - Translation system

## Features

### Real-time Updates
- Statistics: 30 second refresh
- Activity: 15 second refresh  
- Compliance: 60 second refresh
- Performance: 60 second refresh

### Error Handling
- Loading states with skeletons
- Error boundaries with user-friendly messages
- Retry mechanisms for failed API calls
- Graceful degradation when data unavailable

### Responsive Design
- Mobile-first approach
- Grid layouts adapt to screen size
- Touch-friendly interactions
- Proper spacing and typography

### Terminology Translation
- Integrated with terminology system (B2.1)
- Replaces Activepieces terms with SOP terms
- Configurable translation mappings
- Fallback to original terms when not mapped

## Styling

### Theming
- Uses existing Activepieces UI components
- Consistent with design system
- Supports light/dark themes
- SOP-specific color coding

### Status Indicators
- **Success**: Green (>95% compliance/success)
- **Warning**: Yellow (85-95% range)
- **Error**: Red (<85% or critical issues)
- **Default**: Blue/gray for neutral states

## Integration Points

### Dependencies
- `@tanstack/react-query` for data fetching
- `@/components/ui/*` for base components
- `@/lib/api` for API communication
- `lucide-react` for icons
- `class-variance-authority` for styling

### External Systems
- Connects to SOP backend APIs (B1.2/B1.3)
- Uses terminology translation (B2.1)  
- Integrates with navigation system (B2.3)
- Supports export functionality (B3.x)

## Performance

### Optimization
- React Query caching
- Skeleton loading states
- Lazy loading for large datasets
- Debounced user interactions

### Bundle Size
- Tree-shakable exports
- Individual component imports
- Shared utility functions
- Optimized icon usage

## Testing

### Component Testing
- Unit tests for each widget
- Integration tests for data flow
- Error state testing
- Loading state validation

### API Testing  
- Mock API responses
- Error scenario coverage
- Real-time update testing
- Cache invalidation testing

## Accessibility

### ARIA Support
- Proper semantic markup
- Screen reader compatibility
- Keyboard navigation
- Focus management

### Color Contrast
- WCAG AA compliance
- High contrast mode support
- Color-blind friendly palettes
- Alternative text for charts

## Browser Support

### Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2018+ features
- CSS Grid and Flexbox
- WebSocket support for real-time updates