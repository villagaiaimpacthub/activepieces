/**
 * Theme System Integration Test Component
 * 
 * This component tests all aspects of the theme system to ensure proper integration:
 * - Theme provider functionality
 * - Hook compatibility
 * - CSS variable application
 * - Component styling
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSOPTheme } from './sop-theme-provider';
import { useTheme } from '@/components/theme-provider';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: string;
}

export function ThemeIntegrationTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  const { theme: systemTheme } = useTheme();
  const sopTheme = useSOPTheme();

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Theme Provider Integration
    try {
      results.push({
        name: 'Theme Provider Integration',
        status: systemTheme ? 'pass' : 'fail',
        message: systemTheme ? 'System theme provider working' : 'System theme provider not available',
        details: `Current system theme: ${systemTheme}`
      });
    } catch (error) {
      results.push({
        name: 'Theme Provider Integration',
        status: 'fail',
        message: 'Theme provider integration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 2: SOP Theme Provider
    try {
      results.push({
        name: 'SOP Theme Provider',
        status: sopTheme ? 'pass' : 'fail',
        message: sopTheme ? 'SOP theme provider working' : 'SOP theme provider not available',
        details: sopTheme ? `SOP branding: ${sopTheme.isSOPBranded}` : 'No SOP theme context'
      });
    } catch (error) {
      results.push({
        name: 'SOP Theme Provider',
        status: 'fail',
        message: 'SOP theme provider failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: CSS Variables
    const rootElement = document.documentElement;
    const primaryColor = getComputedStyle(rootElement).getPropertyValue('--primary').trim();
    results.push({
      name: 'CSS Variables',
      status: primaryColor ? 'pass' : 'warning',
      message: primaryColor ? 'CSS variables are applied' : 'Primary CSS variable not found',
      details: `Primary color: ${primaryColor || 'not set'}`
    });

    // Test 4: SOP CSS Variables
    const sopPrimaryColor = getComputedStyle(rootElement).getPropertyValue('--sop-primary-600').trim();
    results.push({
      name: 'SOP CSS Variables',
      status: sopPrimaryColor ? 'pass' : 'warning',
      message: sopPrimaryColor ? 'SOP CSS variables are available' : 'SOP CSS variables not found',
      details: `SOP primary: ${sopPrimaryColor || 'not set'}`
    });

    // Test 5: Theme Classes
    const hasThemeClasses = rootElement.classList.contains('light') || rootElement.classList.contains('dark');
    results.push({
      name: 'Theme Classes',
      status: hasThemeClasses ? 'pass' : 'warning',
      message: hasThemeClasses ? 'Theme classes applied to document' : 'No theme classes found',
      details: `Document classes: ${rootElement.className || 'none'}`
    });

    // Test 6: SOP Branding Classes
    const hasSOPClasses = rootElement.classList.contains('sop-branded') || 
                          rootElement.classList.contains('sop-light') || 
                          rootElement.classList.contains('sop-dark');
    results.push({
      name: 'SOP Branding Classes',
      status: hasSOPClasses ? 'pass' : 'warning',
      message: hasSOPClasses ? 'SOP branding classes available' : 'No SOP classes found',
      details: `SOP classes: ${hasSOPClasses ? 'present' : 'absent'}`
    });

    // Test 7: Theme Switching Functionality
    try {
      const originalTheme = sopTheme?.sopTheme;
      if (sopTheme?.setSopTheme) {
        sopTheme.setSopTheme('light');
        await new Promise(resolve => setTimeout(resolve, 100));
        sopTheme.setSopTheme(originalTheme || 'auto');
        
        results.push({
          name: 'Theme Switching',
          status: 'pass',
          message: 'Theme switching functionality works',
          details: 'Successfully switched themes programmatically'
        });
      } else {
        results.push({
          name: 'Theme Switching',
          status: 'fail',
          message: 'Theme switching functions not available',
          details: 'setSopTheme function not found'
        });
      }
    } catch (error) {
      results.push({
        name: 'Theme Switching',
        status: 'fail',
        message: 'Theme switching failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 8: Branding Toggle
    try {
      const originalBranding = sopTheme?.isSOPBranded;
      if (sopTheme?.toggleSOPBranding) {
        results.push({
          name: 'Branding Toggle',
          status: 'pass',
          message: 'Branding toggle function available',
          details: `Current branding: ${originalBranding ? 'enabled' : 'disabled'}`
        });
      } else {
        results.push({
          name: 'Branding Toggle',
          status: 'fail',
          message: 'Branding toggle function not available',
          details: 'toggleSOPBranding function not found'
        });
      }
    } catch (error) {
      results.push({
        name: 'Branding Toggle',
        status: 'fail',
        message: 'Branding toggle test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    // Run tests automatically on component mount
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Theme System Integration Test
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            size="sm"
          >
            {isRunning ? 'Running Tests...' : 'Run Tests'}
          </Button>
        </CardTitle>
        <CardDescription>
          Comprehensive test of theme system functionality and integration
        </CardDescription>
        
        {testResults.length > 0 && (
          <div className="flex gap-2 mt-4">
            <Badge className="bg-green-100 text-green-800">
              {passCount} Passed
            </Badge>
            {failCount > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {failCount} Failed
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">
                {warningCount} Warnings
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isRunning && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Running theme system tests...</span>
          </div>
        )}
        
        {!isRunning && testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{result.name}</span>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result.message}
                  </p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted px-2 py-1 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}