import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Timer,
  Users,
  FileText,
  AlertCircle,
  MessageCircle,
  Bookmark,
  Eye,
  EyeOff,
  Copy,
  ExternalLink
} from 'lucide-react';

export interface StepResource {
  id: string;
  name: string;
  type: 'document' | 'video' | 'image' | 'link';
  url: string;
}

export interface StepDetail {
  id: string;
  title: string;
  description: string;
  instructions: string;
  estimatedDuration?: number;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  resources: StepResource[];
  checkpoints?: string[];
  tips?: string[];
  warnings?: string[];
  dependencies?: string[];
  notes?: string;
}

export interface StepByStepViewProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepDetail[];
  currentStepIndex: number;
  onStepChange: (index: number) => void;
  onComplete?: () => void;
  showNavigation?: boolean;
  showProgress?: boolean;
  enableNotes?: boolean;
  isReadOnly?: boolean;
}

const resourceIcons = {
  document: FileText,
  video: Eye,
  image: Eye,
  link: ExternalLink
};

const StepByStepView = React.forwardRef<HTMLDivElement, StepByStepViewProps>(
  ({
    className,
    steps,
    currentStepIndex,
    onStepChange,
    onComplete,
    showNavigation = true,
    showProgress = true,
    enableNotes = true,
    isReadOnly = false,
    ...props
  }, ref) => {
    const [userNotes, setUserNotes] = React.useState<string>('');
    const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
      new Set()
    );
    const [expandedSections, setExpandedSections] = React.useState<{
      resources: boolean;
      checkpoints: boolean;
      tips: boolean;
    }>({
      resources: true,
      checkpoints: true,
      tips: false
    });

    const currentStep = steps[currentStepIndex];
    const isFirstStep = currentStepIndex === 0;
    const isLastStep = currentStepIndex === steps.length - 1;

    const handlePrevious = () => {
      if (!isFirstStep) {
        onStepChange(currentStepIndex - 1);
      }
    };

    const handleNext = () => {
      if (!isLastStep) {
        onStepChange(currentStepIndex + 1);
      } else if (onComplete) {
        onComplete();
      }
    };

    const handleCompleteStep = () => {
      setCompletedSteps(prev => new Set([...prev, currentStepIndex]));
      if (!isLastStep) {
        handleNext();
      } else {
        onComplete?.();
      }
    };

    const toggleSection = (section: keyof typeof expandedSections) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const renderResource = (resource: StepResource) => {
      const IconComponent = resourceIcons[resource.type];
      
      return (
        <div 
          key={resource.id}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <IconComponent className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{resource.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {resource.type}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
              </a>
            </Button>
            <Button variant="ghost" size="sm">
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      );
    };

    if (!currentStep) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">No step selected</p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col h-full bg-background', className)}
        {...props}
      >
        {/* Progress Bar */}
        {showProgress && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Progress</h3>
              <span className="text-sm text-muted-foreground">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStepIndex + 1) / steps.length) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Step Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {currentStepIndex + 1}
                    </div>
                    <h1 className="text-2xl font-semibold">{currentStep.title}</h1>
                  </div>
                  
                  {currentStep.description && (
                    <p className="text-muted-foreground">{currentStep.description}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {currentStep.estimatedDuration && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Timer className="h-3 w-3" />
                      <span>{currentStep.estimatedDuration}m</span>
                    </Badge>
                  )}
                  
                  {currentStep.assignee && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{currentStep.assignee.name}</span>
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />
            </div>

            {/* Instructions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {currentStep.instructions.split('\n').map((line, index) => (
                    <p key={index} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            {currentStep.resources.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Resources</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('resources')}
                    >
                      {expandedSections.resources ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {expandedSections.resources && (
                  <CardContent>
                    <div className="space-y-2">
                      {currentStep.resources.map(renderResource)}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Checkpoints */}
            {currentStep.checkpoints && currentStep.checkpoints.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5" />
                      <span>Checkpoints</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection('checkpoints')}
                    >
                      {expandedSections.checkpoints ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {expandedSections.checkpoints && (
                  <CardContent>
                    <div className="space-y-2">
                      {currentStep.checkpoints.map((checkpoint, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <Circle className="h-4 w-4 mt-1 text-muted-foreground" />
                          <span className="text-sm">{checkpoint}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Tips and Warnings */}
            {((currentStep.tips && currentStep.tips.length > 0) || 
              (currentStep.warnings && currentStep.warnings.length > 0)) && (
              <div className="grid gap-4 mb-6">
                {currentStep.tips && currentStep.tips.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2 text-blue-600">
                        <Bookmark className="h-5 w-5" />
                        <span>Tips</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentStep.tips.map((tip, index) => (
                          <p key={index} className="text-sm text-blue-800 bg-blue-50 p-2 rounded">
                            {tip}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {currentStep.warnings && currentStep.warnings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2 text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        <span>Important</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {currentStep.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-amber-800 bg-amber-50 p-2 rounded">
                            {warning}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Notes */}
            {enableNotes && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add your notes for this step..."
                    value={userNotes}
                    onChange={(e) => setUserNotes(e.target.value)}
                    className="min-h-20"
                    disabled={isReadOnly}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Navigation */}
        {showNavigation && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={handleCompleteStep}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Mark Complete</span>
                </Button>

                <Button
                  onClick={handleNext}
                  className="flex items-center space-x-2"
                >
                  <span>{isLastStep ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

StepByStepView.displayName = 'StepByStepView';

export { StepByStepView };