/**
 * Brand Switcher Component
 * 
 * This component provides a UI for switching between available brands:
 * - Visual brand selector with previews
 * - Real-time brand switching
 * - Integration with theme system
 * - Loading and error states
 * 
 * Phase 2 GROUP E - Agent 2 of 2
 * Provides user interface for brand management
 */

import React, { useState, useCallback } from 'react';
import { Check, Palette, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useBrandSwitcher } from '@/hooks/use-branding';
import { BrandConfiguration } from '@/lib/branding/branding-service';

interface BrandSwitcherProps {
  showPreview?: boolean;
  showDescription?: boolean;
  allowCustomBrands?: boolean;
  className?: string;
  onBrandChange?: (brand: BrandConfiguration) => void;
  onError?: (error: string) => void;
}

/**
 * Brand Switcher Component
 */
export function BrandSwitcher({
  showPreview = true,
  showDescription = true,
  allowCustomBrands = true,
  className,
  onBrandChange,
  onError,
}: BrandSwitcherProps) {
  const { 
    activeBrand, 
    availableBrands, 
    switchBrand, 
    isSwitching, 
    error 
  } = useBrandSwitcher();
  
  const [switchingBrandId, setSwitchingBrandId] = useState<string | null>(null);

  const handleBrandSwitch = useCallback(async (brandId: string) => {
    if (brandId === activeBrand.id || isSwitching) return;

    setSwitchingBrandId(brandId);
    
    try {
      const success = await switchBrand(brandId);
      
      if (success) {
        const newBrand = availableBrands.find(b => b.id === brandId);
        if (newBrand) {
          onBrandChange?.(newBrand);
        }
      } else {
        const errorMsg = `Failed to switch to ${brandId} brand`;
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      onError?.(errorMsg);
    } finally {
      setSwitchingBrandId(null);
    }
  }, [activeBrand.id, isSwitching, switchBrand, availableBrands, onBrandChange, onError]);

  // Filter brands based on customization settings
  const filteredBrands = allowCustomBrands 
    ? availableBrands 
    : availableBrands.filter(brand => !brand.isCustomizable);

  // Group brands by type
  const builtInBrands = filteredBrands.filter(brand => !brand.isCustomizable);
  const customBrands = filteredBrands.filter(brand => brand.isCustomizable);

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Brand Theme</h3>
        </div>

        {/* Error Display */}
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Built-in Brands */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Built-in Brands</h4>
          <div className="grid grid-cols-1 gap-3">
            {builtInBrands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                isActive={brand.id === activeBrand.id}
                isLoading={switchingBrandId === brand.id}
                showPreview={showPreview}
                showDescription={showDescription}
                onSelect={() => handleBrandSwitch(brand.id)}
              />
            ))}
          </div>
        </div>

        {/* Custom Brands */}
        {allowCustomBrands && customBrands.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Custom Brands</h4>
              <div className="grid grid-cols-1 gap-3">
                {customBrands.map((brand) => (
                  <BrandCard
                    key={brand.id}
                    brand={brand}
                    isActive={brand.id === activeBrand.id}
                    isLoading={switchingBrandId === brand.id}
                    showPreview={showPreview}
                    showDescription={showDescription}
                    onSelect={() => handleBrandSwitch(brand.id)}
                    isCustom
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* No Custom Brands Message */}
        {allowCustomBrands && customBrands.length === 0 && (
          <>
            <Separator />
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">
                No custom brands available. Create a custom brand to see it here.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Individual Brand Card Component
 */
interface BrandCardProps {
  brand: BrandConfiguration;
  isActive: boolean;
  isLoading: boolean;
  showPreview: boolean;
  showDescription: boolean;
  isCustom?: boolean;
  onSelect: () => void;
}

function BrandCard({
  brand,
  isActive,
  isLoading,
  showPreview,
  showDescription,
  isCustom = false,
  onSelect,
}: BrandCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isActive ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{brand.displayName}</CardTitle>
            {isCustom && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isActive && !isLoading && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </div>
        </div>
        
        {showDescription && (
          <CardDescription className="text-sm">
            {brand.description}
          </CardDescription>
        )}
      </CardHeader>

      {showPreview && (
        <CardContent className="pt-0">
          <BrandPreview brand={brand} />
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Brand Preview Component
 */
interface BrandPreviewProps {
  brand: BrandConfiguration;
}

function BrandPreview({ brand }: BrandPreviewProps) {
  return (
    <div className="space-y-3">
      {/* Logo Preview */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center overflow-hidden">
          <img
            src={brand.assets.logo.icon}
            alt={`${brand.displayName} icon`}
            className="w-6 h-6 object-contain"
            onError={(e) => {
              // Fallback to placeholder
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <span className="font-medium text-sm">{brand.appTitle}</span>
      </div>

      {/* Color Preview */}
      <div className="flex gap-1">
        <div 
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: brand.colors.light.primary[600] }}
          title="Primary Color"
        />
        <div 
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: brand.colors.light.accent[600] }}
          title="Accent Color"
        />
        <div 
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: brand.colors.light.steps.primary }}
          title="Step Color"
        />
      </div>

      {/* App Info */}
      <div className="text-xs text-muted-foreground">
        <p>Company: {brand.companyName}</p>
        <p>Version: {brand.version}</p>
      </div>
    </div>
  );
}

/**
 * Compact Brand Switcher for toolbars/headers
 */
interface CompactBrandSwitcherProps {
  className?: string;
  onBrandChange?: (brand: BrandConfiguration) => void;
}

export function CompactBrandSwitcher({ 
  className, 
  onBrandChange 
}: CompactBrandSwitcherProps) {
  const { activeBrand, availableBrands, switchBrand, isSwitching } = useBrandSwitcher();
  const [isOpen, setIsOpen] = useState(false);

  const handleBrandSelect = useCallback(async (brandId: string) => {
    if (brandId === activeBrand.id) return;

    const success = await switchBrand(brandId);
    if (success) {
      const newBrand = availableBrands.find(b => b.id === brandId);
      if (newBrand) {
        onBrandChange?.(newBrand);
      }
    }
    setIsOpen(false);
  }, [activeBrand.id, switchBrand, availableBrands, onBrandChange]);

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2"
      >
        <img
          src={activeBrand.assets.logo.iconSmall}
          alt="Brand icon"
          className="w-4 h-4"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <span className="text-sm">{activeBrand.displayName}</span>
        {isSwitching && <Loader2 className="w-3 h-3 animate-spin" />}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-popover border rounded-md shadow-lg z-50">
          <div className="p-1">
            {availableBrands.map((brand) => (
              <Button
                key={brand.id}
                variant="ghost"
                size="sm"
                className={`w-full justify-start text-left ${
                  brand.id === activeBrand.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleBrandSelect(brand.id)}
              >
                <img
                  src={brand.assets.logo.iconSmall}
                  alt={`${brand.displayName} icon`}
                  className="w-4 h-4 mr-2"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {brand.displayName}
                {brand.id === activeBrand.id && (
                  <Check className="w-3 h-3 ml-auto" />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export types
export type {
  BrandSwitcherProps,
  CompactBrandSwitcherProps,
};