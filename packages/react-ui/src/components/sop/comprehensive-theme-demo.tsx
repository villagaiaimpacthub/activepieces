/**
 * Comprehensive Theme System Demo
 * 
 * This component demonstrates all aspects of the theme system:
 * - Theme switching between Activepieces and SOP
 * - Mode switching (light/dark/auto)
 * - Custom branding toggle
 * - Live preview of all theme colors
 * - Component styling examples
 */

import React, { useState } from 'react';
import { 
  Palette, 
  Monitor, 
  Sun, 
  Moon, 
  Eye,
  Settings,
  Layout,
  Sidebar,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Star,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedThemeSwitcher } from './enhanced-theme-switcher';
import { useThemeManager, useThemeClasses, useThemeStyles } from '@/hooks/use-theme-manager';

export function ComprehensiveThemeDemo() {
  const {
    currentTheme,
    currentMode,
    isCustomBranded,
    effectiveMode,
    availableThemes,
  } = useThemeManager();
  
  const themeClasses = useThemeClasses();
  const themeStyles = useThemeStyles();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Theme System Demo</h1>
            <p className="text-muted-foreground">
              Comprehensive demonstration of the Activepieces theme system
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isCustomBranded ? "default" : "secondary"}>
              {currentTheme.name}
            </Badge>
            <Badge variant="outline">
              {effectiveMode}
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="layouts">Layouts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Theme Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Current Theme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme Name</Label>
                    <div className="font-medium">{currentTheme.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {currentTheme.description}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <div className="flex items-center gap-2">
                      {currentMode === 'light' && <Sun className="h-4 w-4" />}
                      {currentMode === 'dark' && <Moon className="h-4 w-4" />}
                      {currentMode === 'auto' && <Monitor className="h-4 w-4" />}
                      <span className="capitalize">{currentMode}</span>
                      {currentMode === 'auto' && (
                        <Badge variant="outline" className="text-xs">
                          {effectiveMode}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Custom Branding</Label>
                    <div className="flex items-center gap-2">
                      <Switch checked={isCustomBranded} readOnly />
                      <span>{isCustomBranded ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Themes */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Themes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.values(availableThemes).map((theme) => (
                    <div 
                      key={theme.id}
                      className={`p-3 rounded-lg border ${
                        currentTheme.id === theme.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {theme.description}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: theme.light.primary[600] }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ backgroundColor: theme.light.accent[500] }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Quick Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div 
                      className="aspect-square rounded border flex items-center justify-center"
                      style={{ backgroundColor: themeStyles.primary }}
                    >
                      <Circle className="h-4 w-4 text-white" />
                    </div>
                    <div 
                      className="aspect-square rounded border flex items-center justify-center"
                      style={{ backgroundColor: themeStyles.stepHuman }}
                    >
                      <Square className="h-4 w-4 text-white" />
                    </div>
                    <div 
                      className="aspect-square rounded border flex items-center justify-center"
                      style={{ backgroundColor: themeStyles.stepCompliance }}
                    >
                      <Triangle className="h-4 w-4 text-white" />
                    </div>
                    <div 
                      className="aspect-square rounded border flex items-center justify-center"
                      style={{ backgroundColor: themeStyles.stepIntegration }}
                    >
                      <Hexagon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      Primary Button
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      Outline Button
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Primary Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Primary Colors</CardTitle>
                  <CardDescription>Brand primary color palette</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(currentTheme[effectiveMode].primary).map(([shade, color]) => (
                      <div key={shade} className="space-y-2">
                        <div 
                          className="aspect-square rounded border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-mono">{shade}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {color}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Accent Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Accent Colors</CardTitle>
                  <CardDescription>Secondary accent color palette</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(currentTheme[effectiveMode].accent).map(([shade, color]) => (
                      <div key={shade} className="space-y-2">
                        <div 
                          className="aspect-square rounded border shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <div className="text-center">
                          <div className="text-xs font-mono">{shade}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {color}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>Process Step Colors</CardTitle>
                  <CardDescription>Colors for different process step types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(currentTheme[effectiveMode].steps).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-3">
                        <div 
                          className="w-8 h-8 rounded border flex items-center justify-center"
                          style={{ backgroundColor: color }}
                        >
                          {type === 'primary' && <Circle className="h-4 w-4 text-white" />}
                          {type === 'human' && <Star className="h-4 w-4 text-white" />}
                          {type === 'compliance' && <Triangle className="h-4 w-4 text-white" />}
                          {type === 'integration' && <Hexagon className="h-4 w-4 text-white" />}
                          {type === 'conditional' && <Heart className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium capitalize">{type}</div>
                          <div className="text-sm font-mono text-muted-foreground">{color}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* UI Colors */}
              <Card>
                <CardHeader>
                  <CardTitle>UI Colors</CardTitle>
                  <CardDescription>Interface element colors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label>Sidebar</Label>
                      <div 
                        className="h-16 rounded border p-3 flex items-center"
                        style={{ 
                          backgroundColor: currentTheme[effectiveMode].ui.sidebar.background,
                          borderColor: currentTheme[effectiveMode].ui.sidebar.border 
                        }}
                      >
                        <Sidebar className="h-5 w-5" style={{ color: currentTheme[effectiveMode].text.primary }} />
                        <span className="ml-2 text-sm" style={{ color: currentTheme[effectiveMode].text.primary }}>
                          Sidebar Background
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Canvas</Label>
                      <div 
                        className="h-16 rounded border p-3 flex items-center"
                        style={{ 
                          backgroundColor: currentTheme[effectiveMode].ui.canvas.background,
                          backgroundImage: `radial-gradient(circle, ${currentTheme[effectiveMode].ui.canvas.grid} 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }}
                      >
                        <Layout className="h-5 w-5" style={{ color: currentTheme[effectiveMode].text.primary }} />
                        <span className="ml-2 text-sm" style={{ color: currentTheme[effectiveMode].text.primary }}>
                          Canvas Background
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>Button variants with current theme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button className="w-full">Default Button</Button>
                    <Button variant="outline" className="w-full">Outline Button</Button>
                    <Button variant="secondary" className="w-full">Secondary Button</Button>
                    <Button variant="ghost" className="w-full">Ghost Button</Button>
                    <Button variant="destructive" className="w-full">Destructive Button</Button>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Cards & Panels</CardTitle>
                  <CardDescription>Card components with theme styling</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Card style={themeStyles.getComponentStyles('panel')}>
                    <CardContent className="p-4">
                      <div className="font-medium">Themed Panel</div>
                      <div className="text-sm opacity-75 mt-1">
                        Panel using theme panel styles
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div 
                    className="p-4 rounded-lg border"
                    style={themeStyles.getComponentStyles('canvas')}
                  >
                    <div className="font-medium">Canvas Area</div>
                    <div className="text-sm opacity-75 mt-1">
                      Canvas with grid background
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Layouts Tab */}
          <TabsContent value="layouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Layout Preview</CardTitle>
                <CardDescription>How the theme affects different layout components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden">
                  <div className="h-12 flex items-center px-4" style={themeStyles.getComponentStyles('panel')}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: themeStyles.primary }} />
                      <span className="font-medium">Header Navigation</span>
                    </div>
                  </div>
                  <div className="flex h-48">
                    <div className="w-56 p-4" style={themeStyles.getComponentStyles('sidebar')}>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Sidebar</div>
                        <div className="space-y-1">
                          <div className="h-6 rounded" style={{ backgroundColor: themeStyles.primary, opacity: 0.1 }} />
                          <div className="h-6 rounded" style={{ backgroundColor: themeStyles.accent, opacity: 0.1 }} />
                          <div className="h-6 rounded" style={{ backgroundColor: themeStyles.accent, opacity: 0.1 }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 p-4" style={themeStyles.getComponentStyles('canvas')}>
                      <div className="text-sm font-medium mb-2">Main Canvas</div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 rounded border bg-white/50 flex items-center justify-center">
                          <Circle className="h-6 w-6" style={{ color: themeStyles.stepPrimary }} />
                        </div>
                        <div className="h-16 rounded border bg-white/50 flex items-center justify-center">
                          <Square className="h-6 w-6" style={{ color: themeStyles.stepHuman }} />
                        </div>
                        <div className="h-16 rounded border bg-white/50 flex items-center justify-center">
                          <Triangle className="h-6 w-6" style={{ color: themeStyles.stepCompliance }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedThemeSwitcher 
                variant="card" 
                showAdvanced={true} 
                showPreview={true}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Theme Information</CardTitle>
                  <CardDescription>Current theme configuration details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Configuration</Label>
                    <div className="font-mono text-sm bg-muted p-3 rounded">
                      {JSON.stringify({
                        theme: currentTheme.id,
                        mode: currentMode,
                        effective: effectiveMode,
                        branded: isCustomBranded
                      }, null, 2)}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>CSS Classes</Label>
                    <div className="text-sm">
                      <Badge variant="outline" className="mr-2">{themeClasses.theme}</Badge>
                      <Badge variant="outline" className="mr-2">{themeClasses.mode}</Badge>
                      <Badge variant="outline">{themeClasses.branded}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}