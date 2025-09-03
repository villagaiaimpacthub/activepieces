# SOP Asset Pipeline

This directory contains SOP-specific assets and branding for the Activepieces SOP Tool customization.

## Directory Structure

```
src/assets/
├── img/sop/
│   ├── logos/
│   │   ├── sop-logo.svg      # Main SOP Designer logo (120x40)
│   │   └── sop-icon.svg      # SOP icon for favicon/toolbar (32x32)
│   └── icons/
│       ├── process-step.svg      # Generic process step icon
│       ├── human-task.svg        # Human task step icon
│       ├── compliance-check.svg  # Compliance verification icon
│       └── integration.svg       # System integration icon
├── templates/
│   └── sop-export-template.css   # CSS for SOP document export
├── sop-manifest.json              # Asset configuration manifest
└── SOP_ASSET_README.md           # This file
```

## Asset Types

### Logos
- **sop-logo.svg**: Main branding logo for navigation bar and headers
- **sop-icon.svg**: Square icon for favicons and compact spaces

### Process Step Icons
- **process-step.svg**: Generic automated process step (blue)
- **human-task.svg**: Manual/human intervention step (amber)
- **compliance-check.svg**: Compliance verification step (green)
- **integration.svg**: System integration step (purple)

### Templates
- **sop-export-template.css**: Styling for exported SOP documents

## Integration

### Asset Loading

```typescript
import { sopAssets } from '@sop/lib/sop-assets';

// Access logo URLs
const logoUrl = sopAssets.logos.main;
const iconUrl = sopAssets.logos.icon;

// Access step icons
const processIcon = sopAssets.icons.processStep;
const humanIcon = sopAssets.icons.humanTask;
```

### React Hooks

```tsx
import { useSopAssets, SopLogo, SopIcon } from '@sop/lib/use-sop-assets';

function MyComponent() {
  const { assetsLoaded, logos, icons } = useSopAssets();
  
  if (!assetsLoaded) return <div>Loading assets...</div>;
  
  return (
    <div>
      <SopLogo variant="main" />
      <SopIcon iconType="processStep" size={24} />
    </div>
  );
}
```

### Theme Integration

```tsx
import { useSopTheme, SopThemeToggle } from '@sop/lib/use-sop-assets';

function ThemeComponent() {
  const { currentTheme, setTheme, isDark } = useSopTheme();
  
  return (
    <div>
      <p>Current theme: {currentTheme}</p>
      <SopThemeToggle showLabel />
    </div>
  );
}
```

## Vite Aliases

The following aliases are configured in `vite.config.ts`:

- `@sop/assets` → `./src/assets`
- `@sop/icons` → `./src/assets/img/sop/icons`
- `@sop/logos` → `./src/assets/img/sop/logos`
- `@sop/themes` → `./src/styles`
- `@sop/lib` → `./src/lib`

## Styling Integration

SOP theme styles are automatically imported in `src/styles.css`:

```css
@import './styles/sop-theme.css';
```

CSS custom properties available:

```css
:root {
  --sop-primary-600: #2563eb;
  --sop-step-primary: #2563eb;
  --sop-step-human: #f59e0b;
  --sop-step-compliance: #10b981;
  --sop-step-integration: #8b5cf6;
  /* ... more variables */
}
```

## Asset Management

### Preloading Assets

```typescript
import { sopAssets } from '@sop/lib/sop-assets';

// Preload all assets for performance
await sopAssets.loader.preloadAssets();
```

### Asset Validation

```typescript
import { useSopAssetValidator } from '@sop/lib/use-sop-assets';

function AssetDebugger() {
  const { validateAssets, generateReport } = useSopAssetValidator();
  
  const checkAssets = async () => {
    const result = await validateAssets();
    console.log('Asset validation:', result);
    
    const report = await generateReport();
    console.log('Asset report:', report);
  };
  
  return <button onClick={checkAssets}>Validate Assets</button>;
}
```

## Development

In development mode, SOP asset utilities are available on the window object:

```javascript
// Browser console
window.sopAssets // Asset constants and managers
window.useSopAssets // React hooks (in development)
```

## Build Integration

Assets are processed by Vite with the following optimizations:

- SVG optimization enabled
- Small assets inlined (< 4KB)
- CSS minification in production
- Hot module replacement in development

## Customization

### Adding New Assets

1. Add asset files to appropriate subdirectory
2. Update `sop-assets.ts` constants
3. Add entries to `sop-manifest.json`
4. Update TypeScript types in `sop-assets.d.ts`
5. Test with asset validator

### Theme Customization

1. Modify CSS custom properties in `sop-theme.css`
2. Update theme configuration in `sop-assets.ts`
3. Test theme switching functionality

### Export Template Customization

1. Modify `sop-export-template.css`
2. Test with SOP export functionality
3. Validate across different export formats

## Performance Considerations

- Assets are cached by the asset loader
- SVG files are optimized for size
- CSS is tree-shaken in production
- Icons are loaded on demand
- Theme switching is instant (CSS custom properties)

## Browser Support

- Modern browsers with CSS custom properties support
- SVG support required
- ES2020+ JavaScript features
- React 18+ for hooks

## Troubleshooting

### Assets Not Loading

1. Check browser network tab for 404 errors
2. Verify file paths in `sop-assets.ts`
3. Run asset validation: `useSopAssetValidator().validateAssets()`
4. Check Vite alias configuration

### Theme Not Applying

1. Verify CSS import in `styles.css`
2. Check browser dev tools for CSS custom properties
3. Ensure theme manager is initialized
4. Validate theme files are being served

### Build Issues

1. Check Vite configuration for alias paths
2. Verify asset manifest syntax
3. Ensure TypeScript types are valid
4. Check for circular import dependencies

## Future Enhancements

- Dynamic asset loading based on client configuration
- Asset CDN support for production
- Multi-tenant branding system
- Asset versioning and cache busting
- Automated asset optimization pipeline
- Icon font generation from SVGs
- Theme builder UI for clients

## Related Files

- `/src/lib/sop-assets.ts` - Asset configuration and management
- `/src/lib/use-sop-assets.tsx` - React hooks and components
- `/src/types/sop-assets.d.ts` - TypeScript type definitions
- `/src/styles/sop-theme.css` - SOP theme variables and styles
- `/vite.config.ts` - Build configuration and aliases
- `/packages/react-ui/src/styles.css` - Main stylesheet with SOP imports