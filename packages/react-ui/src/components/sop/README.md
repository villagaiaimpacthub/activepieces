# SOP Layout Components

A comprehensive set of React components specifically designed for Standard Operating Procedure (SOP) workflow management and execution within the Activepieces ecosystem.

## Components Overview

### 1. SOPHeader
Custom header component with SOP branding, navigation, and search functionality.

**Features:**
- SOP title and subtitle display
- Status badges (draft, active, archived)
- Integrated search functionality  
- Action buttons for settings and collaboration
- Responsive design

**Usage:**
```tsx
import { SOPHeader } from '@/components/sop';

<SOPHeader
  title="Employee Onboarding SOP"
  subtitle="Complete process for new hire setup"
  status="active"
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
/>
```

### 2. SOPSidebar
Navigation sidebar optimized for SOP process organization and discovery.

**Features:**
- Hierarchical category and process organization
- Process status indicators
- Search and filtering capabilities
- Quick creation actions
- Collapsible categories

**Usage:**
```tsx
import { SOPSidebar } from '@/components/sop';

<SOPSidebar
  categories={sopCategories}
  selectedProcessId={currentProcessId}
  onProcessSelect={handleProcessSelection}
  onCreateProcess={handleCreateProcess}
/>
```

### 3. ProcessFlowLayout
Layout component for displaying workflow processes in an organized visual format.

**Features:**
- Vertical and horizontal flow layouts
- Step status visualization
- Progress indicators
- Assignee information
- Resource attachments
- Execution mode controls

**Usage:**
```tsx
import { ProcessFlowLayout } from '@/components/sop';

<ProcessFlowLayout
  steps={processSteps}
  currentStepId={activeStepId}
  onStepSelect={handleStepSelection}
  layout="vertical"
  isExecutionMode={true}
/>
```

### 4. StepByStepView
Detailed step execution view for guided SOP process completion.

**Features:**
- Progressive step navigation
- Detailed instructions and resources
- Checkpoint validation
- Tips and warnings display
- Note-taking capabilities
- Progress tracking

**Usage:**
```tsx
import { StepByStepView } from '@/components/sop';

<StepByStepView
  steps={stepDetails}
  currentStepIndex={currentStep}
  onStepChange={setCurrentStep}
  onComplete={handleCompletion}
  enableNotes={true}
/>
```

### 5. SOPDashboard
Comprehensive dashboard for SOP management and monitoring.

**Features:**
- Metrics and analytics display
- Recent SOP activity
- Active execution tracking
- Quick action buttons
- Responsive grid layout

**Usage:**
```tsx
import { SOPDashboard } from '@/components/sop';

<SOPDashboard
  metrics={sopMetrics}
  recentSOPs={recentProcesses}
  activeExecutions={currentExecutions}
  onCreateSOP={handleCreateSOP}
/>
```

## Demo Component

The `SOPLayoutDemo` component showcases how all SOP components work together in a complete application.

**Usage:**
```tsx
import { SOPLayoutDemo } from '@/components/sop';

<SOPLayoutDemo />
```

## Integration with Activepieces

These components are built using the existing Activepieces design system and components:

- **UI Components:** Built on top of `@/components/ui/*` 
- **Styling:** Uses existing CSS classes and Tailwind configurations
- **Icons:** Leverages `lucide-react` icon library
- **Utilities:** Integrates with `@/lib/utils` for consistent styling

## Component Architecture

All components follow consistent patterns:

- **TypeScript:** Full type safety with comprehensive interfaces
- **Forward Refs:** Proper ref forwarding for integration
- **Customizable:** Extensive prop interfaces for customization  
- **Responsive:** Mobile-first responsive design
- **Accessible:** Built with accessibility best practices

## Data Interfaces

### Core Types

```typescript
// Process and step definitions
interface SOPProcess {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  stepCount?: number;
  lastModified?: Date;
  category?: string;
}

interface ProcessStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee?: { id: string; name: string };
  estimatedDuration?: number;
  resources?: string[];
}

// Detailed step information
interface StepDetail extends ProcessStep {
  instructions: string;
  resources: StepResource[];
  checkpoints?: string[];
  tips?: string[];
  warnings?: string[];
}
```

## Customization

Components can be customized through:

1. **Props:** Extensive prop interfaces for behavior control
2. **CSS Classes:** Additional className props for styling
3. **Themes:** Integration with existing theme system
4. **Variants:** Built-in variants for different use cases

## Performance

- **Optimized Rendering:** Uses React.memo and callback optimization
- **Lazy Loading:** Supports dynamic content loading
- **Virtual Scrolling:** Large datasets handled efficiently
- **State Management:** Local state with external integration support

## Accessibility

- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Readers:** Proper ARIA labels and descriptions
- **Focus Management:** Logical focus flow
- **High Contrast:** Compatible with high contrast themes

## Browser Support

Components are tested and supported on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Future Enhancements

Planned improvements include:
- Advanced analytics integration
- Real-time collaboration features
- Enhanced mobile experience
- Additional layout options
- Workflow automation integration