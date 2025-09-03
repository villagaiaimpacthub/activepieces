import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  ArrowDown,
  ArrowRight,
  CheckCircle,
  Circle,
  Clock,
  AlertTriangle,
  Users,
  Timer,
  FileText,
  Edit,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react';

export interface ProcessStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  estimatedDuration?: number; // in minutes
  actualDuration?: number; // in minutes
  dependencies?: string[]; // step IDs
  resources?: string[];
  notes?: string;
}

export interface ProcessFlowLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: ProcessStep[];
  currentStepId?: string;
  onStepSelect?: (stepId: string) => void;
  onStepEdit?: (stepId: string) => void;
  onStepStatusChange?: (stepId: string, status: ProcessStep['status']) => void;
  layout?: 'vertical' | 'horizontal';
  showDetails?: boolean;
  isExecutionMode?: boolean;
}

const statusConfig = {
  pending: {
    icon: Circle,
    color: 'text-gray-400',
    bgColor: 'bg-gray-50 border-gray-200',
    label: 'Pending'
  },
  in_progress: {
    icon: Play,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    label: 'In Progress'
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-50 border-green-200',
    label: 'Completed'
  },
  blocked: {
    icon: AlertTriangle,
    color: 'text-red-500',
    bgColor: 'bg-red-50 border-red-200',
    label: 'Blocked'
  }
};

const ProcessFlowLayout = React.forwardRef<HTMLDivElement, ProcessFlowLayoutProps>(
  ({
    className,
    steps,
    currentStepId,
    onStepSelect,
    onStepEdit,
    onStepStatusChange,
    layout = 'vertical',
    showDetails = true,
    isExecutionMode = false,
    ...props
  }, ref) => {
    const [selectedStepId, setSelectedStepId] = React.useState<string | undefined>(
      currentStepId
    );

    React.useEffect(() => {
      setSelectedStepId(currentStepId);
    }, [currentStepId]);

    const handleStepClick = (stepId: string) => {
      setSelectedStepId(stepId);
      onStepSelect?.(stepId);
    };

    const renderStepCard = (step: ProcessStep, index: number) => {
      const config = statusConfig[step.status];
      const StatusIcon = config.icon;
      const isSelected = selectedStepId === step.id;
      const isCurrentStep = currentStepId === step.id;

      return (
        <Card
          key={step.id}
          className={cn(
            'cursor-pointer transition-all duration-200 hover:shadow-md',
            config.bgColor,
            isSelected && 'ring-2 ring-primary ring-offset-2',
            isCurrentStep && 'shadow-lg border-primary',
            'relative'
          )}
          onClick={() => handleStepClick(step.id)}
        >
          {/* Step number indicator */}
          <div className="absolute -left-3 top-4 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>

          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <StatusIcon className={cn('h-5 w-5', config.color)} />
                <CardTitle className="text-base">{step.title}</CardTitle>
                {isCurrentStep && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-1">
                {!isExecutionMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStepEdit?.(step.id);
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                )}
                
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {showDetails && (
            <CardContent className="pt-0">
              {step.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {step.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-3">
                  {step.assignee && (
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{step.assignee.name}</span>
                    </div>
                  )}
                  
                  {step.estimatedDuration && (
                    <div className="flex items-center space-x-1">
                      <Timer className="h-3 w-3" />
                      <span>{step.estimatedDuration}m</span>
                    </div>
                  )}
                </div>

                <Badge 
                  variant="outline" 
                  className={cn('text-xs', config.color)}
                >
                  {config.label}
                </Badge>
              </div>

              {step.resources && step.resources.length > 0 && (
                <div className="mt-3 flex items-center space-x-1">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {step.resources.length} resource{step.resources.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* Execution mode controls */}
              {isExecutionMode && step.status !== 'completed' && (
                <div className="mt-3 flex items-center space-x-2">
                  {step.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onStepStatusChange?.(step.id, 'in_progress');
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                  
                  {step.status === 'in_progress' && (
                    <>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStepStatusChange?.(step.id, 'completed');
                        }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStepStatusChange?.(step.id, 'pending');
                        }}
                      >
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      );
    };

    const renderConnector = (index: number) => {
      if (index === steps.length - 1) return null;

      const ConnectorIcon = layout === 'vertical' ? ArrowDown : ArrowRight;
      
      return (
        <div 
          key={`connector-${index}`}
          className={cn(
            'flex items-center justify-center',
            layout === 'vertical' ? 'my-4' : 'mx-4'
          )}
        >
          <ConnectorIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn('w-full h-full', className)}
        {...props}
      >
        <ScrollArea className="h-full">
          <div className={cn(
            'p-6',
            layout === 'vertical' ? 'space-y-0' : 'flex items-start space-x-0',
            layout === 'horizontal' && 'min-w-max'
          )}>
            {steps.length > 0 ? (
              steps.map((step, index) => (
                <React.Fragment key={step.id}>
                  {renderStepCard(step, index)}
                  {renderConnector(index)}
                </React.Fragment>
              ))
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No process steps defined</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start by adding the first step to your SOP process.
                  </p>
                  <Button onClick={() => onStepEdit?.('new')}>
                    Add First Step
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
);

ProcessFlowLayout.displayName = 'ProcessFlowLayout';

export { ProcessFlowLayout };