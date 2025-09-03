# SOP Navigation Components

A comprehensive navigation system designed specifically for Standard Operating Procedure (SOP) management, built on top of the existing Activepieces navigation patterns with integrated theme and terminology services.

## Overview

This navigation system provides SOP-optimized navigation components that seamlessly integrate with:
- **Theme System**: Uses existing theme provider with CSS variables
- **Terminology Service**: Automatically maps Activepieces terms to SOP-specific language
- **Layout Components**: Works with existing Activepieces layout patterns
- **State Management**: Provides navigation context and routing state

## Components

### 1. SOPNavigation
Main navigation component with SOP-specific menu items.

```tsx
import { SOPNavigation } from '@/frontend/navigation';

<SOPNavigation
  items={[
    {
      id: 'processes',
      label: 'Workflows',
      sopLabel: 'Standard Operating Procedures',
      icon: <Workflow className="h-4 w-4" />,
      path: '/processes'
    }
  ]}
  onNavigate={(path) => console.log('Navigating to:', path)}
/>
```

### 2. ProcessNavigation
Specialized navigation for process/workflow management with contextual actions.

```tsx
import { ProcessNavigation } from '@/frontend/navigation';

<ProcessNavigation
  processId="123"
  processName="Customer Onboarding SOP"
  processStatus="active"
  onActionClick={(action) => console.log('Action:', action)}
  showBreadcrumbs={true}
/>
```

### 3. SOPBreadcrumbs
Breadcrumb navigation with automatic SOP terminology mapping.

```tsx
import { SOPBreadcrumbs } from '@/frontend/navigation';

<SOPBreadcrumbs
  showHome={true}
  maxItems={5}
  onItemClick={(path) => navigate(path)}
/>
```

### 4. QuickActions
Navigation quick actions for common SOP tasks.

```tsx
import { QuickActions, DashboardQuickActions } from '@/frontend/navigation';

<QuickActions
  actions={[
    {
      id: 'create-sop',
      label: 'Create Flow',
      sopLabel: 'Create New SOP',
      icon: <Plus className="h-4 w-4" />,
      onClick: () => createNewSOP(),
      variant: 'primary',
      shortcut: 'Ctrl+N'
    }
  ]}
  showLabels={true}
  showShortcuts={true}
/>
```

### 5. NavigationProvider
Context provider for navigation state management.

```tsx
import { NavigationProvider, useNavigation } from '@/frontend/navigation';

function App() {
  return (
    <NavigationProvider
      enableShortcuts={true}
      enableBreadcrumbs={true}
      enableAnalytics={true}
    >
      <YourAppContent />
    </NavigationProvider>
  );
}

function YourComponent() {
  const { navigateToProcess, setLoading } = useNavigation();
  
  return (
    <button onClick={() => navigateToProcess('123', 'overview')}>
      View SOP
    </button>
  );
}
```

## Integration with Existing Systems

### Theme Integration
The navigation components automatically use the existing theme system:

```tsx
// Automatically uses theme CSS variables
// --primary, --primary-100, --primary-300, etc.
// Responds to dark/light theme changes
```

### Terminology Service Integration
Components automatically map Activepieces terms to SOP terminology:

```tsx
// Automatic mapping:
// "Flows" → "Standard Operating Procedures"
// "Runs" → "Process Executions" 
// "Issues" → "Process Approvals"
// "Team Members" → "Process Stakeholders"
```

### Layout Components Integration
Works seamlessly with existing layout components:

```tsx
import { ProcessFlowLayout } from '@/frontend/layout';
import { SOPNavigation } from '@/frontend/navigation';

<ProcessFlowLayout>
  <SOPNavigation />
  {/* Your content */}
</ProcessFlowLayout>
```

## Navigation Hooks

### useNavigation
Main navigation hook with full navigation control:

```tsx
const {
  navigateTo,
  goBack,
  goForward,
  setCurrentProcess,
  isCurrentPath,
  registerShortcut
} = useNavigation();
```

### useProcessNavigation
Process-specific navigation hook:

```tsx
const {
  navigateToOverview,
  navigateToExecutions,
  navigateToTeam,
  navigateToSettings
} = useProcessNavigation(processId);
```

### useBreadcrumbs
Breadcrumb management hook:

```tsx
const { breadcrumbs, setBreadcrumbs } = useBreadcrumbs([
  { label: 'Dashboard', sopLabel: 'SOP Dashboard', path: '/' },
  { label: 'Processes', sopLabel: 'SOPs', path: '/processes' }
]);
```

## Utilities

### navigationUtils
Helper functions for common navigation tasks:

```tsx
import { navigationUtils } from '@/frontend/navigation';

// Generate SOP-specific paths
const sopPath = navigationUtils.getSOPPath('123', 'overview');
// → '/processes/123/overview'

// Convert terminology
const sopTerm = navigationUtils.toSOPTerminology('workflow');
// → 'SOP Process'

// Generate breadcrumbs
const breadcrumbs = navigationUtils.generateSOPBreadcrumbs('/processes/123/executions');
```

## Keyboard Shortcuts

The navigation system includes built-in keyboard shortcuts:

- `Ctrl+N` - Create new SOP
- `Ctrl+Shift+D` - Go to dashboard  
- `Ctrl+Shift+S` - Go to settings
- `Alt+Left` - Navigate back
- `Alt+Right` - Navigate forward
- `Ctrl+K` - Open search
- `Ctrl+/` - Show help

Custom shortcuts can be registered:

```tsx
const { registerShortcut } = useNavigation();

useEffect(() => {
  registerShortcut('ctrl+shift+p', () => {
    navigateToProcess(currentProcessId);
  });
}, []);
```

## Responsive Design

All navigation components are fully responsive:

- **Mobile**: Collapsible navigation with touch-friendly interactions
- **Tablet**: Adaptive layout with contextual actions
- **Desktop**: Full navigation with keyboard shortcuts and quick actions

## Accessibility

Components follow accessibility best practices:

- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- High contrast theme support
- Focus management

## Customization

### Theme Customization
Components use CSS variables that can be customized:

```css
:root {
  --navigation-bg: hsl(var(--background));
  --navigation-text: hsl(var(--foreground));
  --navigation-hover: hsl(var(--accent));
  --navigation-active: hsl(var(--primary));
}
```

### Custom Navigation Items
Create custom navigation items:

```tsx
const customItems: SOPNavigationItem[] = [
  {
    id: 'custom',
    label: 'Custom Section',
    sopLabel: 'My Custom SOP Section',
    icon: <CustomIcon />,
    path: '/custom',
    children: [
      {
        id: 'custom-sub',
        label: 'Sub Section',
        icon: <SubIcon />,
        path: '/custom/sub'
      }
    ]
  }
];
```

## Performance

The navigation system is optimized for performance:

- **Lazy Loading**: Components load on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large navigation lists
- **Route Prefetching**: Preload common routes
- **Cache Management**: Intelligent caching of navigation state

## Testing

Components include comprehensive test coverage:

```tsx
import { render, screen } from '@testing-library/react';
import { SOPNavigation } from '@/frontend/navigation';

test('renders SOP navigation with proper terminology', () => {
  render(<SOPNavigation />);
  expect(screen.getByText('Standard Operating Procedures')).toBeInTheDocument();
});
```

## Migration Guide

### From Existing Activepieces Navigation

1. **Replace imports**:
   ```tsx
   // Before
   import { Sidebar } from '@/components/sidebar';
   
   // After  
   import { SOPNavigation } from '@/frontend/navigation';
   ```

2. **Update navigation items**:
   ```tsx
   // Before
   { label: 'Flows', path: '/flows' }
   
   // After
   { label: 'Flows', sopLabel: 'Standard Operating Procedures', path: '/processes' }
   ```

3. **Wrap with NavigationProvider**:
   ```tsx
   <NavigationProvider>
     <YourApp />
   </NavigationProvider>
   ```

## Best Practices

1. **Use SOP terminology** consistently across all navigation
2. **Provide keyboard shortcuts** for power users
3. **Show contextual actions** based on current process state
4. **Implement proper loading states** during navigation
5. **Use breadcrumbs** for deep navigation hierarchies
6. **Group related actions** in quick action menus
7. **Respect user permissions** when showing navigation items

## API Reference

For complete API documentation, see the TypeScript type definitions in `types.ts`.

## Contributing

When contributing to navigation components:

1. Follow existing patterns and conventions
2. Include TypeScript types for all props
3. Add comprehensive tests
4. Update documentation
5. Consider accessibility implications
6. Test with multiple themes
7. Validate SOP terminology mappings