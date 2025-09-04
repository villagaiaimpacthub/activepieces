/**
 * SOP Template Preview Modal
 * Shows detailed preview of a template before creation
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  X,
  Star,
  Clock,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Info,
  Copy,
  Download,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Tag,
  User,
  Calendar
} from 'lucide-react';
import { SopTemplate } from './SopTemplateLibrary';

export interface SopTemplateStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  isRequired: boolean;
  hasValidation: boolean;
  inputs?: {
    name: string;
    type: 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'file';
    required: boolean;
  }[];
}

export interface SopTemplateDetails extends SopTemplate {
  longDescription?: string;
  prerequisites?: string[];
  outcomes?: string[];
  steps: SopTemplateStep[];
  resources?: {
    name: string;
    type: 'document' | 'link' | 'video' | 'image';
    url: string;
  }[];
  compliance?: {
    standards: string[];
    auditTrail: boolean;
    approvalRequired: boolean;
  };
}

export interface SopTemplatePreviewProps {
  template: SopTemplateDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateFromTemplate?: (template: SopTemplateDetails) => void;
  onBookmarkToggle?: (templateId: string, bookmarked: boolean) => void;
  isCreating?: boolean;
  className?: string;
}

const STEP_ICON_MAP = {
  required: CheckCircle2,
  optional: Info,
  validation: AlertTriangle
};

export const SopTemplatePreview: React.FC<SopTemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onCreateFromTemplate,
  onBookmarkToggle,
  isCreating = false,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'steps' | 'resources'>('overview');

  if (!template) return null;

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderStars = (rating: number) => (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleBookmark = () => {
    onBookmarkToggle?.(template.id, !template.isBookmarked);
  };

  const handleCreate = () => {
    onCreateFromTemplate?.(template);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Template Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">
              {template.longDescription || template.description}
            </p>
          </div>

          {template.prerequisites && template.prerequisites.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Prerequisites</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {template.prerequisites.map((prereq, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {template.outcomes && template.outcomes.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Expected Outcomes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {template.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-blue-600 flex-shrink-0" />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Metrics */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Template Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Estimated Time</span>
                  </div>
                  <Badge variant="outline">{formatDuration(template.estimatedTime)}</Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Steps</span>
                  </div>
                  <Badge variant="outline">{template.steps.length}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Usage Count</span>
                  </div>
                  <Badge variant="outline">{template.usageCount}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Rating</span>
                  <div className="flex items-center gap-2">
                    {renderStars(template.rating)}
                    <span className="text-sm text-muted-foreground">
                      ({template.rating.toFixed(1)})
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Info */}
          {template.compliance && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Compliance & Standards</h4>
                <div className="space-y-3">
                  {template.compliance.standards.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Standards:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.compliance.standards.map((standard, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {standard}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Trail</span>
                    <Badge variant={template.compliance.auditTrail ? 'default' : 'secondary'}>
                      {template.compliance.auditTrail ? 'Required' : 'Optional'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approval Required</span>
                    <Badge variant={template.compliance.approvalRequired ? 'default' : 'secondary'}>
                      {template.compliance.approvalRequired ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <h4 className="font-medium mb-2">Tags</h4>
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStepsTab = () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        This template includes {template.steps.length} steps with an estimated total time of {formatDuration(template.estimatedTime)}.
      </div>
      
      {template.steps.map((step, index) => {
        const Icon = step.isRequired ? CheckCircle2 : step.hasValidation ? AlertTriangle : Info;
        const iconColor = step.isRequired ? 'text-green-600' : step.hasValidation ? 'text-yellow-600' : 'text-blue-600';
        
        return (
          <Card key={step.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <Icon className={cn('h-4 w-4', iconColor)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{step.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDuration(step.estimatedTime)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    <Badge 
                      variant={step.isRequired ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {step.isRequired ? 'Required' : 'Optional'}
                    </Badge>
                    
                    {step.hasValidation && (
                      <Badge variant="outline" className="text-xs">
                        Validation Required
                      </Badge>
                    )}
                    
                    {step.inputs && step.inputs.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {step.inputs.length} Input{step.inputs.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {template.resources && template.resources.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium">Additional Resources</h4>
          {template.resources.map((resource, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{resource.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {resource.type}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3 w-3 mr-1" />
                      View
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No additional resources available</p>
        </div>
      )}

      {/* Author & Update Info */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-3">Template Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Author</span>
              </div>
              <span className="font-medium">{template.author}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Last Updated</span>
              </div>
              <span className="font-medium">
                {template.lastUpdated.toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-4xl max-h-[90vh] flex flex-col', className)}>
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">{template.title}</DialogTitle>
                {template.isFeatured && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Featured
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{template.description}</p>
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(template.difficulty)}
                >
                  {template.difficulty}
                </Badge>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="flex-shrink-0 ml-2"
            >
              {template.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'steps', label: `Steps (${template.steps.length})` },
            { id: 'resources', label: 'Resources' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-1">
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'steps' && renderStepsTab()}
            {activeTab === 'resources' && renderResourcesTab()}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Create from Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};