/**
 * Branding System Demo Component
 * 
 * This component demonstrates all features of the SOP branding system:
 * - Brand switching and management
 * - Asset display and loading
 * - Color scheme previews
 * - Typography showcase
 * - Real-time configuration
 * - Export/import functionality
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Comprehensive demonstration of branding capabilities
 */

import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Image, 
  Settings, 
  Download, 
  Upload, 
  Eye,
  Code,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BrandingProvider,
  BrandSwitcher,
  BrandLogo,
  BrandTitle,
  BrandControlPanel,
  CompactBrandSwitcher,
  useBranding,
  useFullBranding,
  BrandingUtils,
  BrandingDebug,
} from '@/lib/branding';

interface BrandingDemoProps {
  className?: string;
}

/**
 * Main Branding Demo Component
 */
export function BrandingDemo({ className }: BrandingDemoProps) {
  return (
    <BrandingProvider autoInitialize={true}>
      <div className={`space-y-6 p-6 ${className}`}>
        <BrandingDemoContent />
      </div>
    </BrandingProvider>
  );
}

/**
 * Demo Content Component (inside BrandingProvider)
 */
function BrandingDemoContent() {
  const branding = useFullBranding();
  const [selectedDemo, setSelectedDemo] = useState<string>('overview');
  const [livePreview, setLivePreview] = useState(false);
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Debug information display
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setDebugInfo(BrandingDebug.getCurrentState());
    }
  }, [branding.activeBrand]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <BrandLogo variant="icon" className="w-12 h-12" />
          <h1 className="text-4xl font-bold">
            <BrandTitle variant="app" />
          </h1>
        </div>
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Complete SOP Branding System Demo - Showcase runtime brand switching, 
          asset management, color schemes, typography, and comprehensive branding control.
        </p>

        {/* Quick Brand Switcher */}
        <div className="flex items-center justify-center gap-4">
          <CompactBrandSwitcher />
          <div className="flex items-center gap-2">
            <Switch
              checked={livePreview}
              onCheckedChange={setLivePreview}
            />
            <Label>Live Preview</Label>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <Card className="bg-muted/50">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Active: {branding.activeBrand.displayName}
              </Badge>
              <Badge variant={branding.isLoading ? 'destructive' : 'default'}>
                {branding.isLoading ? 'Loading...' : 'Ready'}
              </Badge>
              <Badge variant="secondary">
                {branding.availableBrands.length} Brands Available
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceView('desktop')}
                className={deviceView === 'desktop' ? 'bg-accent' : ''}
              >
                <Monitor className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceView('tablet')}
                className={deviceView === 'tablet' ? 'bg-accent' : ''}
              >
                <Tablet className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeviceView('mobile')}
                className={deviceView === 'mobile' ? 'bg-accent' : ''}
              >
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Demo Tabs */}
      <Tabs value={selectedDemo} onValueChange={setSelectedDemo}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="switcher">Switcher</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <BrandOverviewDemo branding={branding} deviceView={deviceView} />
        </TabsContent>

        {/* Brand Switcher Tab */}
        <TabsContent value="switcher">
          <BrandSwitcherDemo branding={branding} />
        </TabsContent>

        {/* Assets Tab */}
        <TabsContent value="assets">
          <AssetsDemo branding={branding} />
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors">
          <ColorsDemo branding={branding} />
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography">
          <TypographyDemo branding={branding} />
        </TabsContent>

        {/* Control Panel Tab */}
        <TabsContent value="control">
          <ControlPanelDemo branding={branding} />
        </TabsContent>
      </Tabs>

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs overflow-auto bg-muted p-4 rounded">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Brand Overview Demo
 */
interface DemoProps {
  branding: ReturnType<typeof useFullBranding>;
  deviceView?: string;
}

function BrandOverviewDemo({ branding, deviceView }: DemoProps) {
  const { activeBrand } = branding;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Brand Identity Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Brand Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <BrandLogo variant="main" className="w-16 h-16" />
            <div>
              <h3 className="text-lg font-semibold">{activeBrand.displayName}</h3>
              <p className="text-sm text-muted-foreground">{activeBrand.description}</p>
              <p className="text-xs text-muted-foreground">
                Company: {activeBrand.companyName} | Version: {activeBrand.version}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>App Title:</strong> {activeBrand.appTitle}
            </div>
            <div>
              <strong>Customizable:</strong> {activeBrand.isCustomizable ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Theme ID:</strong> {activeBrand.themeIntegration.themeId}
            </div>
            <div>
              <strong>Preferred Mode:</strong> {activeBrand.themeIntegration.preferredMode}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 space-y-4" style={{
            backgroundColor: branding.getColor('ui.panel.background'),
            borderColor: branding.getColor('ui.panel.border'),
            color: branding.getColor('text.primary'),
          }}>
            {/* Mock Application Interface */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandLogo variant="icon" className="w-6 h-6" />
                <span className="font-medium">{activeBrand.appTitle}</span>
              </div>
              <Button size="sm" style={{
                backgroundColor: branding.getColor('primary.600'),
                color: branding.getColor('text.inverse'),
              }}>
                New Flow
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded border" style={{
                backgroundColor: branding.getColor('steps.primary'),
                color: 'white',
              }}>
                Process Step
              </div>
              <div className="p-3 rounded border" style={{
                backgroundColor: branding.getColor('steps.human'),
                color: 'white',
              }}>
                Human Task
              </div>
            </div>

            <div className="text-xs text-center" style={{
              color: branding.getColor('text.secondary'),
            }}>
              Preview of branded interface components
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Brand Switcher Demo
 */
function BrandSwitcherDemo({ branding }: DemoProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Switcher Component</CardTitle>
          <CardDescription>
            Interactive brand switching with real-time preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandSwitcher
            showPreview={true}
            showDescription={true}
            allowCustomBrands={true}
            onBrandChange={(brand) => {
              console.log('Brand changed to:', brand.displayName);
            }}
          />
        </CardContent>
      </Card>

      {/* Switching Status */}
      {branding.isSwitching && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Switching brands... Please wait.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

/**
 * Assets Demo
 */
function AssetsDemo({ branding }: DemoProps) {
  const { assets, preloadAssets, isAssetsLoading } = branding;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Brand Assets</h3>
        <Button 
          onClick={() => preloadAssets()}
          disabled={isAssetsLoading}
          size="sm"
        >
          {isAssetsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Preload Assets
        </Button>
      </div>

      {/* Logo Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Logo Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="border rounded-lg p-4 h-24 flex items-center justify-center">
                <BrandLogo variant="main" className="max-w-full max-h-full" />
              </div>
              <p className="text-sm font-medium">Main Logo</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="border rounded-lg p-4 h-24 flex items-center justify-center">
                <BrandLogo variant="icon" className="max-w-full max-h-full" />
              </div>
              <p className="text-sm font-medium">Icon</p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="border rounded-lg p-4 h-24 flex items-center justify-center">
                <BrandLogo variant="iconSmall" className="max-w-full max-h-full" />
              </div>
              <p className="text-sm font-medium">Small Icon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset URLs */}
      <Card>
        <CardHeader>
          <CardTitle>Asset URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm font-mono">
            <div><strong>Main:</strong> {assets.logo.main}</div>
            <div><strong>Icon:</strong> {assets.logo.icon}</div>
            <div><strong>Small:</strong> {assets.logo.iconSmall}</div>
            {assets.logo.favicon && (
              <div><strong>Favicon:</strong> {assets.logo.favicon}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Colors Demo
 */
function ColorsDemo({ branding }: DemoProps) {
  const { colors, getColor, semanticColors, customColors } = branding;
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Color System</h3>
        <div className="flex items-center gap-2">
          <Button
            variant={mode === 'light' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('light')}
          >
            <Sun className="w-4 h-4" />
          </Button>
          <Button
            variant={mode === 'dark' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMode('dark')}
          >
            <Moon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Primary Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(colors[mode].primary).map(([shade, color]) => (
              <div key={shade} className="text-center space-y-1">
                <div
                  className="w-full h-12 rounded border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <p className="text-xs font-mono">{shade}</p>
                <p className="text-xs font-mono text-muted-foreground">{color}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Step Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(colors[mode].steps).map(([step, color]) => (
              <div key={step} className="text-center space-y-1">
                <div
                  className="w-full h-12 rounded border"
                  style={{ backgroundColor: color }}
                  title={color}
                />
                <p className="text-xs font-medium">{step}</p>
                <p className="text-xs font-mono text-muted-foreground">{color}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Semantic Colors */}
      {Object.keys(semanticColors).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Semantic Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(semanticColors).map(([name, color]) => (
                <div key={name} className="text-center space-y-1">
                  <div
                    className="w-full h-12 rounded border"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                  <p className="text-xs font-medium">{name}</p>
                  <p className="text-xs font-mono text-muted-foreground">{color}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Typography Demo
 */
function TypographyDemo({ branding }: DemoProps) {
  const { typography, getFontFamily, getFontSize, getFontWeight } = branding;

  return (
    <div className="space-y-6">
      {/* Font Families */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Font Families
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div style={{ fontFamily: getFontFamily('primary') }}>
            <strong>Primary Font:</strong> The quick brown fox jumps over the lazy dog
            <br />
            <span className="text-sm text-muted-foreground">{getFontFamily('primary')}</span>
          </div>
          
          <div style={{ fontFamily: getFontFamily('secondary') }}>
            <strong>Secondary Font:</strong> The quick brown fox jumps over the lazy dog
            <br />
            <span className="text-sm text-muted-foreground">{getFontFamily('secondary')}</span>
          </div>
          
          <div style={{ fontFamily: getFontFamily('monospace') }}>
            <strong>Monospace Font:</strong> The quick brown fox jumps over the lazy dog
            <br />
            <span className="text-sm text-muted-foreground">{getFontFamily('monospace')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Font Sizes */}
      <Card>
        <CardHeader>
          <CardTitle>Font Sizes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(typography.fontSizes).map(([size, value]) => (
            <div key={size} className="flex items-center gap-4">
              <span 
                className="font-medium"
                style={{ fontSize: value }}
              >
                Sample Text ({size})
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Font Weights */}
      <Card>
        <CardHeader>
          <CardTitle>Font Weights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(typography.fontWeights).map(([weight, value]) => (
            <div key={weight} className="flex items-center gap-4">
              <span 
                style={{ fontWeight: value }}
              >
                Sample Text ({weight})
              </span>
              <span className="text-sm text-muted-foreground font-mono">
                {value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Control Panel Demo
 */
function ControlPanelDemo({ branding }: DemoProps) {
  return (
    <div className="space-y-4">
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          The control panel allows comprehensive brand management including 
          colors, typography, assets, and configuration. Only customizable brands can be edited.
        </AlertDescription>
      </Alert>

      <BrandControlPanel
        brandId={branding.activeBrand.id}
        onBrandUpdate={(brand) => {
          console.log('Brand updated:', brand.displayName);
        }}
      />
    </div>
  );
}

export default BrandingDemo;