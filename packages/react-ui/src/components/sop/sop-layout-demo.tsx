import * as React from 'react';
import { useState } from 'react';
import { 
  SOPHeader, 
  SOPSidebar, 
  ProcessFlowLayout, 
  StepByStepView, 
  SOPDashboard,
  type SOPCategory,
  type ProcessStep,
  type StepDetail,
  type SOPMetrics,
  type RecentSOP,
  type ActiveExecution
} from './index';

// Demo data
const demoCategories: SOPCategory[] = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    expanded: true,
    processes: [
      {
        id: 'new-hire-setup',
        name: 'New Hire IT Setup',
        status: 'active',
        stepCount: 8,
        lastModified: new Date('2024-01-15'),
        category: 'onboarding'
      },
      {
        id: 'orientation',
        name: 'Company Orientation',
        status: 'active',
        stepCount: 12,
        lastModified: new Date('2024-01-10'),
        category: 'onboarding'
      }
    ]
  },
  {
    id: 'hr',
    name: 'HR Processes',
    expanded: false,
    processes: [
      {
        id: 'performance-review',
        name: 'Annual Performance Review',
        status: 'draft',
        stepCount: 15,
        lastModified: new Date('2024-01-12'),
        category: 'hr'
      }
    ]
  }
];

const demoProcessSteps: ProcessStep[] = [
  {
    id: 'step-1',
    title: 'Prepare Equipment',
    description: 'Gather all necessary IT equipment for new hire',
    status: 'completed',
    assignee: { id: '1', name: 'IT Admin' },
    estimatedDuration: 30,
    actualDuration: 25
  },
  {
    id: 'step-2',
    title: 'Setup User Accounts',
    description: 'Create all necessary user accounts and permissions',
    status: 'in_progress',
    assignee: { id: '2', name: 'System Admin' },
    estimatedDuration: 45
  },
  {
    id: 'step-3',
    title: 'Configure Software',
    description: 'Install and configure required software applications',
    status: 'pending',
    assignee: { id: '1', name: 'IT Admin' },
    estimatedDuration: 60
  },
  {
    id: 'step-4',
    title: 'Security Setup',
    description: 'Configure security settings and VPN access',
    status: 'pending',
    assignee: { id: '3', name: 'Security Team' },
    estimatedDuration: 30
  }
];

const demoStepDetails: StepDetail[] = [
  {
    id: 'step-1',
    title: 'Prepare Equipment',
    description: 'Gather all necessary IT equipment for the new hire setup',
    instructions: `1. Check inventory for available laptop/desktop
2. Verify monitor, keyboard, and mouse availability
3. Prepare all cables and power adapters
4. Clean and test all equipment
5. Create equipment assignment record`,
    estimatedDuration: 30,
    assignee: { id: '1', name: 'IT Admin' },
    resources: [
      {
        id: 'res-1',
        name: 'Equipment Inventory Checklist',
        type: 'document',
        url: '/docs/equipment-checklist.pdf'
      },
      {
        id: 'res-2',
        name: 'Hardware Setup Video',
        type: 'video',
        url: '/videos/hardware-setup.mp4'
      }
    ],
    checkpoints: [
      'All equipment items are physically present',
      'Equipment has been tested and verified working',
      'Assignment record has been created in system'
    ],
    tips: [
      'Always test equipment before assignment',
      'Use the standard equipment configuration template'
    ],
    warnings: [
      'Ensure all equipment is properly sanitized before assignment'
    ]
  }
];

const demoMetrics: SOPMetrics = {
  totalSOPs: 24,
  activeSOPs: 18,
  completedExecutions: 156,
  averageCompletionTime: 120,
  complianceRate: 94,
  recentActivity: 8
};

const demoRecentSOPs: RecentSOP[] = [
  {
    id: '1',
    title: 'New Hire IT Setup',
    status: 'active',
    lastModified: new Date('2024-01-15'),
    lastModifiedBy: 'John Smith',
    category: 'Onboarding',
    executionCount: 12
  },
  {
    id: '2',
    title: 'Monthly Security Review',
    status: 'active',
    lastModified: new Date('2024-01-14'),
    lastModifiedBy: 'Sarah Johnson',
    category: 'Security',
    executionCount: 8
  },
  {
    id: '3',
    title: 'Customer Support Escalation',
    status: 'draft',
    lastModified: new Date('2024-01-13'),
    lastModifiedBy: 'Mike Wilson',
    category: 'Support'
  }
];

const demoActiveExecutions: ActiveExecution[] = [
  {
    id: '1',
    sopTitle: 'New Hire IT Setup',
    assignee: 'Alice Brown',
    currentStep: 'Setup User Accounts',
    progress: 60,
    startedAt: new Date('2024-01-15T09:00:00'),
    estimatedCompletion: new Date('2024-01-15T15:00:00')
  },
  {
    id: '2',
    sopTitle: 'Security Audit Process',
    assignee: 'Bob Davis',
    currentStep: 'Review Access Permissions',
    progress: 25,
    startedAt: new Date('2024-01-15T10:30:00'),
    estimatedCompletion: new Date('2024-01-16T12:00:00')
  }
];

type ViewMode = 'dashboard' | 'flow' | 'stepByStep';

export const SOPLayoutDemo: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [searchValue, setSearchValue] = useState<string>('');

  const handleProcessSelect = (processId: string) => {
    setSelectedProcessId(processId);
    setCurrentView('flow');
  };

  const handleStepSelect = (stepId: string) => {
    const stepIndex = demoStepDetails.findIndex(step => step.id === stepId);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
      setCurrentView('stepByStep');
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProcessId('');
  };

  const handleBackToFlow = () => {
    setCurrentView('flow');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <SOPDashboard
            metrics={demoMetrics}
            recentSOPs={demoRecentSOPs}
            activeExecutions={demoActiveExecutions}
            onCreateSOP={() => console.log('Create SOP clicked')}
            onSOPClick={handleProcessSelect}
            onExecutionClick={(id) => console.log('Execution clicked:', id)}
            onViewAllSOPs={() => console.log('View all SOPs clicked')}
            onViewAllExecutions={() => console.log('View all executions clicked')}
          />
        );
      
      case 'flow':
        return (
          <div className="flex flex-col h-full">
            <SOPHeader
              title="New Hire IT Setup"
              subtitle="Complete IT setup process for new employees"
              status="active"
              searchValue={searchValue}
              onSearchChange={setSearchValue}
            />
            <div className="flex-1 p-6">
              <ProcessFlowLayout
                steps={demoProcessSteps}
                currentStepId="step-2"
                onStepSelect={handleStepSelect}
                onStepEdit={(stepId) => console.log('Edit step:', stepId)}
                onStepStatusChange={(stepId, status) => 
                  console.log('Status change:', stepId, status)
                }
                showDetails={true}
              />
            </div>
          </div>
        );
      
      case 'stepByStep':
        return (
          <div className="flex flex-col h-full">
            <SOPHeader
              title="New Hire IT Setup"
              subtitle="Step-by-step execution mode"
              status="active"
              showSearch={false}
            />
            <div className="flex-1">
              <StepByStepView
                steps={demoStepDetails}
                currentStepIndex={currentStepIndex}
                onStepChange={setCurrentStepIndex}
                onComplete={() => console.log('Process completed!')}
                showNavigation={true}
                showProgress={true}
                enableNotes={true}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - only show in flow and step-by-step views */}
      {(currentView === 'flow' || currentView === 'stepByStep') && (
        <div className="w-80 border-r border-border">
          <SOPSidebar
            categories={demoCategories}
            selectedProcessId={selectedProcessId}
            onProcessSelect={handleProcessSelect}
            onCategoryToggle={(categoryId) => {
              console.log('Category toggled:', categoryId);
            }}
            onCreateProcess={(categoryId) => {
              console.log('Create process in category:', categoryId);
            }}
            onCreateCategory={() => {
              console.log('Create category clicked');
            }}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            showFilters={true}
          />
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation breadcrumbs for non-dashboard views */}
        {currentView !== 'dashboard' && (
          <div className="p-4 border-b border-border bg-muted/30">
            <div className="flex items-center space-x-2 text-sm">
              <button 
                onClick={handleBackToDashboard}
                className="text-primary hover:underline"
              >
                Dashboard
              </button>
              <span className="text-muted-foreground">/</span>
              
              {currentView === 'stepByStep' && (
                <>
                  <button 
                    onClick={handleBackToFlow}
                    className="text-primary hover:underline"
                  >
                    Process Flow
                  </button>
                  <span className="text-muted-foreground">/</span>
                </>
              )}
              
              <span className="text-foreground">
                {currentView === 'flow' ? 'Process Flow' : 'Step Execution'}
              </span>
            </div>
          </div>
        )}
        
        {/* Current View Content */}
        <div className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </div>
      </div>
    </div>
  );
};

export default SOPLayoutDemo;