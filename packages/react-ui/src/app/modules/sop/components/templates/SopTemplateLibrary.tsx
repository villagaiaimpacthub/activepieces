/**
 * SOP Template Library Component
 * Browse and select from available SOP templates
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Search,
  Filter,
  Star,
  Download,
  Eye,
  Copy,
  Clock,
  Users,
  FileText,
  Bookmark,
  BookmarkCheck,
  Grid3X3,
  List,
  ChevronDown,
  Tag,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { SopErrorBoundary } from '../SopErrorBoundary';
import { SopLoadingSpinner } from '../SopLoadingSpinner';

export interface SopTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // minutes
  steps: number;
  rating: number; // 1-5
  usageCount: number;
  author: string;
  lastUpdated: Date;
  isBookmarked?: boolean;
  isFeatured?: boolean;
  thumbnail?: string;
  previewUrl?: string;
}

export interface SopTemplateLibraryProps {
  templates?: SopTemplate[];
  isLoading?: boolean;
  error?: string | null;
  onSelectTemplate?: (template: SopTemplate) => void;
  onPreviewTemplate?: (template: SopTemplate) => void;
  onBookmarkTemplate?: (templateId: string, bookmarked: boolean) => void;
  onCreateFromTemplate?: (template: SopTemplate) => void;
  className?: string;
}

const TEMPLATE_CATEGORIES = [
  'All',
  'Onboarding',
  'IT & Security',
  'HR & Compliance', 
  'Operations',
  'Quality Assurance',
  'Customer Service',
  'Marketing',
  'Finance'
];

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

export const SopTemplateLibrary: React.FC<SopTemplateLibraryProps> = ({
  templates = [],
  isLoading = false,
  error,
  onSelectTemplate,
  onPreviewTemplate,
  onBookmarkTemplate,
  onCreateFromTemplate,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'title'>('popular');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesBookmark = !showBookmarkedOnly || template.isBookmarked;
      
      return matchesSearch && matchesCategory && matchesBookmark;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.usageCount - a.usageCount;
        case 'recent':
          return b.lastUpdated.getTime() - a.lastUpdated.getTime();
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [templates, searchTerm, selectedCategory, sortBy, showBookmarkedOnly]);

  const handleBookmark = (template: SopTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    onBookmarkTemplate?.(template.id, !template.isBookmarked);
  };

  const handlePreview = (template: SopTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    onPreviewTemplate?.(template);
  };

  const handleCreate = (template: SopTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateFromTemplate?.(template);
  };

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
            'h-3 w-3',
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          )}
        />
      ))}
    </div>
  );

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTemplateCard = (template: SopTemplate) => (
    <Card 
      key={template.id}
      className="cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => onSelectTemplate?.(template)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
                {template.title}
              </CardTitle>
              {template.isFeatured && (
                <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleBookmark(template, e)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            {template.isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={DIFFICULTY_COLORS[template.difficulty]}
          >
            {template.difficulty}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(template.estimatedTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{template.steps} steps</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {renderStars(template.rating)}
            <span className="text-xs">({template.usageCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => handlePreview(template, e)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            onClick={(e) => handleCreate(template, e)}
            className="flex-1"
          >
            <Copy className="h-3 w-3 mr-1" />
            Use Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderTemplateList = (template: SopTemplate) => (
    <Card 
      key={template.id}
      className="cursor-pointer hover:shadow-sm transition-all duration-200"
      onClick={() => onSelectTemplate?.(template)}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{template.title}</h4>
                {template.isFeatured && (
                  <Badge variant="secondary" className="text-xs">Featured</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {template.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{template.category}</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(template.estimatedTime)}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {template.steps} steps
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(template.rating)}
                  <span>({template.usageCount})</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={DIFFICULTY_COLORS[template.difficulty]}
              >
                {template.difficulty}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleBookmark(template, e)}
            >
              {template.isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handlePreview(template, e)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={(e) => handleCreate(template, e)}
            >
              <Copy className="h-4 w-4 mr-1" />
              Use
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading && templates.length === 0) {
    return (
      <SopErrorBoundary>
        <div className={cn('space-y-6', className)}>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          {renderSkeletonGrid()}
        </div>
      </SopErrorBoundary>
    );
  }

  if (error) {
    return (
      <SopErrorBoundary>
        <Card className="border-red-200">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Failed to Load Templates
            </h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button>Try Again</Button>
          </CardContent>
        </Card>
      </SopErrorBoundary>
    );
  }

  return (
    <SopErrorBoundary>
      <div className={cn('space-y-6', className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">SOP Template Library</h2>
            <p className="text-muted-foreground">
              Choose from {templates.length} pre-built templates to get started quickly
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="title">Alphabetical</option>
              </select>
              <Button
                variant={showBookmarkedOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Bookmarked
              </Button>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-4 lg:grid-cols-9 h-auto p-1">
                {TEMPLATE_CATEGORIES.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="text-xs px-2 py-1"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTemplates.length} templates
            </p>
            {isLoading && (
              <SopLoadingSpinner size="sm" message="Updating..." />
            )}
          </div>

          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search criteria or browse different categories
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setShowBookmarkedOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.map(renderTemplateList)}
            </div>
          )}
        </div>
      </div>
    </SopErrorBoundary>
  );
};