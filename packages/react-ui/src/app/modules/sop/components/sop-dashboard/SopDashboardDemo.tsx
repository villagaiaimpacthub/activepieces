import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  Eye, 
  RefreshCw, 
  Layout,
  Maximize2,
  Minimize2,
  Monitor
} from 'lucide-react';
import { SopDashboard } from './index';

interface SopDashboardDemoProps {
  className?: string;
}

export const SopDashboardDemo: React.FC<SopDashboardDemoProps> = ({ 
  className 
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [layout, setLayout] = React.useState<'default' | 'compact' | 'wide'>('default');
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleCreateSOP = () => {
    console.log('Navigate to create SOP');
    // In real implementation: navigate('/sop/create')
  };

  const handleBrowseLibrary = () => {
    console.log('Navigate to SOP library');
    // In real implementation: navigate('/sop/library')
  };

  const handleExecuteTemplate = () => {
    console.log('Navigate to template execution');
    // In real implementation: navigate('/sop/execute')
  };

  const handleViewReports = () => {
    console.log('Navigate to reports');
    // In real implementation: navigate('/sop/reports')
  };

  const handleManageUsers = () => {
    console.log('Navigate to user management');
    // In real implementation: navigate('/sop/users')
  };

  const handleScheduleReview = () => {
    console.log('Navigate to schedule review');
    // In real implementation: navigate('/sop/schedule')
  };

  const handleActivityClick = (activityId: string) => {
    console.log(`Navigate to activity: ${activityId}`);
    // In real implementation: navigate(`/sop/activity/${activityId}`)
  };

  const handleViewAllActivity = () => {
    console.log('Navigate to all activity');
    // In real implementation: navigate('/sop/activity')
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Demo Controls */}
      <Card className="mb-6 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-blue-600" />
              SOP Dashboard Demo
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                B2.2 Integration Task
              </Badge>
              <Badge variant="outline" className="text-xs">
                Live Demo
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            {/* Layout Controls */}
            <div className="flex items-center gap-2">
              <Layout className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Layout:</span>
              <div className="flex gap-1">
                {(['default', 'compact', 'wide'] as const).map((layoutOption) => (
                  <Button
                    key={layoutOption}
                    variant={layout === layoutOption ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setLayout(layoutOption)}
                    className="capitalize text-xs"
                  >
                    {layoutOption}
                  </Button>
                ))}
              </div>
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center gap-2"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    <span className="text-xs">Normal</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="h-4 w-4" />
                    <span className="text-xs">Fullscreen</span>
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs">Refresh</span>
              </Button>
            </div>

            {/* Feature Status */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-xs text-muted-foreground">API Connected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-xs text-muted-foreground">Real-time</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 bg-purple-500 rounded-full" />
                <span className="text-xs text-muted-foreground">Terminology</span>
              </div>
            </div>
          </div>

          {/* Demo Info */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm space-y-1">
              <p className="font-medium">Dashboard Features Demonstrated:</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• <strong>SOP Overview Widget</strong> - Real-time SOP statistics and metrics</li>
                <li>• <strong>Recent Activity Widget</strong> - Live activity feed with user interactions</li>
                <li>• <strong>Compliance Status Widget</strong> - Compliance scoring and audit tracking</li>
                <li>• <strong>Quick Actions Widget</strong> - Common SOP operations and shortcuts</li>
                <li>• <strong>Performance Metrics Widget</strong> - Trend analysis and success rates</li>
                <li>• <strong>Terminology Translation</strong> - SOP-specific language (flows → SOPs)</li>
                <li>• <strong>Responsive Design</strong> - Adaptive layouts for different screen sizes</li>
                <li>• <strong>Error Handling</strong> - Loading states and error boundaries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard */}
      <div className={cn(
        'transition-all duration-300',
        isFullscreen && 'fixed inset-0 z-50 bg-background overflow-auto'
      )}>
        <SopDashboard
          key={refreshKey}
          className={cn(
            'transition-all duration-300',
            isFullscreen && 'min-h-screen'
          )}
          layout={layout}
          onCreateSOP={handleCreateSOP}
          onBrowseLibrary={handleBrowseLibrary}
          onExecuteTemplate={handleExecuteTemplate}
          onViewReports={handleViewReports}
          onManageUsers={handleManageUsers}
          onScheduleReview={handleScheduleReview}
          onActivityClick={handleActivityClick}
          onViewAllActivity={handleViewAllActivity}
        />
      </div>

      {/* Implementation Notes */}
      {!isFullscreen && (
        <Card className="mt-6 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              Implementation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Completed</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• All 5 dashboard widgets implemented</li>
                  <li>• Terminology translation system integrated</li>
                  <li>• API integration with loading states</li>
                  <li>• Responsive design with multiple layouts</li>
                  <li>• Real-time data updates configuration</li>
                  <li>• Error handling for API failures</li>
                  <li>• Export structure for dashboard assembly</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-blue-600">🔗 Dependencies</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• B2.1: Terminology translation (ready)</li>
                  <li>• B1.2/B1.3: Backend SOP APIs (ready)</li>
                  <li>• B2.3: Navigation integration (parallel)</li>
                  <li>• B3.x: Export system (parallel)</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Eye className="h-4 w-4" />
                <span className="font-medium text-sm">Ready for Integration</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                Dashboard components are production-ready and can be integrated into the main Activepieces application.
                All widgets follow established UI patterns and support the required SOP terminology.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};