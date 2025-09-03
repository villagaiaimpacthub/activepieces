# SOP Terminology Service

A comprehensive terminology translation system that dynamically maps Activepieces terminology to SOP-specific language throughout the application.

## Overview

The SOP Terminology Service provides:

- **Dynamic Text Translation**: Automatically converts Activepieces terms to SOP terminology
- **Context-Aware Mapping**: Different translations based on UI context (flow-builder, dashboard, etc.)
- **React Integration**: Hooks and components for seamless React integration
- **i18n Compatibility**: Works alongside react-i18next
- **Performance Optimized**: Caching and efficient translation algorithms
- **Configurable**: Customizable terminology sets and mappings
- **TypeScript Support**: Full type safety and autocomplete

## Quick Start

### 1. Basic Setup

```tsx
import { TerminologyProvider, terminologySetup } from '@/lib/terminology';

// Initialize the service
await terminologySetup.presets.development();

// Wrap your app
function App() {
  return (
    <TerminologyProvider initialSet="sop">
      <YourAppContent />
    </TerminologyProvider>
  );
}
```

### 2. Use in Components

```tsx
import { useTranslation, TerminologyText, TerminologyButton } from '@/lib/terminology';

function MyComponent() {
  const flowName = useTranslation('Create New Flow', 'flow-builder');
  
  return (
    <div>
      <TerminologyText context="flow-builder">Flow Builder</TerminologyText>
      <TerminologyButton context="buttons">Create Action</TerminologyButton>
      <p>{flowName}</p> {/* "Create New Standard Operating Procedure" */}
    </div>
  );
}
```

## Core Terminology Mappings

| Original Term | SOP Term | Context |
|---------------|----------|---------|
| Flow | Standard Operating Procedure | general, flow-builder |
| Action | Task | flow-builder |
| Trigger | Initiator | flow-builder |
| Connection | System Integration | general, settings |
| Piece | Component | flow-builder |
| Run | Execution | general, status |

## API Reference

### Hooks

#### `useTerminology()`
Main hook for accessing the terminology service.

```tsx
const {
  translate,          // (text, context) => translatedText
  translateWithDetails, // Detailed translation info
  config,            // Current configuration
  updateConfig,      // Update configuration
  currentSet,        // Current terminology set
  switchSet,         // Switch terminology set
  isReady,          // Service initialization status
  isLoading,        // Loading state
  error             // Last error
} = useTerminology();
```

#### `useTranslation(text, context, fallback)`
Simple hook for translating a single text value.

```tsx
const translatedText = useTranslation('Flow', 'flow-builder', 'Workflow');
```

### Components

#### `<TerminologyText>`
Text component with automatic translation.

```tsx
<TerminologyText context="flow-builder" className="title">
  Flow Configuration
</TerminologyText>
```

#### `<TerminologyButton>`
Button with translated text.

```tsx
<TerminologyButton context="buttons" onClick={handleCreate}>
  Create Flow
</TerminologyButton>
```

#### `<TerminologyProvider>`
Context provider for the terminology service.

```tsx
<TerminologyProvider initialSet="sop" initialConfig={{ debugMode: true }}>
  <App />
</TerminologyProvider>
```

### Service API

#### `terminologyService.translate(text, context)`
Translate text with the current terminology set.

```tsx
import { terminologyService } from '@/lib/terminology';

const result = terminologyService.translate('Flow', 'flow-builder');
// Returns: "Standard Operating Procedure"
```

#### `terminologyService.translateWithDetails(text, context)`
Get detailed translation information.

```tsx
const result = terminologyService.translateWithDetails('Flow', 'flow-builder');
// Returns: {
//   translated: true,
//   originalText: 'Flow',
//   translatedText: 'Standard Operating Procedure',
//   appliedMappings: [...],
//   context: 'flow-builder',
//   fromCache: false,
//   duration: 1.2
// }
```

## Configuration

### Terminology Sets

- **`default`**: Original Activepieces terminology (no translations)
- **`sop`**: Complete SOP terminology mappings
- **`custom`**: User-defined custom mappings

### Contexts

- `general`: General UI elements
- `flow-builder`: Flow builder interface
- `dashboard`: Dashboard and navigation
- `settings`: Settings and configuration
- `forms`: Form labels and inputs
- `buttons`: Button text
- `status`: Status messages
- `errors`: Error messages

### Example Configuration

```tsx
const config = {
  activeSet: 'sop',
  enabled: true,
  enabledContexts: ['general', 'flow-builder', 'dashboard'],
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  fallbackToOriginal: true,
  debugMode: false,
  customMappings: [],
  excludePatterns: ['JSON', 'HTTP', 'API']
};

await terminologyService.initialize(config);
```

## Advanced Usage

### Custom Mappings

```tsx
import { createTestMapping } from '@/lib/terminology';

const customMapping = createTestMapping(
  'Workflow',
  'Business Process',
  ['general', 'dashboard'],
  { priority: 'high' }
);

terminologyService.addCustomMapping(customMapping);
```

### Performance Monitoring

```tsx
import { useTerminologyStats } from '@/lib/terminology';

function PerformancePanel() {
  const { stats } = useTerminologyStats();
  
  return (
    <div>
      <p>Total Translations: {stats.totalTranslations}</p>
      <p>Cache Hit Ratio: {(stats.cacheHitRatio * 100).toFixed(1)}%</p>
      <p>Average Time: {stats.averageTranslationTime.toFixed(2)}ms</p>
    </div>
  );
}
```

### i18n Integration

The service automatically integrates with react-i18next:

```tsx
import { initializeI18nWithTerminology } from '@/lib/terminology';

// This enhances i18n with terminology translation
initializeI18nWithTerminology();

// Now regular i18n usage includes terminology
const { t } = useTranslation();
t('Create Flow', { terminologyContext: 'flow-builder' });
// Returns: "Create Standard Operating Procedure"
```

## Development Tools

### Debug Console

```tsx
import { useTerminologyDebug } from '@/lib/terminology';

function DebugPanel() {
  const { debugMode, toggleDebug, getTranslationDetails, clearCache } = useTerminologyDebug();
  
  return (
    <div>
      <button onClick={toggleDebug}>
        {debugMode ? 'Disable' : 'Enable'} Debug
      </button>
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
}
```

### Browser Console Commands

In development mode, global commands are available:

```javascript
// Test translation
sopTerminology.translate('Flow', 'flow-builder')

// View statistics
sopTerminology.stats()

// View configuration
sopTerminology.config()

// Clear cache
sopTerminology.clearCache()
```

## Testing

The service includes comprehensive testing utilities:

```tsx
import { terminologyTestUtils, createTestMapping } from '@/lib/terminology';

// Create mock service for testing
const mockService = terminologyTestUtils.createMockService();

// Test translation accuracy
const results = terminologyTestUtils.testTranslationAccuracy(
  mockService,
  [
    { input: 'Flow', expected: 'Standard Operating Procedure', context: 'general' },
    { input: 'Action', expected: 'Task', context: 'flow-builder' }
  ]
);

console.log(`Passed: ${results.passed}, Failed: ${results.failed}`);
```

## Performance

The service is optimized for performance:

- **Caching**: Translations are cached with configurable timeout
- **Lazy Loading**: Mappings are loaded on-demand
- **Efficient Matching**: Optimized regex patterns for fast matching
- **Context Filtering**: Only relevant mappings are applied per context

Typical performance metrics:
- **Translation time**: < 2ms average
- **Cache hit ratio**: > 90% in normal usage
- **Memory usage**: < 5MB for full terminology set

## Troubleshooting

### Common Issues

1. **Translations not applying**: Check that the service is initialized and the correct context is used
2. **Performance issues**: Enable caching and check for excessive exclude patterns
3. **Missing translations**: Verify terminology mappings exist for your text and context

### Debug Information

Enable debug mode to see detailed translation information:

```tsx
terminologyService.updateConfig({ debugMode: true });
```

This will log translation details to the console.

## Contributing

### Adding New Mappings

1. Edit `src/lib/terminology/mappings.ts`
2. Add your mapping to the appropriate category
3. Include context, priority, and description
4. Test the mapping with the debug tools

### Custom Terminology Sets

Create custom terminology sets for specific use cases:

```tsx
import { createTerminologySet } from '@/lib/terminology';

const myCustomSet = createTerminologySet(
  'custom',
  'My Custom Terms',
  'Custom terminology for my use case',
  [
    // Your custom mappings
  ]
);
```

## License

This terminology service is part of the SOP customization for Activepieces.