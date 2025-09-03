/**
 * Enhanced Theme Switcher Component
 * 
 * A comprehensive theme switcher that provides:
 * - Theme selection (Activepieces vs SOP)
 * - Mode selection (light, dark, auto)
 * - Custom branding toggle
 * - Live preview of theme changes
 * - Export/import theme configurations
 */

import React, { useState } from 'react';
import { 
  Monitor, 
  Moon, 
  Sun, 
  Palette, 
  Settings, 
  Download,
  Upload,
  RotateCcw,
  Check,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeManager, useThemeClasses, useThemeStyles } from '@/hooks/use-theme-manager';
import { ThemeMode, availableThemes } from '@/lib/theme-config';

interface EnhancedThemeSwitcherProps {
  variant?: 'compact' | 'card' | 'dropdown';
  showAdvanced?: boolean;
  showPreview?: boolean;
  className?: string;
}

export function EnhancedThemeSwitcher({
  variant = 'card',
  showAdvanced = true,
  showPreview = true,
  className = '',
}: EnhancedThemeSwitcherProps) {
  const {
    currentTheme,
    currentMode,
    isCustomBranded,
    effectiveMode,
    setTheme,
    setMode,
    toggleCustomBranding,
    resetToDefault,
    availableThemes: themes,
  } = useThemeManager();

  const themeClasses = useThemeClasses();
  const themeStyles = useThemeStyles();
  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

  const modeOptions = [
    { value: 'light' as ThemeMode, label: 'Light', icon: Sun },
    { value: 'dark' as ThemeMode, label: 'Dark', icon: Moon },
    { value: 'auto' as ThemeMode, label: 'System', icon: Monitor },
  ];

  // Compact dropdown variant
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Theme settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <Label className="text-sm font-medium">Theme</Label>
            <div className="mt-2 space-y-1">
              {Object.values(themes).map((theme) => (
                <Button
                  key={theme.id}
                  variant={currentTheme.id === theme.id ? "default" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setTheme(theme.id)}
                >
                  {theme.name}
                  {currentTheme.id === theme.id && <Check className="ml-auto h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <Label className="text-sm font-medium">Mode</Label>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {modeOptions.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={currentMode === value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode(value)}
                  className="flex-col gap-1 h-auto py-2"
                >
                  <Icon className="h-3 w-3" />
                  <span className="text-xs">{label}</span>
                </Button>
              ))}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetToDefault}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Compact inline variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {modeOptions.map(({ value, icon: Icon }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentMode === value ? "default" : "ghost"}
                  size="sm"
                  className="h-7 w-7 px-0"
                  onClick={() => setMode(value)}
                >
                  <Icon className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value === 'auto' ? 'System' : value}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isCustomBranded ? "default" : "outline"}
              size="sm"
              className="h-7 px-2"
              onClick={toggleCustomBranding}
            >
              <Palette className="h-3 w-3 mr-1" />
              SOP
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCustomBranded ? 'Disable' : 'Enable'} SOP branding</p>
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  // Full card variant
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Theme Settings
            </CardTitle>
            <CardDescription>
              Customize the appearance and branding
            </CardDescription>
          </div>
          <Badge variant={isCustomBranded ? "default" : "secondary"}>
            {currentTheme.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="theme" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="theme" className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Theme Style</Label>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(themes).map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      currentTheme.id === theme.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setTheme(theme.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">{theme.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {theme.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Color preview */}
                        <div className="flex gap-1">
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ 
                              backgroundColor: theme.light.primary[600] 
                            }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full border"
                            style={{ 
                              backgroundColor: theme.light.accent[400] 
                            }}
                          />
                        </div>
                        {currentTheme.id === theme.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Mode Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Appearance Mode</Label>
              <div className="grid grid-cols-3 gap-3">
                {modeOptions.map(({ value, label, icon: Icon }) => (
                  <Button
                    key={value}
                    variant={currentMode === value ? "default" : "outline"}
                    className="h-auto py-4 flex-col gap-2"
                    onClick={() => setMode(value)}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                    {currentMode === value && value === 'auto' && (
                      <Badge variant="secondary" className="text-xs">
                        {effectiveMode}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Preview Section */}
            {showPreview && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Live Preview</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showPreviewPanel ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  
                  {showPreviewPanel && (
                    <div className="p-4 rounded-lg border bg-card space-y-3">
                      <div className="text-sm font-medium">Color Palette</div>
                      <div className="grid grid-cols-5 gap-2">
                        <div className="space-y-1">
                          <div 
                            className="w-full h-8 rounded border"
                            style={{ backgroundColor: themeStyles.primary }}
                          />
                          <div className="text-xs text-center">Primary</div>
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="w-full h-8 rounded border"
                            style={{ backgroundColor: themeStyles.accent }}
                          />
                          <div className="text-xs text-center">Accent</div>
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="w-full h-8 rounded border"
                            style={{ backgroundColor: themeStyles.stepCompliance }}
                          />
                          <div className="text-xs text-center">Success</div>
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="w-full h-8 rounded border"
                            style={{ backgroundColor: themeStyles.stepHuman }}
                          />
                          <div className="text-xs text-center">Warning</div>
                        </div>
                        <div className="space-y-1">
                          <div 
                            className="w-full h-8 rounded border"
                            style={{ backgroundColor: themeStyles.stepConditional }}
                          />
                          <div className="text-xs text-center">Error</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {showAdvanced && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Custom Branding</Label>
                    <div className="text-sm text-muted-foreground">
                      Override default colors with custom branding
                    </div>
                  </div>
                  <Switch
                    checked={isCustomBranded}
                    onCheckedChange={toggleCustomBranding}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Export Theme
                  </Button>
                  <Button variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Theme
                  </Button>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={resetToDefault}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}