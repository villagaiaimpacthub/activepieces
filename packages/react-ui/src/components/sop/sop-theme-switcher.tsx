import React from 'react';
import { Moon, Sun, Monitor, Palette, PaletteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useSOPTheme } from './sop-theme-provider';

interface SOPThemeSwitcherProps {
  variant?: 'button' | 'compact';
  showBrandingToggle?: boolean;
}

export function SOPThemeSwitcher({ 
  variant = 'button',
  showBrandingToggle = true 
}: SOPThemeSwitcherProps) {
  const { 
    sopTheme, 
    setSopTheme, 
    isSOPBranded, 
    toggleSOPBranding 
  } = useSOPTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'System', icon: Monitor },
  ] as const;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
              {sopTheme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : sopTheme === 'light' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSopTheme(option.value)}
                  className={sopTheme === option.value ? 'bg-accent' : ''}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {option.label}
                </DropdownMenuItem>
              );
            })}
            {showBrandingToggle && (
              <>
                <DropdownMenuSeparator />
                <div className="flex items-center justify-between px-2 py-1">
                  <Label htmlFor="sop-branding" className="text-sm font-normal">
                    SOP Branding
                  </Label>
                  <Switch
                    id="sop-branding"
                    checked={isSOPBranded}
                    onCheckedChange={toggleSOPBranding}
                    size="sm"
                  />
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Theme Preference</Label>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = sopTheme === option.value;
            
            return (
              <Button
                key={option.value}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSopTheme(option.value)}
                className="flex flex-col gap-1 h-auto py-3"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {showBrandingToggle && (
        <>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sop-branding-toggle" className="text-sm font-medium">
                  SOP Branding
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable SOP visual identity and color scheme
                </p>
              </div>
              <Switch
                id="sop-branding-toggle"
                checked={isSOPBranded}
                onCheckedChange={toggleSOPBranding}
              />
            </div>
          </div>

          {isSOPBranded && (
            <div className="bg-sop-primary-50 border border-sop-primary-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <PaletteIcon className="h-4 w-4 text-sop-primary-600" />
                <span className="text-sm font-medium text-sop-primary-700">
                  SOP Theme Active
                </span>
              </div>
              <p className="text-xs text-sop-primary-600 mt-1">
                Using professional SOP color scheme and branding
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}