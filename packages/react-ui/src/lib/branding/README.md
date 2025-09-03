# SOP Branding System

**Phase 2 GROUP E - Agent 2 of 2: Complete Branding Service Implementation**

A comprehensive branding management system for the Activepieces SOP customization tool. This system provides centralized branding control, runtime brand switching, asset management, and complete React integration.

## 🚀 Features

### Core Features
- **Multi-Brand Support**: Manage Activepieces, SOP, and custom brand configurations
- **Runtime Brand Switching**: Dynamic brand changes without page reload
- **Asset Management**: Centralized logo, icon, and image handling
- **Color System Integration**: Complete color scheme management with light/dark modes
- **Typography Control**: Font family, size, weight, and spacing management
- **Theme System Integration**: Seamless integration with existing theme system

### Advanced Features
- **Real-time Preview**: Live brand changes during configuration
- **Brand Validation**: Comprehensive brand configuration validation
- **Export/Import**: Brand configuration export and import functionality
- **Performance Optimized**: Asset preloading and caching
- **TypeScript Support**: Complete type definitions and IntelliSense
- **Development Tools**: Debug utilities and system introspection

## 📁 File Structure

```
src/lib/branding/
├── branding-service.ts          # Core branding service and management
├── index.ts                     # Main export file and utilities
└── README.md                    # This documentation

src/hooks/
└── use-branding.ts              # React hooks for branding integration

src/components/branding/
├── branding-provider.tsx        # React context provider
├── brand-switcher.tsx           # Brand switching UI components
├── brand-control-panel.tsx      # Advanced brand management UI
└── branding-demo.tsx            # Comprehensive feature demonstration

src/types/
└── branding.d.ts                # TypeScript definitions
```

## 🛠 Core Components

### 1. BrandingService
The main branding service class that handles all branding operations:

```typescript
import { brandingService, BrandConfiguration } from '@/lib/branding';

// Get active brand
const activeBrand = brandingService.getActiveBrand();

// Switch brands
await brandingService.switchBrand('sop');

// Register custom brand
brandingService.registerCustomBrand(customBrandConfig);
```

### 2. React Integration
Complete React hooks and components for branding:

```jsx
import { 
  BrandingProvider, 
  useBranding, 
  BrandSwitcher, 
  BrandLogo 
} from '@/lib/branding';

function App() {
  return (
    <BrandingProvider>
      <BrandLogo variant="main" />
      <BrandSwitcher showPreview={true} />
    </BrandingProvider>
  );
}
```

### 3. Brand Configuration
Comprehensive brand configuration interface:

```typescript
interface BrandConfiguration {
  id: string;
  name: string;
  displayName: string;
  appTitle: string;
  companyName: string;
  assets: BrandAssets;
  colors: BrandColors;
  typography: BrandTypography;
  themeIntegration: BrandThemeIntegration;
  // ... more configuration options
}
```

## 🎨 Available Brands

### Built-in Brands

#### Activepieces Brand
- **ID**: `activepieces`
- **Colors**: Purple primary colors with gray accents
- **Assets**: Default Activepieces logos and icons
- **Theme**: Supports both light and dark modes
- **Customizable**: No

#### SOP Professional Brand
- **ID**: `sop`
- **Colors**: Blue primary colors with professional styling
- **Assets**: SOP-specific logos and step icons
- **Theme**: Optimized for light mode, supports dark
- **Customizable**: Yes

### Custom Brands
The system supports unlimited custom brands with:
- Full color customization
- Custom asset integration
- Typography configuration
- Theme integration
- Export/import functionality

## 📊 Usage Examples

### Basic Brand Switching

```jsx
import { useBrandSwitcher } from '@/lib/branding';

function BrandSelector() {
  const { availableBrands, switchBrand, activeBrand } = useBrandSwitcher();
  
  return (
    <select 
      value={activeBrand.id}
      onChange={(e) => switchBrand(e.target.value)}
    >
      {availableBrands.map(brand => (
        <option key={brand.id} value={brand.id}>
          {brand.displayName}
        </option>
      ))}
    </select>
  );
}
```

### Asset Usage

```jsx
import { useBrandAssets, BrandLogo } from '@/lib/branding';

function Header() {
  const { assets } = useBrandAssets();
  
  return (
    <header>
      <BrandLogo variant="main" className="h-8" />
      <img src={assets.logo.icon} alt="Icon" className="w-6 h-6" />
    </header>
  );
}
```

### Color Integration

```jsx
import { useBrandColors } from '@/lib/branding';

function StyledButton() {
  const { getColor } = useBrandColors();
  
  const buttonStyle = {
    backgroundColor: getColor('primary.600'),
    color: getColor('text.inverse'),
    border: `1px solid ${getColor('primary.700')}`,
  };
  
  return <button style={buttonStyle}>Branded Button</button>;
}
```

### Typography Integration

```jsx
import { useBrandTypography } from '@/lib/branding';

function BrandedText() {
  const { getFontFamily, getFontSize, getFontWeight } = useBrandTypography();
  
  const headingStyle = {
    fontFamily: getFontFamily('primary'),
    fontSize: getFontSize('2xl'),
    fontWeight: getFontWeight('bold'),
  };
  
  return <h1 style={headingStyle}>Branded Heading</h1>;
}
```

## 🔧 Advanced Configuration

### Custom Brand Creation

```typescript
import { BrandConfiguration, brandingService } from '@/lib/branding';

const customBrand: BrandConfiguration = {
  id: 'my-custom-brand',
  name: 'my-custom-brand',
  displayName: 'My Custom Brand',
  appTitle: 'Custom SOP Tool',
  companyName: 'My Company',
  
  assets: {
    logo: {
      main: '/assets/custom-logo.svg',
      icon: '/assets/custom-icon.svg',
      iconSmall: '/assets/custom-icon-small.svg',
    },
    images: {},
    icons: {},
  },
  
  colors: {
    // Custom color configuration
    light: { /* light mode colors */ },
    dark: { /* dark mode colors */ },
  },
  
  typography: {
    fontFamily: {
      primary: 'Custom Font, sans-serif',
      monospace: 'Custom Mono, monospace',
    },
    // ... more typography config
  },
  
  // ... more configuration
};

// Register the custom brand
await brandingService.registerCustomBrand(customBrand);
```

### Brand Export/Import

```typescript
import { brandingService } from '@/lib/branding';

// Export brand configuration
const exportedBrand = brandingService.exportBrandConfig('sop');
const blob = new Blob([JSON.stringify(exportedBrand, null, 2)], { 
  type: 'application/json' 
});

// Import brand configuration
const importedConfig = JSON.parse(configJson);
await brandingService.importBrandConfig(importedConfig);
```

## 🎛 Control Panel

The `BrandControlPanel` component provides a comprehensive UI for brand management:

```jsx
import { BrandControlPanel } from '@/lib/branding';

function AdminPage() {
  return (
    <BrandControlPanel
      brandId="sop"
      onBrandUpdate={(brand) => {
        console.log('Brand updated:', brand.displayName);
      }}
    />
  );
}
```

Features:
- **Basic Information**: Name, title, description editing
- **Color Management**: Complete color scheme editor
- **Typography Control**: Font family, size, weight configuration
- **Asset Management**: Logo and image URL management
- **Export/Import**: Brand configuration backup and restore
- **Live Preview**: Real-time preview of changes

## 🔍 Development & Debugging

### Debug Utilities

```typescript
import { BrandingDebug } from '@/lib/branding';

// Log system information
BrandingDebug.logSystemInfo();

// Test brand switching
await BrandingDebug.testBrandSwitching();

// Generate CSS variables
const cssVars = BrandingDebug.generateCSSVariables();
```

### Global Access (Development)
In development mode, the branding system is available globally:

```javascript
// Available in browser console
window.__BRANDING_SYSTEM__.service    // BrandingService instance
window.__BRANDING_SYSTEM__.utils     // Utility functions
window.__BRANDING_SYSTEM__.debug     // Debug utilities
```

## 🎨 Integration with Theme System

The branding system integrates seamlessly with the existing theme system:

- **Automatic Theme Switching**: Brand switches trigger theme updates
- **Color Synchronization**: Brand colors are applied as CSS custom properties
- **Theme Mode Support**: Respects light/dark mode preferences
- **Component Integration**: Works with existing themed components

## 📱 Responsive & Accessibility

- **Mobile Optimized**: All components work on mobile devices
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **High Contrast**: Respects user accessibility preferences

## 🚀 Performance

- **Asset Preloading**: Intelligent asset preloading and caching
- **Lazy Loading**: Components load assets on demand
- **Memory Management**: Efficient memory usage and cleanup
- **Bundle Size**: Optimized for minimal impact on bundle size

## 🧪 Testing

The branding system includes comprehensive testing utilities:

```typescript
// Test brand configuration
const validationResult = BrandingUtils.validateBrandConfig(brandConfig);

// Test asset loading
await assetManager.preloadAssets(assetUrls);

// Test brand switching
await BrandingDebug.testBrandSwitching();
```

## 📋 Implementation Checklist

### ✅ Completed Features

- [x] **Core Branding Service**: Complete brand management system
- [x] **React Integration**: Hooks, providers, and components
- [x] **Brand Switching**: Runtime brand switching with theme integration
- [x] **Asset Management**: Logo, icon, and image handling
- [x] **Color System**: Complete color management with light/dark modes
- [x] **Typography Control**: Font configuration and application
- [x] **Control Panel**: Advanced brand management UI
- [x] **Export/Import**: Brand configuration backup and restore
- [x] **TypeScript Support**: Complete type definitions
- [x] **Performance Optimization**: Asset preloading and caching
- [x] **Development Tools**: Debug utilities and system introspection

### 🎯 Integration Status

- [x] **Theme System**: Integrated with existing theme provider
- [x] **Asset System**: Extended SOP asset management
- [x] **Component Library**: Compatible with UI components
- [x] **Storage System**: Persistent brand preferences
- [x] **Event System**: Brand change notifications

### 📊 System Capabilities

1. **Multi-Brand Management**: ✅ Support for unlimited brands
2. **Runtime Switching**: ✅ Dynamic brand changes without reload
3. **Asset Pipeline**: ✅ Centralized asset management and loading
4. **Color Theming**: ✅ Complete color system with CSS variables
5. **Typography System**: ✅ Font management and application
6. **Validation**: ✅ Brand configuration validation and error handling
7. **Persistence**: ✅ Local storage of brand preferences
8. **Performance**: ✅ Optimized asset loading and caching
9. **Accessibility**: ✅ Full accessibility support
10. **Development**: ✅ Debug tools and system introspection

## 🔄 Migration & Compatibility

The branding system is designed to be:
- **Backward Compatible**: Works with existing components
- **Non-Breaking**: Doesn't affect existing functionality
- **Optional**: Can be gradually adopted
- **Extensible**: Easy to add new features and brands

## 📖 API Reference

### Core Classes
- `BrandingService`: Main service class
- `BrandingUtils`: Utility functions
- `BrandingDebug`: Development and debugging tools

### React Hooks
- `useBranding()`: Basic branding state and actions
- `useBrandSwitcher()`: Brand switching functionality
- `useBrandAssets()`: Asset management and preloading
- `useBrandColors()`: Color system access
- `useBrandTypography()`: Typography configuration
- `useFullBranding()`: Complete branding functionality

### Components
- `BrandingProvider`: Context provider
- `BrandSwitcher`: Brand selection interface
- `BrandControlPanel`: Advanced management interface
- `BrandLogo`: Brand logo display
- `BrandTitle`: Brand title display
- `BrandConditional`: Conditional brand rendering

---

**Phase 2 GROUP E Complete**: The SOP Branding Service provides comprehensive branding management with runtime switching, asset management, and complete React integration. The system is production-ready and provides all requested features for centralized branding control.