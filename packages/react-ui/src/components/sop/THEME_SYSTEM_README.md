# SOP Theme System Documentation

## Overview

The SOP Theme System provides a comprehensive theming solution for the Activepieces application, allowing dynamic switching between default Activepieces branding and custom SOP (Standard Operating Procedure) professional branding. This system supports light/dark modes, custom color palettes, and seamless integration with existing React components.

## Architecture

### Core Components

1. **Theme Configuration** (`/lib/theme-config.ts`)
   - Centralized theme definitions
   - Type-safe color configurations  
   - Theme utility functions

2. **Theme Providers** (`/components/sop/sop-theme-provider.tsx`)
   - Context management for theme state
   - CSS variable application
   - Theme persistence

3. **Theme Hooks** (`/hooks/use-theme-manager.ts`)
   - Unified theme management interface
   - Runtime theme switching
   - Component styling helpers

4. **Theme Components**
   - `EnhancedThemeSwitcher` - Advanced theme switching UI
   - `SOPThemeSwitcher` - Basic SOP branding toggle
   - `ComprehensiveThemeDemo` - Complete theme showcase

## Quick Start

### 1. Basic Integration

```tsx
import { SOPThemeProvider, useSOPTheme } from '@/components/sop';

// Wrap your app with the theme provider
function App() {
  return (
    <SOPThemeProvider enableSOPBranding={false}>
      <YourAppContent />
    </SOPThemeProvider>
  );
}

// Use theme state in components
function MyComponent() {
  const { isSOPBranded, toggleSOPBranding } = useSOPTheme();
  
  return (
    <button onClick={toggleSOPBranding}>
      {isSOPBranded ? 'Disable' : 'Enable'} SOP Branding
    </button>
  );
}
```

### 2. Enhanced Theme Management

```tsx
import { useThemeManager } from '@/hooks/use-theme-manager';

function ThemeAwareComponent() {
  const {
    currentTheme,
    setTheme,
    setMode,
    isCustomBranded,
    getThemeColor
  } = useThemeManager();

  return (
    <div style={{ 
      backgroundColor: getThemeColor('ui.panel.background'),
      color: getThemeColor('text.primary') 
    }}>
      <h1>Current Theme: {currentTheme.name}</h1>
      <button onClick={() => setTheme('sop')}>
        Switch to SOP Theme
      </button>
    </div>
  );
}
```

### 3. Theme-Aware Styling

```tsx
import { useThemeStyles } from '@/hooks/use-theme-manager';

function StyledComponent() {
  const styles = useThemeStyles();
  
  return (
    <div>
      <button style={styles.getComponentStyles('button')}>
        Themed Button
      </button>
      <div style={styles.getComponentStyles('panel')}>
        Themed Panel
      </div>
    </div>
  );
}
```

## Available Themes

### Default Activepieces Theme
- **ID**: `activepieces`
- **Colors**: Purple-based palette (#8b3cff primary)
- **Use Case**: Default branding for Activepieces platform

### SOP Professional Theme  
- **ID**: `sop`
- **Colors**: Blue-based palette (#2563eb primary)
- **Use Case**: Professional SOP workflows and documentation

## Theme Configuration

### Color Structure

```typescript
interface ThemeColors {
  primary: {
    50: string;   // Lightest shade
    100: string;
    // ... gradual progression
    900: string;  // Darkest shade
  };
  accent: {
    // Same structure as primary
  };
  steps: {
    primary: string;      // Process steps
    human: string;        // Human intervention steps  
    compliance: string;   // Compliance checkpoints
    integration: string;  // System integrations
    conditional: string;  // Conditional logic
  };
  ui: {
    sidebar: { background: string; border: string; };
    canvas: { background: string; grid: string; };
    panel: { background: string; border: string; };
  };
  text: {
    primary: string;    // Main text
    secondary: string;  // Secondary text
    disabled: string;   // Disabled text
    inverse: string;    // Text on colored backgrounds
  };
}
```

### Creating Custom Themes

```typescript
import { ThemeConfig } from '@/lib/theme-config';

const customTheme: ThemeConfig = {
  id: 'custom',
  name: 'Custom Theme',
  description: 'My custom theme',
  light: {
    primary: {
      50: '#f0f9ff',
      // ... define all color shades
      900: '#0c4a6e',
    },
    // ... define all other color categories
  },
  dark: {
    // Dark mode variant
  }
};

// Register the theme
availableThemes.custom = customTheme;
```

## CSS Variables

The theme system automatically applies CSS custom properties:

```css
/* Primary colors */
--theme-primary-50 through --theme-primary-900
--primary /* Maps to primary-600 */

/* Accent colors */  
--theme-accent-50 through --theme-accent-900

/* Step colors */
--theme-step-primary
--theme-step-human
--theme-step-compliance
--theme-step-integration
--theme-step-conditional

/* UI colors */
--theme-sidebar-bg
--theme-canvas-bg
--theme-panel-bg

/* Text colors */
--theme-text-primary
--theme-text-secondary
--theme-text-disabled
--theme-text-inverse
```

### SOP-Specific Variables

When SOP branding is enabled:

```css
/* SOP brand colors */
--sop-primary-50 through --sop-primary-900
--sop-accent-50 through --sop-accent-900

/* SOP step colors */
--sop-step-primary: #2563eb;
--sop-step-human: #f59e0b;
--sop-step-compliance: #10b981;
--sop-step-integration: #8b5cf6;
--sop-step-conditional: #ef4444;

/* SOP UI colors */
--sop-sidebar-bg
--sop-canvas-bg  
--sop-panel-bg
```

## Component Integration

### Theme-Aware Components

Components can adapt to theme changes using CSS classes or JavaScript:

```tsx
// CSS-based theming
function ThemedComponent() {
  const { getSOPClass } = useSOPStyles();
  
  return (
    <div className={getSOPClass(
      'default-styles',
      'sop-branded-styles'
    )}>
      Content
    </div>
  );
}

// JavaScript-based theming
function DynamicComponent() {
  const { getComponentStyles } = useThemeStyles();
  
  return (
    <div style={getComponentStyles('panel')}>
      Dynamic themed panel
    </div>
  );
}
```

### CSS Classes

The theme system applies these classes to `document.documentElement`:

- `theme-activepieces` or `theme-sop` - Current theme ID
- `light` or `dark` - Current mode  
- `sop-branded` - When SOP branding is active
- `sop-light` or `sop-dark` - SOP-specific mode classes

## Advanced Features

### Mode Detection

The system supports three modes:

- `light` - Always light theme
- `dark` - Always dark theme  
- `auto` - Follow system preference

```tsx
const { effectiveMode } = useThemeManager();
// effectiveMode is always 'light' or 'dark'
```

### Theme Persistence

Themes are automatically saved to localStorage:

- `activepieces-theme-id` - Selected theme ID
- `activepieces-theme-mode` - Selected mode
- `activepieces-custom-branding` - Branding toggle state

### System Theme Integration

The theme system integrates with existing Activepieces theme providers and automatically syncs with system-level theme changes.

## Testing

### Integration Testing

Use the `ThemeIntegrationTest` component to verify theme functionality:

```tsx
import { ThemeIntegrationTest } from '@/components/sop';

function TestPage() {
  return <ThemeIntegrationTest />;
}
```

### Manual Testing

1. **Theme Switching**: Verify themes switch correctly
2. **Mode Changes**: Test light/dark/auto modes
3. **CSS Variables**: Check variables update in DevTools
4. **Persistence**: Refresh page and verify settings persist
5. **Component Integration**: Ensure components update with theme

## Theme Components Reference

### EnhancedThemeSwitcher

Advanced theme switching interface with multiple variants.

```tsx
<EnhancedThemeSwitcher 
  variant="card"        // 'compact' | 'card' | 'dropdown'
  showAdvanced={true}   // Show advanced options
  showPreview={true}    // Show color preview
  className="custom"    // Additional CSS classes
/>
```

### SOPThemeSwitcher  

Basic SOP branding toggle component.

```tsx
<SOPThemeSwitcher 
  variant="compact"           // 'button' | 'compact'
  showBrandingToggle={true}   // Show branding toggle
/>
```

### ComprehensiveThemeDemo

Complete theme system demonstration with all features.

```tsx
<ComprehensiveThemeDemo />
```

## Best Practices

### 1. Use Semantic Color Names

```tsx
// Good
const primaryColor = getThemeColor('primary.600');
const textColor = getThemeColor('text.primary');

// Avoid  
const blueColor = '#2563eb';
```

### 2. Provide Theme Fallbacks

```tsx
const backgroundColor = getThemeColor('ui.panel.background') || '#ffffff';
```

### 3. Test Both Light and Dark Modes

Always verify components work in both light and dark themes.

### 4. Use CSS Variables When Possible

CSS-based theming is more performant than JavaScript-based styling:

```css
.my-component {
  background: var(--theme-panel-bg);
  color: var(--theme-text-primary);
}
```

### 5. Follow Theme Naming Conventions

- Use descriptive names for theme IDs
- Include both light and dark variants
- Document custom theme configurations

## Troubleshooting

### Common Issues

1. **Theme not applying**: Check if component is wrapped in theme provider
2. **CSS variables not updating**: Verify theme provider is properly configured
3. **Persistence not working**: Check localStorage permissions
4. **Dark mode not switching**: Ensure system theme detection is working

### Debug Tools

Use browser DevTools to inspect:
- CSS custom properties on `:root`
- Document element classes
- localStorage values for theme settings

## Migration Guide

### From Basic Theme Toggle

Replace basic theme toggles with the enhanced system:

```tsx
// Before
const { theme, setTheme } = useTheme();

// After  
const { currentTheme, setTheme, setMode } = useThemeManager();
```

### Adding SOP Support

Integrate SOP theming into existing components:

```tsx
// Before
<div className="bg-primary text-primary-foreground">

// After
<div className={useThemeClasses().getComponentClass('button', 'sop-button')}>
```

## Contributing

When adding new theme features:

1. Update type definitions in `/types/theme-system.d.ts`
2. Add tests for new functionality
3. Update this documentation
4. Follow existing naming conventions
5. Ensure backward compatibility

## Performance Considerations

- CSS-based theming is preferred over inline styles
- Theme changes trigger minimal re-renders
- Color calculations are memoized
- Theme persistence uses efficient localStorage operations

---

For additional help or feature requests, please refer to the component source code or create an issue in the project repository.