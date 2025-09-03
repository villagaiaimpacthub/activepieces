/**
 * Brand Control Panel Component
 * 
 * This component provides a comprehensive UI for brand management:
 * - Real-time brand configuration editing
 * - Color scheme and typography adjustments
 * - Asset management and previews
 * - Brand export/import functionality
 * - Live preview of changes
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Advanced branding management interface
 */

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Image, 
  Settings, 
  Download, 
  Upload, 
  Save, 
  Undo2, 
  Eye,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBrandManagement, useBrandColors, useBrandTypography } from '@/hooks/use-branding';
import { BrandConfiguration } from '@/lib/branding/branding-service';

interface BrandControlPanelProps {
  brandId?: string;
  onClose?: () => void;
  onBrandUpdate?: (brand: BrandConfiguration) => void;
  className?: string;
}

/**
 * Brand Control Panel Component
 */
export function BrandControlPanel({
  brandId,
  onClose,
  onBrandUpdate,
  className,
}: BrandControlPanelProps) {
  const {
    activeBrand,
    availableBrands,
    updateBrand,
    exportBrand,
    importBrand,
    isLoading,
  } = useBrandManagement();

  const { colors } = useBrandColors();
  const { typography } = useBrandTypography();

  const [selectedBrand, setSelectedBrand] = useState<BrandConfiguration>(
    brandId ? availableBrands.find(b => b.id === brandId) || activeBrand : activeBrand
  );
  const [editingBrand, setEditingBrand] = useState<BrandConfiguration>({ ...selectedBrand });
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Update editing brand when selected brand changes
  useEffect(() => {
    setEditingBrand({ ...selectedBrand });
    setHasChanges(false);
  }, [selectedBrand]);

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(editingBrand) !== JSON.stringify(selectedBrand);
    setHasChanges(changed);
  }, [editingBrand, selectedBrand]);

  /**
   * Update field in editing brand
   */
  const updateField = useCallback((path: string, value: any) => {
    setEditingBrand(prev => {
      const newBrand = { ...prev };
      const pathParts = path.split('.');
      let current = newBrand;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]] = { ...current[pathParts[i]] };
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      return newBrand;
    });
  }, []);

  /**
   * Save changes to brand
   */
  const saveChanges = useCallback(async () => {
    try {
      const success = await updateBrand(editingBrand.id, editingBrand);
      if (success) {
        setSelectedBrand({ ...editingBrand });
        setMessage({ type: 'success', text: 'Brand updated successfully!' });
        onBrandUpdate?.(editingBrand);
      } else {
        setMessage({ type: 'error', text: 'Failed to update brand' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    setTimeout(() => setMessage(null), 3000);
  }, [editingBrand, updateBrand, onBrandUpdate]);

  /**
   * Discard changes
   */
  const discardChanges = useCallback(() => {
    setEditingBrand({ ...selectedBrand });
    setMessage({ type: 'success', text: 'Changes discarded' });
    setTimeout(() => setMessage(null), 2000);
  }, [selectedBrand]);

  /**
   * Export brand configuration
   */
  const handleExport = useCallback(() => {
    try {
      const config = exportBrand(selectedBrand.id);
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedBrand.name}-brand-config.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Brand configuration exported!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export brand configuration' });
      setTimeout(() => setMessage(null), 3000);
    }
  }, [exportBrand, selectedBrand]);

  /**
   * Import brand configuration
   */
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        const success = await importBrand(config);
        
        if (success) {
          setMessage({ type: 'success', text: 'Brand configuration imported successfully!' });
        } else {
          setMessage({ type: 'error', text: 'Failed to import brand configuration' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Invalid brand configuration file' });
      }
      
      setTimeout(() => setMessage(null), 3000);
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  }, [importBrand]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Brand Control Panel</h2>
          {editingBrand.isCustomizable && (
            <Badge variant="secondary">Customizable</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Switch
            checked={previewMode}
            onCheckedChange={setPreviewMode}
          />
          <Label htmlFor="preview-mode" className="text-sm">
            Live Preview
          </Label>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <Alert>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Brand Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Brand</CardTitle>
          <CardDescription>Choose a brand to configure</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedBrand.id}
            onValueChange={(value) => {
              const brand = availableBrands.find(b => b.id === value);
              if (brand) setSelectedBrand(brand);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableBrands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  <div className="flex items-center gap-2">
                    <img
                      src={brand.assets.logo.iconSmall}
                      alt=""
                      className="w-4 h-4"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    {brand.displayName}
                    {brand.isCustomizable && (
                      <Badge variant="outline" className="text-xs">Custom</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        {/* Basic Configuration */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Configure basic brand information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={editingBrand.displayName}
                    onChange={(e) => updateField('displayName', e.target.value)}
                    disabled={!editingBrand.isCustomizable}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={editingBrand.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    disabled={!editingBrand.isCustomizable}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appTitle">Application Title</Label>
                <Input
                  id="appTitle"
                  value={editingBrand.appTitle}
                  onChange={(e) => updateField('appTitle', e.target.value)}
                  disabled={!editingBrand.isCustomizable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="appDescription">Application Description</Label>
                <Textarea
                  id="appDescription"
                  value={editingBrand.appDescription}
                  onChange={(e) => updateField('appDescription', e.target.value)}
                  disabled={!editingBrand.isCustomizable}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Brand Description</Label>
                <Textarea
                  id="description"
                  value={editingBrand.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  disabled={!editingBrand.isCustomizable}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Colors Configuration */}
        <TabsContent value="colors">
          <ColorConfiguration
            brand={editingBrand}
            onUpdate={updateField}
            disabled={!editingBrand.isCustomizable}
          />
        </TabsContent>

        {/* Typography Configuration */}
        <TabsContent value="typography">
          <TypographyConfiguration
            brand={editingBrand}
            onUpdate={updateField}
            disabled={!editingBrand.isCustomizable}
          />
        </TabsContent>

        {/* Assets Configuration */}
        <TabsContent value="assets">
          <AssetsConfiguration
            brand={editingBrand}
            onUpdate={updateField}
            disabled={!editingBrand.isCustomizable}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <label>
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={discardChanges}
                className="flex items-center gap-2"
              >
                <Undo2 className="w-4 h-4" />
                Discard
              </Button>
              
              <Button
                onClick={saveChanges}
                disabled={isLoading || !editingBrand.isCustomizable}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Color Configuration Component
 */
interface ColorConfigurationProps {
  brand: BrandConfiguration;
  onUpdate: (path: string, value: any) => void;
  disabled: boolean;
}

function ColorConfiguration({ brand, onUpdate, disabled }: ColorConfigurationProps) {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Colors
            </CardTitle>
            <CardDescription>Configure brand colors and themes</CardDescription>
          </div>
          
          <Select value={mode} onValueChange={(value: 'light' | 'dark') => setMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary Colors */}
        <div className="space-y-3">
          <h4 className="font-medium">Primary Colors</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(brand.colors[mode].primary).map(([shade, color]) => (
              <div key={shade} className="space-y-1">
                <Label className="text-xs">{shade}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => onUpdate(`colors.${mode}.primary.${shade}`, e.target.value)}
                    disabled={disabled}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <Input
                    value={color}
                    onChange={(e) => onUpdate(`colors.${mode}.primary.${shade}`, e.target.value)}
                    disabled={disabled}
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Accent Colors */}
        <div className="space-y-3">
          <h4 className="font-medium">Accent Colors</h4>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(brand.colors[mode].accent).map(([shade, color]) => (
              <div key={shade} className="space-y-1">
                <Label className="text-xs">{shade}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => onUpdate(`colors.${mode}.accent.${shade}`, e.target.value)}
                    disabled={disabled}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <Input
                    value={color}
                    onChange={(e) => onUpdate(`colors.${mode}.accent.${shade}`, e.target.value)}
                    disabled={disabled}
                    className="text-xs"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Step Colors */}
        <div className="space-y-3">
          <h4 className="font-medium">Step Colors</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(brand.colors[mode].steps).map(([step, color]) => (
              <div key={step} className="space-y-2">
                <Label>{step.charAt(0).toUpperCase() + step.slice(1)}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => onUpdate(`colors.${mode}.steps.${step}`, e.target.value)}
                    disabled={disabled}
                    className="w-8 h-8 p-0 border-0"
                  />
                  <Input
                    value={color}
                    onChange={(e) => onUpdate(`colors.${mode}.steps.${step}`, e.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Typography Configuration Component
 */
interface TypographyConfigurationProps {
  brand: BrandConfiguration;
  onUpdate: (path: string, value: any) => void;
  disabled: boolean;
}

function TypographyConfiguration({ brand, onUpdate, disabled }: TypographyConfigurationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          Typography
        </CardTitle>
        <CardDescription>Configure fonts and text styling</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Font Families */}
        <div className="space-y-3">
          <h4 className="font-medium">Font Families</h4>
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(brand.typography.fontFamily).map(([type, font]) => (
              <div key={type} className="space-y-2">
                <Label>{type.charAt(0).toUpperCase() + type.slice(1)} Font</Label>
                <Input
                  value={font}
                  onChange={(e) => onUpdate(`typography.fontFamily.${type}`, e.target.value)}
                  disabled={disabled}
                  placeholder="e.g., Inter, system-ui, sans-serif"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Font Sizes */}
        <div className="space-y-3">
          <h4 className="font-medium">Font Sizes</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(brand.typography.fontSizes).map(([size, value]) => (
              <div key={size} className="space-y-2">
                <Label>{size}</Label>
                <Input
                  value={value}
                  onChange={(e) => onUpdate(`typography.fontSizes.${size}`, e.target.value)}
                  disabled={disabled}
                  placeholder="e.g., 1rem"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Font Weights */}
        <div className="space-y-3">
          <h4 className="font-medium">Font Weights</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(brand.typography.fontWeights).map(([weight, value]) => (
              <div key={weight} className="space-y-2">
                <Label>{weight.charAt(0).toUpperCase() + weight.slice(1)}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => onUpdate(`typography.fontWeights.${weight}`, parseInt(e.target.value))}
                  disabled={disabled}
                  min={100}
                  max={900}
                  step={100}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Assets Configuration Component
 */
interface AssetsConfigurationProps {
  brand: BrandConfiguration;
  onUpdate: (path: string, value: any) => void;
  disabled: boolean;
}

function AssetsConfiguration({ brand, onUpdate, disabled }: AssetsConfigurationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-4 h-4" />
          Assets
        </CardTitle>
        <CardDescription>Configure brand logos, icons, and images</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Logo Assets */}
        <div className="space-y-3">
          <h4 className="font-medium">Logo Assets</h4>
          <div className="space-y-4">
            {Object.entries(brand.assets.logo).map(([type, url]) => (
              <div key={type} className="space-y-2">
                <Label>{type.charAt(0).toUpperCase() + type.slice(1)}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={url}
                    onChange={(e) => onUpdate(`assets.logo.${type}`, e.target.value)}
                    disabled={disabled}
                    placeholder="Asset URL"
                  />
                  {url && (
                    <img
                      src={url}
                      alt={type}
                      className="w-8 h-8 object-contain border rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Background Images */}
        <div className="space-y-3">
          <h4 className="font-medium">Background Images</h4>
          <div className="space-y-4">
            {brand.assets.images.loginBackground && (
              <div className="space-y-2">
                <Label>Login Background</Label>
                <Input
                  value={brand.assets.images.loginBackground}
                  onChange={(e) => onUpdate('assets.images.loginBackground', e.target.value)}
                  disabled={disabled}
                  placeholder="Login background URL"
                />
              </div>
            )}
            
            {brand.assets.images.dashboardHeader && (
              <div className="space-y-2">
                <Label>Dashboard Header</Label>
                <Input
                  value={brand.assets.images.dashboardHeader}
                  onChange={(e) => onUpdate('assets.images.dashboardHeader', e.target.value)}
                  disabled={disabled}
                  placeholder="Dashboard header URL"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}