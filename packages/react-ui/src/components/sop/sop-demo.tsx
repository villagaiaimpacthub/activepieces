import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSOPTheme, useSOPStyles } from './sop-theme-provider';
import { SOPThemeSwitcher } from './sop-theme-switcher';

export function SOPThemeDemo() {
  const { isSOPBranded, sopTheme } = useSOPTheme();
  const { getSOPClass } = useSOPStyles();

  return (
    <div className="p-6 space-y-6">
      <Card className={getSOPClass('border', 'border-sop-primary-200')}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            SOP Theme System Demo
            <Badge variant={isSOPBranded ? 'default' : 'secondary'}>
              {isSOPBranded ? 'SOP Active' : 'Default Theme'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              This demo shows the SOP theme system in action. Toggle the SOP branding
              to see the visual changes applied to components.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Current Status</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    Theme Mode: <span className="font-mono">{sopTheme}</span>
                  </li>
                  <li>
                    SOP Branding: <span className="font-mono">
                      {isSOPBranded ? 'enabled' : 'disabled'}
                    </span>
                  </li>
                  <li>
                    CSS Class: <span className="font-mono">
                      {isSOPBranded ? 'sop-branded' : 'default'}
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Color Samples</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className="h-8 rounded border" 
                    style={{ backgroundColor: 'var(--primary)' }}
                    title="Primary Color"
                  />
                  <div 
                    className="h-8 rounded border" 
                    style={{ backgroundColor: 'var(--sop-primary-600)' }}
                    title="SOP Primary Color"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Theme Controls</h4>
            <SOPThemeSwitcher variant="button" />
          </div>

          <div className="flex gap-2">
            <Button variant="default">Primary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button 
              variant="ghost" 
              className={getSOPClass('', 'sop-brand-text')}
            >
              SOP Styled Button
            </Button>
          </div>

          <div className="p-4 rounded-lg bg-background border">
            <h4 className="font-medium mb-2">SOP Brand Colors</h4>
            <div className="grid grid-cols-5 gap-2">
              {[
                'sop-step-primary',
                'sop-step-human', 
                'sop-step-compliance',
                'sop-step-integration',
                'sop-step-conditional'
              ].map(color => (
                <div key={color} className="text-center">
                  <div 
                    className="h-12 rounded border mb-1" 
                    style={{ backgroundColor: `var(--${color})` }}
                  />
                  <p className="text-xs">{color.replace('sop-step-', '')}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}